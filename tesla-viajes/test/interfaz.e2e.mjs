// Prueba de la interfaz de punta a punta en Chromium, sin red: las peticiones a
// OSRM, Nominatim, Open-Meteo y OpenStreetMap se responden con fixtures reales
// (ruta Madrid → Valencia y cargadores del corredor).
//
//   npm run test:interfaz                     # desde tesla-viajes/
//   CAPTURAS=/ruta/carpeta npm run test:interfaz   # guarda capturas de pantalla

import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { decodificarPolilinea, distanciaM } from '../web/js/geo.js';

const RAIZ = path.resolve(fileURLToPath(new URL('../web', import.meta.url)));
const fixture = (nombre) => readFileSync(new URL(`./fixtures/${nombre}`, import.meta.url));
const ESTACIONES = fixture('estaciones-corredor.json');
const OSRM = JSON.parse(fixture('osrm-madrid-valencia.json'));
const CAPTURAS = process.env.CAPTURAS || '';
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');

// ---------- Servidor estático ----------

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const servidor = http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  if (ruta === '/datos/estaciones.json') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(ESTACIONES);
  }
  if (ruta.endsWith('/')) ruta += 'index.html';
  const fichero = path.join(RAIZ, ruta);
  if (!fichero.startsWith(RAIZ) || !existsSync(fichero) || statSync(fichero).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'content-type': TIPOS[path.extname(fichero)] || 'application/octet-stream' });
  return res.end(readFileSync(fichero));
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${servidor.address().port}/`;

// ---------- Simulacros de los servicios externos ----------

const geometria = decodificarPolilinea(OSRM.routes[0].geometry, 6);

// Con paradas intermedias, OSRM devuelve una etapa por tramo: se parte la ruta
// capturada por los vértices más cercanos a cada parada.
function rutaConParadas(coordenadas) {
  const ruta = structuredClone(OSRM.routes[0]);
  if (coordenadas.length <= 2) return { code: 'Ok', routes: [ruta] };
  const ann = ruta.legs[0].annotation;
  const cortes = coordenadas.slice(1, -1).map(([lon, lat]) => {
    let mejor = 0, distancia = Infinity;
    geometria.forEach(([la, lo], k) => {
      const d = distanciaM(lat, lon, la, lo);
      if (d < distancia) { distancia = d; mejor = k; }
    });
    return mejor;
  }).sort((a, b) => a - b);
  const limites = [0, ...cortes, geometria.length - 1];
  ruta.legs = limites.slice(0, -1).map((desde, k) => {
    const hasta = limites[k + 1];
    const trozo = (clave) => ann[clave].slice(desde, hasta);
    const distance = trozo('distance').reduce((s, x) => s + x, 0);
    const duration = trozo('duration').reduce((s, x) => s + x, 0);
    return { distance, duration, weight: duration, summary: '', steps: [], annotation: { distance: trozo('distance'), duration: trozo('duration'), speed: trozo('speed') } };
  });
  return { code: 'Ok', routes: [ruta] };
}

const PERFIL_ALTITUD = [[-3.75, 650], [-3.3, 750], [-2.9, 820], [-2.0, 900], [-1.5, 820], [-1.1, 700], [-0.8, 300], [-0.4, 15]];
function altitud(lon) {
  if (lon <= PERFIL_ALTITUD[0][0]) return PERFIL_ALTITUD[0][1];
  for (let k = 1; k < PERFIL_ALTITUD.length; k++) {
    const [x1, y1] = PERFIL_ALTITUD[k];
    if (lon <= x1) {
      const [x0, y0] = PERFIL_ALTITUD[k - 1];
      return y0 + ((y1 - y0) * (lon - x0)) / (x1 - x0);
    }
  }
  return PERFIL_ALTITUD.at(-1)[1];
}

function prevision(url) {
  const n = url.searchParams.get('latitude').split(',').length;
  const inicio = Math.floor(Date.now() / 3600000) * 3600 - 6 * 3600;
  const horas = Array.from({ length: 96 }, (_, k) => inicio + k * 3600);
  const una = () => ({
    hourly: {
      time: horas,
      temperature_2m: horas.map(() => 22),
      precipitation: horas.map(() => 0),
      wind_speed_10m: horas.map(() => 3),
      wind_direction_10m: horas.map(() => 270),
    },
  });
  return n === 1 ? una() : Array.from({ length: n }, una);
}

const LUGARES = {
  madrid: [{ lat: '40.4168', lon: '-3.7038', display_name: 'Madrid, Comunidad de Madrid, España' }],
  valencia: [
    { lat: '39.4699', lon: '-0.3763', display_name: 'València, Comarca de València, Comunitat Valenciana, España' },
    { lat: '39.4561', lon: '-0.3546', display_name: 'Estació del Nord, València, España' },
  ],
};

async function simularRed(contexto, registro) {
  await contexto.route(/^https?:\/\/(?!127\.0\.0\.1)/, async (ruta) => {
    const url = new URL(ruta.request().url());
    registro.push(url.host);
    const json = (cuerpo) => ruta.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(cuerpo) });
    if (url.host.includes('osrm') || url.host === 'routing.openstreetmap.de') {
      const coordenadas = decodeURIComponent(url.pathname.split('/').pop()).split(';').map((c) => c.split(',').map(Number));
      return json(rutaConParadas(coordenadas));
    }
    if (url.host === 'nominatim.openstreetmap.org') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      return json(LUGARES[Object.keys(LUGARES).find((k) => q.includes(k))] || []);
    }
    if (url.pathname === '/v1/elevation') {
      const lons = url.searchParams.get('longitude').split(',').map(Number);
      return json({ elevation: lons.map(altitud) });
    }
    if (url.pathname === '/v1/forecast') return json(prevision(url));
    if (url.host === 'tile.openstreetmap.org') return ruta.fulfill({ status: 200, contentType: 'image/png', body: PIXEL });
    return ruta.abort();
  });
}

// ---------- Prueba ----------

const navegador = await chromium.launch();
const errores = [];
let fallo = null;
try {
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  const peticiones = [];
  await simularRed(contexto, peticiones);
  const pagina = await contexto.newPage();
  pagina.on('pageerror', (e) => errores.push(e.message));
  pagina.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  const captura = async (nombre, opciones = {}) => {
    if (!CAPTURAS) return;
    mkdirSync(CAPTURAS, { recursive: true });
    await pagina.screenshot({ path: path.join(CAPTURAS, `${nombre}.png`), ...opciones });
  };

  await pagina.goto(BASE);
  await pagina.waitForFunction(() => document.querySelector('#estado-datos').textContent.includes('Registro oficial'));
  const estado = await pagina.textContent('#estado-datos');
  assert.match(estado, /estaciones/);

  await pagina.fill('#origen', 'Madrid');
  await pagina.fill('#destino', 'Valencia');
  await pagina.$eval('#soc', (el) => { el.value = '55'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  assert.equal(await pagina.textContent('#soc-valor'), '55 %');
  await pagina.click('#boton-planificar');
  await pagina.waitForSelector('#resultado:not([hidden])', { timeout: 20000 });
  await pagina.waitForFunction(() => !document.querySelector('#boton-planificar').disabled);

  const paradas = await pagina.$$eval('#paradas .parada', (els) => els.map((el) => el.innerText));
  assert.ok(paradas.length >= 2, `debería haber al menos una parada y el destino: ${paradas.join(' | ')}`);
  assert.match(paradas[0], /%\s*→\s*\d+ %/, 'la parada muestra % de llegada y de salida');
  const chips = await pagina.$$eval('#paradas .chip', (els) => els.map((el) => el.textContent.trim()));
  assert.ok(chips.length > 0, 'cada parada muestra su medio de pago');
  const resumen = await pagina.textContent('#resumen');
  assert.match(resumen, /\d+ %/);
  assert.match(resumen, /km/);
  const enRuta = await pagina.$$eval('#en-ruta .cargador', (els) => els.length);
  assert.ok(enRuta > 10, `cargadores en la ruta: ${enRuta}`);
  assert.ok(peticiones.some((h) => h.includes('open-meteo')), 'consulta altitud y previsión');
  console.log('Paradas:', paradas.map((p) => p.replace(/\s+/g, ' ')).join('\n        '));
  await pagina.waitForTimeout(900); // animación del mapa
  await captura('1-plan-claro');

  // Filtro de la lista: solo cargadores con tarjeta bancaria (o Supercharger).
  await pagina.click('#filtro-lista label:nth-child(3)');
  const conTarjeta = await pagina.$$eval('#en-ruta .cargador', (els) => els.map((el) => el.innerText));
  assert.ok(conTarjeta.every((t) => /Tarjeta de crédito|Tarjeta de débito|Datáfono|cuenta Tesla/.test(t)), 'el filtro de tarjeta funciona');
  await pagina.click('#filtro-lista label:nth-child(1)');

  // Ficha de la primera parada.
  await pagina.click('#paradas .parada >> nth=0');
  await pagina.waitForSelector('#ficha:not([hidden])');
  const ficha = await pagina.textContent('#ficha');
  assert.match(ficha, /Cómo se paga/);
  assert.match(ficha, /Para tu Model Y/);
  assert.match(ficha, /Disponibilidad en tiempo real/);
  await captura('2-ficha-claro');
  await pagina.keyboard.press('Escape');
  assert.equal(await pagina.isVisible('#ficha'), false);

  // Tema oscuro.
  await pagina.click('#boton-tema');
  assert.equal(await pagina.getAttribute('html', 'data-theme'), 'dark');
  await captura('3-plan-oscuro');

  // Plan imposible: solo Superchargers y salida con poca batería.
  await pagina.check('#solo-tesla');
  await pagina.$eval('#soc', (el) => { el.value = '2'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await pagina.click('#boton-planificar');
  await pagina.waitForFunction(() => !document.querySelector('#boton-planificar').disabled);
  const avisos = await pagina.textContent('#avisos');
  assert.match(avisos, /no llegas ni al primer cargador que cumple los filtros, el Supercharger de Madrid/, `aviso de plan imposible: ${avisos}`);
  assert.match(await pagina.textContent('#resumen'), /No llegas/);
  await captura('4-sin-plan-oscuro');
  await pagina.uncheck('#solo-tesla');

  // Cerca de mí, con el GPS simulado junto a Tarancón (A-3).
  await contexto.grantPermissions(['geolocation']);
  await contexto.setGeolocation({ latitude: 40.0, longitude: -3.0 });
  await pagina.click('#boton-cerca');
  await pagina.waitForSelector('#cerca:not([hidden]) .cargador');
  const cercanos = await pagina.$$eval('#lista-cerca .cargador', (els) => els.map((el) => el.innerText));
  assert.ok(cercanos.length > 0, 'hay cargadores cerca');
  assert.match(cercanos[0], /km/);
  assert.equal(await pagina.isVisible('#resultado'), false);
  await captura('5-cerca-oscuro');

  // Móvil en vertical: sin desplazamiento horizontal.
  await pagina.setViewportSize({ width: 390, height: 844 });
  await pagina.waitForTimeout(300);
  const anchoSobrante = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(anchoSobrante <= 0, `desborde horizontal en móvil: ${anchoSobrante}px`);
  await captura('6-movil', { fullPage: false });

  assert.deepEqual(errores, [], `errores en la consola: ${errores.join(' | ')}`);
  console.log('Interfaz OK');
} catch (e) {
  fallo = e;
} finally {
  await navegador.close();
  servidor.close();
}
if (fallo) {
  console.error(fallo);
  process.exit(1);
}
