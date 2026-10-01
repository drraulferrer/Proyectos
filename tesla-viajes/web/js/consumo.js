// Modelo físico de consumo: rodadura, aerodinámica, pendiente, temperatura,
// viento, lluvia, altitud y auxiliares. Devuelve energía de batería en kWh.

import { MODEL_Y_RWD_LFP } from './vehiculo.js';
import { rumbo } from './geo.js';

const G = 9.81;
// OSRM aplica un 80 % al límite de velocidad etiquetado en OpenStreetMap
// (perfil car.lua, speed_reduction = 0.8). Se deshace para estimar la
// velocidad real de crucero.
const REDUCCION_OSRM = 0.8;
// El viento se mide a 10 m; a la altura de la carrocería sopla más flojo
// (perfil logarítmico en terreno abierto).
const FACTOR_VIENTO_ALTURA = 0.6;

export const AJUSTES_CONSUMO = {
  velocidadMaxKmh: 120,
  factorConsumo: 1.0, // calibración personal (1,10 = gasto un 10 % más)
  temperaturaDefecto: 20,
  cargaKg: MODEL_Y_RWD_LFP.cargaKg,
};

export function densidadAire(temperaturaC, altitudM = 0) {
  return 1.225 * (288.15 / (273.15 + temperaturaC)) * Math.exp(-Math.max(0, altitudM) / 8434);
}

// Calefacción (bomba de calor) o aire acondicionado, en kW.
export function potenciaAuxiliaresKw(temperaturaC, veh = MODEL_Y_RWD_LFP) {
  let climatizacion = 0;
  if (temperaturaC < 18) climatizacion = Math.min(2.2, 0.07 * (18 - temperaturaC));
  else if (temperaturaC > 24) climatizacion = Math.min(1.2, 0.06 * (temperaturaC - 24));
  return veh.auxiliaresKw + climatizacion;
}

export function velocidadReal(velocidadOsrmMs, velocidadMaxKmh) {
  return Math.max(1.5, Math.min(velocidadOsrmMs / REDUCCION_OSRM, velocidadMaxKmh / 3.6));
}

function paradasPorKm(velocidadMs) {
  const kmh = velocidadMs * 3.6;
  if (kmh <= 30) return 2;
  if (kmh <= 45) return 1.2;
  if (kmh <= 55) return 0.6;
  return 0;
}

// Energía (kWh) para recorrer un tramo. Negativa si regenera más de lo que gasta.
export function energiaTramoKwh({
  distanciaM, velocidadMs, desnivelM = 0, temperaturaC = 20, vientoFrontalMs = 0,
  lluviaMmH = 0, altitudM = 0,
}, veh = MODEL_Y_RWD_LFP, ajustes = AJUSTES_CONSUMO) {
  if (distanciaM <= 0) return 0;
  const masa = veh.masaKg + (ajustes.cargaKg ?? veh.cargaKg);
  const seno = Math.max(-0.12, Math.min(0.12, desnivelM / distanciaM));
  const coseno = Math.sqrt(1 - seno * seno);
  const factorLluvia = lluviaMmH >= 0.5 ? 1.15 : 1;
  const rodadura = masa * G * veh.crr * coseno * factorLluvia;
  const aire = velocidadMs + vientoFrontalMs;
  const aerodinamica = 0.5 * densidadAire(temperaturaC, altitudM) * veh.cda * aire * Math.abs(aire);
  const gravedad = masa * G * seno;
  const traccionJ = (rodadura + aerodinamica + gravedad) * distanciaM;
  const factorFrio = 1 + Math.min(0.15, 0.006 * Math.max(0, 15 - temperaturaC));
  let bateriaJ = traccionJ > 0
    ? (traccionJ / veh.eficienciaTraccion) * factorFrio
    : traccionJ * veh.eficienciaRegeneracion;
  // Arrancar y frenar en ciudad: la energía cinética que no se recupera.
  const paradas = paradasPorKm(velocidadMs) * (distanciaM / 1000);
  bateriaJ += paradas * 0.5 * masa * velocidadMs ** 2 *
    (1 / veh.eficienciaTraccion - veh.eficienciaRegeneracion);
  const auxiliaresJ = potenciaAuxiliaresKw(temperaturaC, veh) * 1000 * (distanciaM / velocidadMs);
  return ((bateriaJ + auxiliaresJ) * (ajustes.factorConsumo ?? 1)) / 3.6e6;
}

// Recorre la ruta tramo a tramo y acumula energía (kWh) y tiempo (s) en cada
// vértice. `contexto.elevacion(d)` y `contexto.clima(d, unix)` son opcionales.
export function perfilRuta(ruta, contexto = {}, veh = MODEL_Y_RWD_LFP, ajustes = AJUSTES_CONSUMO) {
  const { puntos, segmentos, acum } = ruta;
  const n = puntos.length;
  const energia = new Float64Array(n);
  const tiempo = new Float64Array(n);
  const elevacion = contexto.elevacion || null;
  const clima = contexto.clima || null;
  const salida = contexto.salidaUnix ?? Date.now() / 1000;
  // Penalizaciones de giros y semáforos que OSRM suma al total pero no a los
  // tramos: se reparten proporcionalmente a la distancia.
  const sumaTramos = segmentos.reduce((s, x) => s + x.dur, 0);
  const extraPorM = Math.max(0, (ruta.duracionS ?? sumaTramos) - sumaTramos) / Math.max(1, acum[n - 1]);
  let distanciaRapida = 0;
  for (let k = 0; k < n - 1; k++) {
    const seg = segmentos[k];
    const distanciaM = seg.dist ?? acum[k + 1] - acum[k];
    const velocidadOsrm = seg.vel ?? (seg.dur > 0 ? distanciaM / seg.dur : 13.9);
    const v = velocidadReal(velocidadOsrm, ajustes.velocidadMaxKmh ?? 120);
    const dMedio = (acum[k] + acum[k + 1]) / 2;
    const desnivelM = elevacion ? elevacion(acum[k + 1]) - elevacion(acum[k]) : 0;
    const altitudM = elevacion ? elevacion(dMedio) : 0;
    let temperaturaC = ajustes.temperaturaDefecto ?? 20;
    let vientoFrontalMs = 0;
    let lluviaMmH = 0;
    if (clima) {
      const c = clima(dMedio, salida + tiempo[k]);
      if (c) {
        temperaturaC = c.temperaturaC ?? temperaturaC;
        lluviaMmH = c.lluviaMmH ?? 0;
        if (c.vientoMs) {
          const marcha = rumbo(puntos[k][0], puntos[k][1], puntos[k + 1][0], puntos[k + 1][1]);
          vientoFrontalMs = c.vientoMs * FACTOR_VIENTO_ALTURA * Math.cos(((c.vientoDesdeGrados - marcha) * Math.PI) / 180);
        }
      }
    }
    energia[k + 1] = energia[k] + energiaTramoKwh(
      { distanciaM, velocidadMs: v, desnivelM, temperaturaC, vientoFrontalMs, lluviaMmH, altitudM }, veh, ajustes);
    tiempo[k + 1] = tiempo[k] + distanciaM / v + extraPorM * distanciaM;
    if (v * 3.6 >= 85) distanciaRapida += distanciaM;
  }
  return { energia, tiempo, fraccionVia: distanciaRapida / Math.max(1, acum[n - 1]) };
}

// Interpolación lineal de una serie {d, valor} ordenada por d.
export function interpolador(muestras, campo = 'valor') {
  return (d) => {
    if (!muestras.length) return 0;
    if (d <= muestras[0].d) return muestras[0][campo];
    const ultimo = muestras[muestras.length - 1];
    if (d >= ultimo.d) return ultimo[campo];
    let lo = 0, hi = muestras.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (muestras[mid].d <= d) lo = mid; else hi = mid;
    }
    const a = muestras[lo], b = muestras[hi];
    const t = (d - a.d) / (b.d - a.d || 1);
    return a[campo] + (b[campo] - a[campo]) * t;
  };
}
