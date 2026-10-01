// Interfaz: formulario, mapa, plan de viaje y ficha de cada cargador.

import { MODEL_Y_RWD_LFP } from './vehiculo.js';
import { perfilRuta } from './consumo.js';
import {
  cargarEstaciones, nombreVisible, resumenPago, avisoAfir, abiertaEn, horarioLegible,
  resumenConectores, MEDIOS_PAGO, SERVICIOS, TIPOS_SITIO, aceptaTarjetaBancaria,
} from './estaciones.js';
import {
  OPCIONES_PLAN, estacionesEnRuta, planificar, perfilSoc, enPosicion, simularParadas,
} from './planificador.js';
import {
  calcularRuta, buscarLugar, miUbicacion, perfilAltitud, previsionRuta, kmEnLineaRecta,
} from './servicios.js';

const $ = (selector) => document.querySelector(selector);
const CLAVE_AJUSTES = 'tesla-viajes:ajustes:v1';
const AJUSTES_FABRICA = {
  capacidadUtilKwh: MODEL_Y_RWD_LFP.capacidadUtilKwh,
  velocidadMaxKmh: 120,
  factorConsumoPct: 100,
  cargaKg: MODEL_Y_RWD_LFP.cargaKg,
  reservaParadaPct: OPCIONES_PLAN.reservaParadaPct,
  reservaDestinoPct: OPCIONES_PLAN.reservaDestinoPct,
  radioKm: OPCIONES_PLAN.radioKm,
  temperaturaDefecto: 20,
  respetarHorario: true,
};
const CONSUMO_MEDIO_KWH_KM = 0.17;
const URL_REVE = 'https://www.mapareve.es/mapa-puntos-recarga';

const estado = {
  estaciones: [],
  meta: null,
  mapa: null,
  capas: {},
  viaje: null,
  lugaresFijados: {},
  ajustes: { ...AJUSTES_FABRICA },
  preferencias: {},
};

// ---------- Utilidades ----------

const nf0 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });
const hora = (d) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const fecha = (iso) => (iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function duracion(minutos) {
  const m = Math.max(0, Math.round(minutos));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
}

function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function clasePotencia(kw) {
  if (kw >= 150) return 'rapida';
  if (kw >= 50) return 'media';
  return 'lenta';
}

function leerAlmacen(clave) {
  try { return JSON.parse(localStorage.getItem(clave) || '{}'); } catch { return {}; }
}

function guardarAlmacen(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento */ }
}

function vehiculo() {
  return { ...MODEL_Y_RWD_LFP, capacidadUtilKwh: Number(estado.ajustes.capacidadUtilKwh) || MODEL_Y_RWD_LFP.capacidadUtilKwh };
}

function ajustesConsumo() {
  const a = estado.ajustes;
  return {
    velocidadMaxKmh: Number(a.velocidadMaxKmh),
    factorConsumo: Number(a.factorConsumoPct) / 100,
    temperaturaDefecto: Number(a.temperaturaDefecto),
    cargaKg: Number(a.cargaKg),
  };
}

function opcionesPlan() {
  const f = $('#formulario');
  const a = estado.ajustes;
  return {
    ...OPCIONES_PLAN,
    cargaMaxPct: Number($('#carga-max').value),
    potenciaMinKw: Number(f.elements.potencia.value),
    pago: f.elements.pago.value,
    soloTesla: $('#solo-tesla').checked,
    reservaParadaPct: Number(a.reservaParadaPct),
    reservaDestinoPct: Number(a.reservaDestinoPct),
    radioKm: Number(a.radioKm),
    respetarHorario: Boolean(a.respetarHorario),
  };
}

// ---------- Iconos ----------

const ICONOS = {
  apps: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  creditCard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  debitCard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  pinpad: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h6M9 11h0M12 11h0M15 11h0M9 14h0M12 14h0M15 14h0M9 17h0M12 17h0M15 17h0"/>',
  nfc: '<path d="M7 8.5a5 5 0 0 1 0 7M10.5 6a9 9 0 0 1 0 12M14 3.5a13 13 0 0 1 0 17"/>',
  rfid: '<rect x="3" y="6" width="11" height="12" rx="2"/><path d="M17.5 9a4 4 0 0 1 0 6M20.5 7a7 7 0 0 1 0 10"/>',
  tesla: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
};
const icono = (clave) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[clave] || ''}</svg>`;

function chipsPago(e) {
  if (e.esTesla) return `<span class="chip tesla">${icono('tesla')}Automático con tu cuenta Tesla</span>`;
  if (!e.pagos.length) return '<span class="chip nada">Pago no declarado</span>';
  return MEDIOS_PAGO.filter((m) => e.pagos.includes(m.clave)).map((m) => {
    const clase = ['creditCard', 'debitCard', 'pinpad'].includes(m.clave) ? ' tarjeta' : '';
    return `<span class="chip${clase}">${icono(m.clave)}${esc(m.etiqueta)}</span>`;
  }).join('');
}

// ---------- Avisos ----------

function avisar(texto, tipo = '') {
  const p = document.createElement('p');
  p.className = `aviso ${tipo}`.trim();
  p.textContent = texto;
  $('#avisos').append(p);
}

function limpiarAvisos() {
  $('#avisos').replaceChildren();
  $('#alternativas').hidden = true;
}

function ocupado(texto) {
  const boton = $('#boton-planificar');
  boton.disabled = Boolean(texto);
  boton.classList.toggle('cargando', Boolean(texto));
  boton.textContent = texto || 'Planificar viaje';
}

// ---------- Datos ----------

async function cargarDatos() {
  try {
    const r = await fetch('datos/estaciones.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const datos = await r.json();
    estado.estaciones = cargarEstaciones(datos, vehiculo());
    estado.meta = datos.fuente;
    const rapidas = estado.estaciones.filter((e) => e.compatibleDc && e.kwCcsEfectiva >= 50).length;
    $('#estado-datos').textContent =
      `Registro oficial: ${nf0.format(estado.estaciones.length)} estaciones, ${nf0.format(rapidas)} rápidas CCS · publicado el ${fecha(datos.fuente.publicado)}`;
    pintarExploracion();
  } catch (e) {
    $('#estado-datos').textContent = 'No se pudo cargar el registro de cargadores';
    avisar(`No se pudo cargar el registro de cargadores (${e.message}). Recarga la página en unos minutos.`, 'error');
  }
}

// ---------- Mapa ----------

function iniciarMapa() {
  const mapa = L.map('mapa', { preferCanvas: true, zoomSnap: 0.5 }).setView([40.2, -3.7], 6);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapa);
  estado.mapa = mapa;
  estado.capas.exploracion = L.layerGroup().addTo(mapa);
  estado.capas.viaje = L.layerGroup().addTo(mapa);
  mapa.on('moveend', pintarExploracion);
}

function colorPotencia(e) {
  const estilo = getComputedStyle(document.documentElement);
  if (e.esTesla) return estilo.getPropertyValue('--tesla').trim();
  return estilo.getPropertyValue(`--${clasePotencia(e.kwCcsEfectiva)}`).trim();
}

function marcadorCargador(e, extra = {}) {
  const m = L.circleMarker([e.lat, e.lon], {
    radius: extra.radio || (e.kwCcsEfectiva >= 150 ? 8 : 6),
    color: getComputedStyle(document.documentElement).getPropertyValue('--superficie').trim(),
    weight: 2,
    fillColor: colorPotencia(e),
    fillOpacity: 0.95,
  });
  m.bindTooltip(`${nombreVisible(e)} · ${e.kwCcsEfectiva} kW`, { direction: 'top' });
  m.on('click', () => abrirFicha(e, extra));
  return m;
}

// Sin viaje calculado, el mapa enseña los cargadores rápidos de la zona visible.
function pintarExploracion() {
  const capa = estado.capas.exploracion;
  if (!capa) return;
  capa.clearLayers();
  const pista = $('#pista-mapa');
  if (estado.viaje || !estado.estaciones.length) { pista.hidden = true; return; }
  if (estado.mapa.getZoom() < 9) { pista.hidden = false; return; }
  pista.hidden = true;
  const limites = estado.mapa.getBounds().pad(0.1);
  let n = 0;
  for (const e of estado.estaciones) {
    if (!e.compatibleDc || e.kwCcsEfectiva < 50) continue;
    if (!limites.contains([e.lat, e.lon])) continue;
    marcadorCargador(e).addTo(capa);
    if (++n >= 1500) break;
  }
}

function pintarViajeEnMapa(viaje) {
  const capa = estado.capas.viaje;
  capa.clearLayers();
  estado.capas.exploracion.clearLayers();
  $('#pista-mapa').hidden = true;
  const acento = getComputedStyle(document.documentElement).getPropertyValue('--acento').trim();
  const linea = L.polyline(viaje.ruta.puntos, { color: acento, weight: 6, opacity: 0.85 }).addTo(capa);
  const enPlan = new Set((viaje.plan.paradas || []).map((p) => p.estacion.id));
  for (const c of viaje.enRuta) {
    if (enPlan.has(c.estacion.id)) continue;
    marcadorCargador(c.estacion, { km: c.posM / 1000, desvioKm: c.desvioKm, socLlegada: socEn(viaje, c) }).addTo(capa);
  }
  (viaje.plan.paradas || []).forEach((p, k) => {
    const icono = L.divIcon({ className: '', html: `<div class="marcador-parada">${k + 1}</div>`, iconSize: [38, 38], iconAnchor: [19, 19] });
    L.marker([p.estacion.lat, p.estacion.lon], { icon: icono, zIndexOffset: 1000, title: `Parada ${k + 1}` })
      .on('click', () => abrirFicha(p.estacion, { parada: p, numero: k + 1 }))
      .addTo(capa);
  });
  for (const lugar of [viaje.origen, viaje.destino]) {
    const icono = L.divIcon({ className: '', html: '<div class="marcador-extremo"></div>', iconSize: [26, 26], iconAnchor: [13, 13] });
    L.marker([lugar.lat, lugar.lon], { icon: icono, title: lugar.nombre }).addTo(capa);
  }
  estado.mapa.fitBounds(linea.getBounds(), { padding: [30, 30] });
}

// ---------- Planificación ----------

async function resolverLugar(texto, cual) {
  const limpio = texto.trim();
  const fijado = estado.lugaresFijados[cual];
  if (fijado && fijado.nombre === limpio) return fijado;
  if (!limpio || /^mi ubicaci[oó]n/i.test(limpio)) {
    if (cual === 'destino') throw new Error('Escribe un destino.');
    return miUbicacion();
  }
  const coordenadas = limpio.match(/^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/);
  if (coordenadas) return { lat: Number(coordenadas[1]), lon: Number(coordenadas[2]), nombre: limpio };
  const resultados = await buscarLugar(limpio);
  if (!resultados.length) throw new Error(`No encuentro «${limpio}» en España.`);
  const elegido = { ...resultados[0], alternativas: resultados.slice(1), cual, texto: limpio };
  return elegido;
}

function ofrecerAlternativas(lugares) {
  const caja = $('#alternativas');
  const conOtras = lugares.filter((l) => l.alternativas?.length);
  if (!conOtras.length) { caja.hidden = true; return; }
  caja.replaceChildren();
  for (const l of conOtras) {
    const p = document.createElement('p');
    p.textContent = `${l.cual === 'origen' ? 'Origen' : 'Destino'}: «${l.nombre}». ¿Era otro?`;
    caja.append(p);
    for (const alt of l.alternativas.slice(0, 3)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'boton-secundario';
      b.textContent = alt.nombre;
      b.addEventListener('click', () => {
        const nombre = alt.nombre.split(',').slice(0, 2).join(',');
        estado.lugaresFijados[l.cual] = { lat: alt.lat, lon: alt.lon, nombre };
        $(`#${l.cual}`).value = nombre;
        planificarViaje();
      });
      caja.append(b);
    }
  }
  caja.hidden = false;
}

async function contextoRuta(ruta, salida) {
  const [altitud, prevision] = await Promise.allSettled([perfilAltitud(ruta), previsionRuta(ruta)]);
  const ctx = { salidaUnix: salida.getTime() / 1000, avisos: [] };
  if (altitud.status === 'fulfilled') {
    ctx.elevacion = altitud.value.altitud;
  } else {
    ctx.avisos.push('Sin datos de altitud: el consumo se calcula como si la ruta fuera llana.');
  }
  if (prevision.status === 'fulfilled') {
    ctx.clima = prevision.value.clima;
    ctx.temperaturaMin = prevision.value.temperaturaMin;
    ctx.temperaturaMax = prevision.value.temperaturaMax;
  } else {
    ctx.avisos.push(`Sin previsión meteorológica: se calcula con ${estado.ajustes.temperaturaDefecto} °C y sin viento.`);
  }
  return ctx;
}

function leerSalida() {
  const valor = $('#salida').value;
  const d = valor ? new Date(valor) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

async function planificarViaje(evento) {
  evento?.preventDefault();
  if (!estado.estaciones.length) { avisar('El registro de cargadores aún no está cargado.', 'error'); return; }
  limpiarAvisos();
  const socInicial = Number($('#soc').value);
  const salida = leerSalida();
  const veh = vehiculo();
  const opciones = opcionesPlan();
  guardarPreferencias();
  try {
    ocupado('Buscando origen y destino…');
    const origen = await resolverLugar($('#origen').value, 'origen');
    const destino = await resolverLugar($('#destino').value, 'destino');
    ocupado('Calculando la ruta…');
    const rutaBase = await calcularRuta([origen, destino]);
    ocupado('Altitud y previsión del tiempo…');
    const ctxBase = await contextoRuta(rutaBase, salida);
    const perfilBase = perfilRuta(rutaBase, ctxBase, veh, ajustesConsumo());
    ocupado('Eligiendo paradas…');
    const candidatos = estacionesEnRuta(estado.estaciones, rutaBase, opciones);
    let plan = planificar({ ruta: rutaBase, perfil: perfilBase, candidatos, socInicial, salida, opciones, veh });
    let ruta = rutaBase, perfil = perfilBase, ctx = ctxBase;
    if (plan.factible && plan.paradas.length) {
      ocupado('Ajustando la ruta a las paradas…');
      try {
        const estacionesParada = plan.paradas.map((p) => p.estacion);
        const rutaFinal = await calcularRuta([origen, ...estacionesParada, destino]);
        const ctxFinal = await contextoRuta(rutaFinal, salida);
        const perfilFinal = perfilRuta(rutaFinal, ctxFinal, veh, ajustesConsumo());
        plan = simularParadas({
          ruta: rutaFinal, perfil: perfilFinal, estacionesParada, posiciones: rutaFinal.inicioEtapas.slice(1),
          socInicial, salida, opciones, veh,
        });
        ruta = rutaFinal; perfil = perfilFinal; ctx = ctxFinal;
      } catch (e) {
        avisar(`No se pudo recalcular la ruta exacta por las paradas (${e.message}); se muestra la estimación con desvíos aproximados.`);
      }
    }
    const enRuta = estacionesEnRuta(estado.estaciones, ruta, { ...opciones, radioKm: Math.max(3, opciones.radioKm) }, { filtrar: false });
    const viaje = {
      origen, destino, ruta, perfil, plan, ctx, enRuta, socInicial, salida, opciones,
      soc: perfilSoc(ruta, perfil, plan.factible ? plan : null, socInicial, veh),
    };
    estado.viaje = viaje;
    ctx.avisos.forEach((a) => avisar(a));
    ofrecerAlternativas([origen, destino]);
    pintarViaje(viaje);
  } catch (e) {
    avisar(e.message, 'error');
  } finally {
    ocupado('');
  }
}

function socEn(viaje, candidato) {
  const { indice } = enPosicion(viaje.ruta, viaje.perfil, candidato.posM);
  const desvio = ((candidato.desvioKm / 2) * CONSUMO_MEDIO_KWH_KM / vehiculo().capacidadUtilKwh) * 100;
  return viaje.soc[indice] - desvio;
}

// ---------- Pintar el viaje ----------

function pintarViaje(viaje) {
  $('#cerca').hidden = true;
  $('#resultado').hidden = false;
  pintarResumen(viaje);
  pintarGrafica(viaje);
  pintarParadas(viaje);
  pintarEnRuta(viaje);
  pintarViajeEnMapa(viaje);
  const { plan, ctx } = viaje;
  if (!plan.factible) avisar(plan.motivo, 'error');
  if (plan.alerta) avisar(plan.alerta, 'error');
  for (const p of plan.paradas || []) {
    if (p.cerradaAlLlegar) avisar(`${nombreVisible(p.estacion)} figura cerrada a las ${hora(p.llegada)} según su horario declarado.`, 'error');
    else if (p.horarioDesconocido) avisar(`${nombreVisible(p.estacion)} no declara horario: compruébalo antes de ir.`);
  }
  if (ctx.temperaturaMin !== undefined && ctx.temperaturaMin < 10 && (plan.paradas || []).some((p) => !p.estacion.esTesla)) {
    avisar(`Se esperan ${nf0.format(ctx.temperaturaMin)} °C: precalienta la batería antes de llegar a los cargadores que no son Supercharger o cargará más despacio de lo previsto.`, 'info');
  }
}

function pintarResumen(viaje) {
  const { plan, ruta, perfil, origen, destino, salida, ctx } = viaje;
  const distanciaKm = ruta.acum.at(-1) / 1000;
  const energia = perfil.energia.at(-1);
  const whKm = (energia * 1000) / Math.max(1, distanciaKm);
  const reserva = viaje.opciones.reservaDestinoPct;
  const llegadaSoc = plan.factible ? plan.socLlegada : Math.round(viaje.soc.at(-1));
  const clima = ctx.temperaturaMin !== undefined
    ? ` · ${nf0.format(ctx.temperaturaMin)}–${nf0.format(ctx.temperaturaMax)} °C`
    : '';
  $('#resumen').innerHTML = `
    <p class="ruta-texto">${esc(origen.nombre)} → ${esc(destino.nombre)}<br>Salida ${hora(salida)}${clima}</p>
    <div class="dato destacado${llegadaSoc < reserva ? ' bajo' : ''}">
      <span class="valor">${plan.factible ? '' : '≈ '}${nf0.format(llegadaSoc)} %</span>
      <span class="etiqueta">${plan.factible ? `al llegar, ${hora(plan.llegada)}` : 'al llegar sin cargar'}</span>
    </div>
    <div class="dato">
      <span class="valor">${plan.factible ? duracion(plan.duracionMin) : '—'}</span>
      <span class="etiqueta">${plan.factible ? `total · ${duracion(plan.minutosCarga)} cargando` : 'sin plan posible'}</span>
    </div>
    <div class="dato">
      <span class="valor">${nf0.format(distanciaKm)} km</span>
      <span class="etiqueta">${nf0.format(energia)} kWh · ${nf0.format(whKm)} Wh/km</span>
    </div>`;
}

function pintarGrafica(viaje) {
  const svg = $('#grafica-soc');
  const ancho = Math.max(300, svg.clientWidth || 440);
  const alto = 150;
  const margen = { izq: 34, der: 10, arr: 10, aba: 22 };
  const total = viaje.ruta.acum.at(-1);
  const x = (d) => margen.izq + (d / total) * (ancho - margen.izq - margen.der);
  const y = (s) => margen.arr + (1 - Math.max(0, Math.min(100, s)) / 100) * (alto - margen.arr - margen.aba);
  const paso = Math.max(1, Math.floor(viaje.soc.length / 400));
  let puntos = '';
  for (let k = 0; k < viaje.soc.length; k += paso) puntos += `${x(viaje.ruta.acum[k]).toFixed(1)},${y(viaje.soc[k]).toFixed(1)} `;
  puntos += `${x(total).toFixed(1)},${y(viaje.soc.at(-1)).toFixed(1)}`;
  const reserva = viaje.opciones.reservaParadaPct;
  const marcasKm = [];
  const intervalo = total > 600000 ? 200 : total > 250000 ? 100 : 50;
  for (let km = intervalo; km < total / 1000; km += intervalo) {
    marcasKm.push(`<text class="eje-texto" x="${x(km * 1000)}" y="${alto - 6}" text-anchor="middle">${km}</text>`);
  }
  const paradas = (viaje.plan.paradas || []).map((p, k) => {
    const cx = x(p.posM), cy = y(p.socLlegada);
    return `<circle class="marca-parada" cx="${cx}" cy="${cy}" r="9"/><text class="texto-parada" x="${cx}" y="${cy + 4}" text-anchor="middle">${k + 1}</text>`;
  }).join('');
  svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
  svg.innerHTML = `
    ${[0, 50, 100].map((s) => `<line class="eje" x1="${margen.izq}" x2="${ancho - margen.der}" y1="${y(s)}" y2="${y(s)}"/><text class="eje-texto" x="${margen.izq - 6}" y="${y(s) + 4}" text-anchor="end">${s}</text>`).join('')}
    <line class="linea-reserva" x1="${margen.izq}" x2="${ancho - margen.der}" y1="${y(reserva)}" y2="${y(reserva)}"/>
    <polyline class="linea-soc" points="${puntos}"/>
    ${paradas}
    ${marcasKm.join('')}`;
  $('#leyenda-grafica').textContent = `Batería (%) por kilómetro. Línea discontinua: reserva del ${reserva} %.` +
    (viaje.ctx.elevacion ? ' Incluye desnivel' : '') + (viaje.ctx.clima ? ', temperatura, viento y lluvia previstos.' : '.');
}

function lineaPotencia(e) {
  const kw = e.kwCcsEfectiva;
  const declarada = e.kwCcs > kw + 5 ? ` (declara ${nf0.format(e.kwCcs)})` : '';
  return `<span class="potencia ${clasePotencia(kw)}">${nf0.format(kw)} kW</span>${declarada} · ${e.puntosCcs} ${e.puntosCcs === 1 ? 'punto' : 'puntos'} CCS2`;
}

function pintarParadas(viaje) {
  const ol = $('#paradas');
  ol.replaceChildren();
  const { plan } = viaje;
  if (!plan.factible) {
    ol.innerHTML = '<li class="nota">No hay un plan de paradas que cumpla los filtros. Revisa los avisos de arriba.</li>';
    return;
  }
  if (!plan.paradas.length) {
    ol.innerHTML = `<li class="nota">No necesitas parar: llegas con un ${plan.socLlegada} % de batería.</li>`;
  }
  plan.paradas.forEach((p, k) => {
    const e = p.estacion;
    const li = document.createElement('li');
    li.className = 'parada';
    li.tabIndex = 0;
    li.innerHTML = `
      <span class="numero">${k + 1}</span>
      <span class="nombre">${esc(nombreVisible(e))}</span>
      <span class="sub">${esc(e.operador.marca)} · km ${nf0.format(p.posM / 1000)} · ${esc(e.municipio)}</span>
      <span class="bateria">${p.socLlegada} % → ${p.socSalida} % <small>${hora(p.llegada)} · ${duracion(p.minutosCarga)} cargando</small></span>
      <span class="sub">${lineaPotencia(e)}</span>
      <span class="pagos" style="grid-column: 2">${chipsPago(e)}</span>`;
    const abrir = () => { abrirFicha(e, { parada: p, numero: k + 1 }); estado.mapa.flyTo([e.lat, e.lon], 13); };
    li.addEventListener('click', abrir);
    li.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') abrir(); });
    ol.append(li);
  });
  const li = document.createElement('li');
  li.className = 'parada';
  li.innerHTML = `
    <span class="numero" aria-hidden="true">●</span>
    <span class="nombre">${esc(viaje.destino.nombre.split(',')[0])}</span>
    <span class="bateria">${plan.socLlegada} % <small>llegada ${hora(plan.llegada)}</small></span>`;
  ol.append(li);
}

function filtroLista(c, valor) {
  const e = c.estacion;
  if (valor === '150') return e.kwCcsEfectiva >= 150;
  if (valor === 'tarjeta') return e.esTesla || aceptaTarjetaBancaria(e);
  if (valor === 'tesla') return e.esTesla;
  return true;
}

function pintarEnRuta(viaje) {
  const valor = document.querySelector('input[name="lista"]:checked')?.value || 'todos';
  const ul = $('#en-ruta');
  ul.replaceChildren();
  const enPlan = new Set((viaje.plan.paradas || []).map((p) => p.estacion.id));
  const lista = viaje.enRuta.filter((c) => filtroLista(c, valor));
  $('#cuenta-en-ruta').textContent = `${lista.length} a menos de ${nf1.format(Math.max(3, viaje.opciones.radioKm))} km`;
  const reserva = viaje.opciones.reservaParadaPct;
  for (const c of lista.slice(0, 150)) {
    const e = c.estacion;
    const soc = socEn(viaje, c);
    const li = document.createElement('li');
    li.className = `cargador${enPlan.has(e.id) ? ' en-plan' : ''}`;
    li.tabIndex = 0;
    li.innerHTML = `
      <span class="nombre">${esc(nombreVisible(e))}</span>
      <span class="llegada${soc < reserva ? ' baja' : ''}">${soc < 0 ? '—' : `${nf0.format(soc)} %`}<small>${soc < 0 ? 'no llegas' : 'llegarías'}</small></span>
      <span class="sub">km ${nf0.format(c.posM / 1000)} · ${c.desvioKm < 1 ? 'en ruta' : `desvío ${nf1.format(c.desvioKm)} km`} · ${lineaPotencia(e)}</span>
      <span class="pagos">${chipsPago(e)}</span>`;
    const abrir = () => { abrirFicha(e, { km: c.posM / 1000, desvioKm: c.desvioKm, socLlegada: soc }); estado.mapa.flyTo([e.lat, e.lon], 13); };
    li.addEventListener('click', abrir);
    li.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') abrir(); });
    ul.append(li);
  }
  if (!lista.length) ul.innerHTML = '<li class="nota">Ningún cargador de la ruta cumple este filtro.</li>';
}

// ---------- Cerca de mí ----------

async function cercaDeMi() {
  limpiarAvisos();
  const boton = $('#boton-cerca');
  boton.disabled = true;
  try {
    const yo = await miUbicacion();
    const soc = Number($('#soc').value);
    const cap = vehiculo().capacidadUtilKwh;
    const lista = estado.estaciones
      .filter((e) => e.compatibleDc)
      .map((e) => ({ e, km: kmEnLineaRecta(yo, e) }))
      .filter((x) => x.km <= 50)
      .sort((a, b) => a.km - b.km)
      .slice(0, 40);
    estado.viaje = null;
    estado.capas.viaje.clearLayers();
    $('#resultado').hidden = true;
    $('#cerca').hidden = false;
    $('#cuenta-cerca').textContent = `${lista.length} rápidos a menos de 50 km en línea recta`;
    const ul = $('#lista-cerca');
    ul.replaceChildren();
    for (const { e, km } of lista) {
      const llegada = soc - ((km * 1.3 * CONSUMO_MEDIO_KWH_KM) / cap) * 100;
      const li = document.createElement('li');
      li.className = 'cargador';
      li.tabIndex = 0;
      li.innerHTML = `
        <span class="nombre">${esc(nombreVisible(e))}</span>
        <span class="llegada">${nf0.format(llegada)} %<small>≈ al llegar</small></span>
        <span class="sub">${nf1.format(km)} km · ${lineaPotencia(e)}</span>
        <span class="pagos">${chipsPago(e)}</span>`;
      const abrir = () => { abrirFicha(e, { socLlegada: llegada }); estado.mapa.flyTo([e.lat, e.lon], 14); };
      li.addEventListener('click', abrir);
      li.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') abrir(); });
      ul.append(li);
    }
    estado.mapa.setView([yo.lat, yo.lon], 11);
    pintarExploracion();
  } catch (e) {
    avisar(e.message, 'error');
  } finally {
    boton.disabled = false;
  }
}

// ---------- Ficha del cargador ----------

function abrirFicha(e, extra = {}) {
  const ficha = $('#ficha');
  const pago = resumenPago(e);
  const afir = avisoAfir(e);
  const ahora = abiertaEn(e, new Date());
  const estadoAhora = ahora === null ? 'Horario no declarado' : ahora ? 'Abierto ahora' : 'Cerrado ahora';
  const medios = MEDIOS_PAGO.filter((m) => e.pagos.includes(m.clave));
  const p = extra.parada;
  const destinoGoogle = `https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lon}`;
  $('#ficha-contenido').innerHTML = `
    <div class="ficha-cabecera">
      <div>
        <h2 id="ficha-titulo">${extra.numero ? `${extra.numero}. ` : ''}${esc(nombreVisible(e))}</h2>
        <p class="operador">${esc(e.operador.marca)}${e.operador.razon_social && e.operador.razon_social !== e.operador.marca ? ` · ${esc(e.operador.razon_social)}` : ''}</p>
      </div>
      <button type="button" class="boton-icono" id="cerrar-ficha" aria-label="Cerrar ficha">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    ${p ? `<div class="bloque"><h3>En tu plan</h3>
      <p class="cifra-grande">${p.socLlegada} % → ${p.socSalida} %</p>
      <p>Llegas a las ${hora(p.llegada)} y cargas ${duracion(p.minutosCarga)}; sales a las ${hora(p.salida)}.</p></div>` : ''}
    ${!p && extra.socLlegada !== undefined ? `<div class="bloque"><h3>Si vas ahora</h3>
      <p class="cifra-grande">${extra.socLlegada < 0 ? 'No llegas' : `${nf0.format(extra.socLlegada)} %`}</p>
      <p class="nota">${extra.km !== undefined ? `Punto kilométrico ${nf0.format(extra.km)} de la ruta · ${extra.desvioKm < 1 ? 'en la propia ruta' : `desvío aproximado de ${nf1.format(extra.desvioKm)} km`}.` : 'Estimación en línea recta con un 30 % extra por carretera.'}</p></div>` : ''}
    <div class="bloque">
      <h3>Cómo se paga</h3>
      <p class="pago-principal">${esc(pago.principal)}</p>
      ${pago.detalle ? `<p class="nota">${esc(pago.detalle)}</p>` : ''}
      ${!e.esTesla && medios.length ? `<ul class="lista-medios">${medios.map((m) => `<li>${icono(m.clave)}<div><strong>${esc(m.etiqueta)}</strong><span>${esc(m.detalle)}</span></div></li>`).join('')}</ul>` : ''}
      ${afir ? `<p class="aviso">${esc(afir)}</p>` : ''}
      <p class="nota">Medios declarados por el operador en el registro oficial. El precio no figura en él: consúltalo en la app del operador${e.esTesla ? ' o en la pantalla del coche' : ''}.</p>
    </div>
    <div class="bloque">
      <h3>Para tu Model Y</h3>
      ${e.compatibleDc ? `<p class="cifra-grande">${nf0.format(e.kwCcsEfectiva)} kW</p>
      <p>${e.puntosCcs} ${e.puntosCcs === 1 ? 'punto' : 'puntos'} CCS2 en corriente continua. ${e.kwCcs > e.kwCcsEfectiva + 5 ? `El punto declara ${nf0.format(e.kwCcs)} kW, pero su intensidad máxima limita la potencia con una batería de ~370 V.` : ''}</p>`
      : `<p>Sin carga rápida CCS2. ${e.puntosAc ? `Corriente alterna hasta ${nf1.format(e.kwAcEfectiva)} kW${e.acNecesitaCable ? ', con tu propio cable Tipo 2' : ''}.` : ''}</p>`}
      <ul class="lista-medios">${resumenConectores(e).map((t) => `<li><span></span><div>${esc(t)}</div></li>`).join('')}</ul>
    </div>
    <div class="bloque">
      <h3>Horario</h3>
      <p><span class="estado-abierto ${ahora === null ? '' : ahora ? 'si' : 'no'}">${estadoAhora}</span> · ${esc(horarioLegible(e))}</p>
    </div>
    <div class="bloque">
      <h3>Dónde</h3>
      <p>${esc(e.direccion)}${e.cp ? `, ${esc(e.cp)}` : ''} ${esc(e.municipio)}${e.provincia && e.provincia !== e.municipio ? ` (${esc(e.provincia)})` : ''}</p>
      <p class="nota">${esc(TIPOS_SITIO[e.tipo] || '')}${e.servicios.length ? `${e.tipo ? ' · ' : ''}${e.servicios.map((s) => esc(SERVICIOS[s])).join(', ')}` : ''}</p>
      <p class="nota">${nf1.format(e.lat)}, ${nf1.format(e.lon)} · <span>${e.lat.toFixed(5)}, ${e.lon.toFixed(5)}</span></p>
    </div>
    <div class="bloque">
      <h3>Disponibilidad en tiempo real</h3>
      <p class="nota">No hay una fuente abierta con el estado de cada punto. ${e.esTesla ? 'La pantalla del coche muestra los postes libres de cada Supercharger.' : `Consúltalo en la app del operador o en <a href="${URL_REVE}" target="_blank" rel="noopener">Mapa REVE</a>.`}</p>
    </div>
    <div class="acciones-ficha">
      <button type="button" class="boton-secundario" id="usar-destino">Ir aquí</button>
      <a class="boton-secundario" href="${destinoGoogle}" target="_blank" rel="noopener">Google Maps</a>
    </div>
    <p class="nota">Dato actualizado por el operador el ${esc(fecha(e.actualizado))} · registro ${esc(e.id)}</p>`;
  ficha.hidden = false;
  $('#cerrar-ficha').addEventListener('click', cerrarFicha);
  $('#cerrar-ficha').focus();
  $('#usar-destino').addEventListener('click', () => {
    const nombre = `${nombreVisible(e)} (${e.municipio})`;
    estado.lugaresFijados.destino = { lat: e.lat, lon: e.lon, nombre };
    $('#destino').value = nombre;
    cerrarFicha();
    $('#destino').focus();
  });
}

function cerrarFicha() {
  $('#ficha').hidden = true;
}

// ---------- Ajustes y preferencias ----------

function cargarPreferencias() {
  const guardado = leerAlmacen(CLAVE_AJUSTES);
  estado.ajustes = { ...AJUSTES_FABRICA, ...(guardado.ajustes || {}) };
  estado.preferencias = guardado;
  if (guardado.soc) $('#soc').value = guardado.soc;
  if (guardado.cargaMax) $('#carga-max').value = guardado.cargaMax;
  if (guardado.potencia) $(`input[name="potencia"][value="${guardado.potencia}"]`)?.click();
  if (guardado.pago) $(`input[name="pago"][value="${guardado.pago}"]`)?.click();
  $('#solo-tesla').checked = Boolean(guardado.soloTesla);
  $('#soc-valor').textContent = `${$('#soc').value} %`;
}

function guardarPreferencias() {
  const f = $('#formulario');
  guardarAlmacen(CLAVE_AJUSTES, {
    ...estado.preferencias,
    ajustes: estado.ajustes,
    soc: Number($('#soc').value),
    cargaMax: $('#carga-max').value,
    potencia: f.elements.potencia.value,
    pago: f.elements.pago.value,
    soloTesla: $('#solo-tesla').checked,
  });
}

function abrirAjustes() {
  const form = $('#form-ajustes');
  for (const [clave, valor] of Object.entries(estado.ajustes)) {
    const campo = form.elements[clave];
    if (!campo) continue;
    if (campo.type === 'checkbox') campo.checked = Boolean(valor); else campo.value = valor;
  }
  $('#ajustes').showModal();
}

function guardarAjustes() {
  const form = $('#form-ajustes');
  const nuevo = { ...estado.ajustes };
  for (const clave of Object.keys(AJUSTES_FABRICA)) {
    const campo = form.elements[clave];
    if (!campo) continue;
    if (campo.type === 'checkbox') { nuevo[clave] = campo.checked; continue; }
    const n = Number(campo.value);
    const min = Number(campo.min), max = Number(campo.max);
    nuevo[clave] = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : AJUSTES_FABRICA[clave];
  }
  estado.ajustes = nuevo;
  guardarPreferencias();
  if (estado.viaje) planificarViaje();
}

function alternarTema() {
  const raiz = document.documentElement;
  const oscuroAhora = raiz.dataset.theme
    ? raiz.dataset.theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  raiz.dataset.theme = oscuroAhora ? 'light' : 'dark';
  estado.preferencias.tema = oscuroAhora ? 'claro' : 'oscuro';
  guardarPreferencias();
  if (estado.viaje) { pintarViajeEnMapa(estado.viaje); pintarGrafica(estado.viaje); } else pintarExploracion();
}

function fechaLocalParaInput(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ---------- Arranque ----------

function esperarLeaflet() {
  return new Promise((resolver) => {
    if (window.L) return resolver();
    window.addEventListener('load', () => resolver(), { once: true });
  });
}

async function iniciar() {
  cargarPreferencias();
  $('#salida').value = fechaLocalParaInput(new Date());
  $('#soc').addEventListener('input', () => { $('#soc-valor').textContent = `${$('#soc').value} %`; });
  $('#formulario').addEventListener('submit', planificarViaje);
  $('#boton-gps').addEventListener('click', async () => {
    delete estado.lugaresFijados.origen;
    $('#origen').value = '';
    $('#origen').placeholder = 'Mi ubicación (GPS)';
    try {
      const yo = await miUbicacion();
      estado.mapa.setView([yo.lat, yo.lon], 11);
    } catch (e) { avisar(e.message, 'error'); }
  });
  $('#boton-cerca').addEventListener('click', cercaDeMi);
  $('#boton-tema').addEventListener('click', alternarTema);
  $('#boton-ajustes').addEventListener('click', abrirAjustes);
  $('#form-ajustes').addEventListener('submit', (ev) => { if (ev.submitter?.value === 'guardar') guardarAjustes(); });
  $('#restaurar-ajustes').addEventListener('click', () => {
    estado.ajustes = { ...AJUSTES_FABRICA };
    abrirAjustes();
  });
  $('#filtro-lista').addEventListener('change', () => { if (estado.viaje) pintarEnRuta(estado.viaje); });
  for (const campo of ['origen', 'destino']) {
    $(`#${campo}`).addEventListener('input', () => { delete estado.lugaresFijados[campo]; });
  }
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') cerrarFicha(); });
  window.addEventListener('resize', () => { if (estado.viaje) pintarGrafica(estado.viaje); });
  await esperarLeaflet();
  iniciarMapa();
  await cargarDatos();
}

iniciar();
