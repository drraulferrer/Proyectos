// Servicios externos que consulta el navegador: rutas (OSRM), búsqueda de
// direcciones (Nominatim), altitud y meteorología (Open-Meteo). Todos son
// gratuitos, sin clave y con CORS abierto; cada uno tiene su política de uso
// justo, que un uso personal cumple de sobra.

import { decodificarPolilinea, acumulada, remuestrear, distanciaM } from './geo.js';
import { interpolador } from './consumo.js';

const SERVIDORES_OSRM = [
  'https://router.project-osrm.org/route/v1/driving',
  'https://routing.openstreetmap.de/routed-car/route/v1/driving',
];
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OPEN_METEO_ALTITUD = 'https://api.open-meteo.com/v1/elevation';
const OPEN_METEO_PREVISION = 'https://api.open-meteo.com/v1/forecast';

async function pedirJson(url, { timeoutMs = 20000, intentos = 1 } = {}) {
  let ultimoError;
  for (let k = 0; k < intentos; k++) {
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), timeoutMs);
    try {
      const r = await fetch(url, { signal: control.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status} en ${new URL(url).host}`);
      return await r.json();
    } catch (e) {
      ultimoError = e.name === 'AbortError' ? new Error(`Sin respuesta de ${new URL(url).host}`) : e;
    } finally {
      clearTimeout(reloj);
    }
  }
  throw ultimoError;
}

// Ruta por carretera entre varios puntos [{lat, lon}]. Devuelve la geometría,
// los tramos con distancia/duración/velocidad y dónde empieza cada etapa.
export async function calcularRuta(puntosDePaso) {
  const coordenadas = puntosDePaso.map((p) => `${p.lon.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const consulta = 'overview=full&geometries=polyline6&annotations=distance,duration,speed&steps=false';
  let ultimoError;
  for (const base of SERVIDORES_OSRM) {
    try {
      const r = await pedirJson(`${base}/${coordenadas}?${consulta}`, { timeoutMs: 25000 });
      if (r.code !== 'Ok' || !r.routes?.length) throw new Error(r.message || `Sin ruta (${r.code})`);
      return convertirRutaOsrm(r.routes[0]);
    } catch (e) {
      ultimoError = e;
    }
  }
  throw new Error(`No se pudo calcular la ruta: ${ultimoError?.message || 'error desconocido'}`);
}

export function convertirRutaOsrm(ruta) {
  const puntos = decodificarPolilinea(ruta.geometry, 6);
  const acum = acumulada(puntos);
  const anotaciones = { distance: [], duration: [], speed: [] };
  for (const etapa of ruta.legs) {
    for (const clave of Object.keys(anotaciones)) anotaciones[clave].push(...(etapa.annotation?.[clave] || []));
  }
  let segmentos;
  if (anotaciones.distance.length === puntos.length - 1) {
    segmentos = anotaciones.distance.map((dist, k) => ({
      dist, dur: anotaciones.duration[k], vel: anotaciones.speed[k] || (dist / Math.max(0.1, anotaciones.duration[k])),
    }));
  } else {
    // Si las anotaciones no cuadran con la geometría, velocidad media por etapa.
    const vel = ruta.distance / Math.max(1, ruta.duration);
    segmentos = [];
    for (let k = 0; k < puntos.length - 1; k++) {
      const dist = acum[k + 1] - acum[k];
      segmentos.push({ dist, dur: dist / vel, vel });
    }
  }
  const inicioEtapas = [0];
  for (const etapa of ruta.legs.slice(0, -1)) inicioEtapas.push(inicioEtapas.at(-1) + etapa.distance);
  return { puntos, acum, segmentos, duracionS: ruta.duration, distanciaM: ruta.distance, inicioEtapas };
}

// Búsqueda de lugares en España. Nominatim no admite autocompletar: solo se
// consulta al pulsar «Buscar».
export async function buscarLugar(texto) {
  const url = `${NOMINATIM}?format=jsonv2&limit=5&countrycodes=es&accept-language=es&q=${encodeURIComponent(texto)}`;
  const r = await pedirJson(url, { timeoutMs: 15000 });
  return r.map((x) => ({ lat: Number(x.lat), lon: Number(x.lon), nombre: x.display_name }));
}

export function miUbicacion({ timeoutMs = 12000 } = {}) {
  return new Promise((resolver, rechazar) => {
    if (!navigator.geolocation) return rechazar(new Error('El navegador no ofrece ubicación'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolver({ lat: p.coords.latitude, lon: p.coords.longitude, nombre: 'Mi ubicación' }),
      (e) => rechazar(new Error(e.code === 1 ? 'Permiso de ubicación denegado' : 'No se pudo obtener la ubicación')),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 },
    );
  });
}

// Altitud cada `pasoM` metros (modelo digital Copernicus de 90 m). Devuelve
// una función d → altitud (m) o null si falla.
export async function perfilAltitud(ruta, pasoM = 1000) {
  const total = ruta.acum.at(-1);
  const paso = Math.max(pasoM, total / 1500); // como mucho 15 peticiones
  const muestras = remuestrear(ruta.puntos, ruta.acum, paso);
  const lotes = [];
  for (let k = 0; k < muestras.length; k += 100) lotes.push(muestras.slice(k, k + 100));
  const respuestas = await Promise.all(lotes.map((lote) => pedirJson(
    `${OPEN_METEO_ALTITUD}?latitude=${lote.map((m) => m.lat.toFixed(5)).join(',')}` +
    `&longitude=${lote.map((m) => m.lon.toFixed(5)).join(',')}`, { timeoutMs: 15000, intentos: 2 })));
  const alturas = respuestas.flatMap((r) => r.elevation);
  if (alturas.length !== muestras.length || alturas.some((h) => typeof h !== 'number')) {
    throw new Error('Respuesta de altitud incompleta');
  }
  const serie = muestras.map((m, k) => ({ d: m.d, valor: alturas[k] }));
  return { altitud: interpolador(serie), serie };
}

// Previsión horaria (temperatura, lluvia y viento) en puntos cada ~40 km.
// Devuelve clima(d, unix) → {temperaturaC, lluviaMmH, vientoMs, vientoDesdeGrados}.
export async function previsionRuta(ruta) {
  const total = ruta.acum.at(-1);
  const paso = Math.max(40000, total / 25);
  const muestras = remuestrear(ruta.puntos, ruta.acum, paso);
  const url = `${OPEN_METEO_PREVISION}?latitude=${muestras.map((m) => m.lat.toFixed(3)).join(',')}` +
    `&longitude=${muestras.map((m) => m.lon.toFixed(3)).join(',')}` +
    '&hourly=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m' +
    '&wind_speed_unit=ms&timeformat=unixtime&forecast_days=3&timezone=GMT';
  const r = await pedirJson(url, { timeoutMs: 15000, intentos: 2 });
  const lista = Array.isArray(r) ? r : [r];
  const series = lista.map((x) => x.hourly);
  const clima = (d, unix) => {
    const k = Math.max(0, Math.min(series.length - 1, Math.round(d / paso)));
    const h = series[k];
    if (!h?.time?.length) return null;
    const i = Math.max(0, Math.min(h.time.length - 1, Math.round((unix - h.time[0]) / 3600)));
    return {
      temperaturaC: h.temperature_2m[i],
      lluviaMmH: h.precipitation[i],
      vientoMs: h.wind_speed_10m[i],
      vientoDesdeGrados: h.wind_direction_10m[i],
    };
  };
  const ahora = Date.now() / 1000;
  const temperaturas = series.map((h) => h.temperature_2m[Math.max(0, Math.min(h.time.length - 1, Math.round((ahora - h.time[0]) / 3600)))]);
  return { clima, temperaturaMin: Math.min(...temperaturas), temperaturaMax: Math.max(...temperaturas) };
}

// Distancia en línea recta (km) para la vista «Cerca de mí».
export function kmEnLineaRecta(a, b) {
  return distanciaM(a.lat, a.lon, b.lat, b.lon) / 1000;
}
