// Planificador de paradas de carga: busca los cargadores cercanos a la ruta y
// elige la combinación que llega antes al destino respetando la reserva de
// batería, la carga máxima por parada y el horario de cada estación.

import { IndiceRuta, indiceAnterior } from './geo.js';
import { minutosCarga, MODEL_Y_RWD_LFP } from './vehiculo.js';
import { abiertaEn, aceptaTarjetaBancaria } from './estaciones.js';

export const OPCIONES_PLAN = {
  reservaParadaPct: 10, // llegar a cada cargador con al menos esto
  reservaDestinoPct: 15, // y al destino con al menos esto
  margenTramoPct: 3, // nunca bajar de esto en mitad de un tramo
  cargaMaxPct: 80, // por encima la carga es lenta
  potenciaMinKw: 50,
  radioKm: 3, // distancia máxima en línea recta desde la ruta
  pago: 'cualquiera', // 'cualquiera' | 'tarjeta' | 'app'
  soloTesla: false,
  operadoresExcluidos: [],
  respetarHorario: true,
  minutosFijosTesla: 2, // enchufar y listo
  minutosFijosOtros: 5, // aparcar, identificarse o pagar con app o tarjeta
  consumoDesvioKwhKm: 0.17,
};

export function pasaFiltros(e, op = OPCIONES_PLAN) {
  if (!e.compatibleDc) return false;
  if (op.soloTesla && !e.esTesla) return false;
  if (!e.esTesla && e.kwCcsEfectiva < op.potenciaMinKw) return false;
  if (op.operadoresExcluidos?.includes(e.operador.id)) return false;
  if (op.pago === 'tarjeta' && !e.esTesla && !aceptaTarjetaBancaria(e)) return false;
  if (op.pago === 'app' && !e.esTesla && !e.pagos.includes('apps')) return false;
  return true;
}

// Estaciones a menos de radioKm de la ruta, ordenadas por punto kilométrico.
// Con `filtrar = false` devuelve todas las compatibles con DC (para la lista).
export function estacionesEnRuta(estaciones, ruta, op = OPCIONES_PLAN, { filtrar = true } = {}) {
  const indice = new IndiceRuta(ruta.puntos, ruta.acum);
  const radioM = op.radioKm * 1000;
  const resultado = [];
  for (const e of estaciones) {
    if (filtrar ? !pasaFiltros(e, op) : !e.compatibleDc) continue;
    const cerca = indice.masCercano(e.lat, e.lon, radioM);
    if (!cerca) continue;
    const lateralKm = cerca.distancia / 1000;
    // Ida y vuelta por carretera (factor 1,4 sobre la línea recta) más la
    // maniobra de salir y volver a entrar.
    const desvioKm = lateralKm < 0.15 ? 0.5 : 2 * lateralKm * 1.4 + 0.6;
    resultado.push({
      estacion: e,
      posM: cerca.d,
      lateralKm,
      desvioKm,
      desvioMin: (desvioKm / 40) * 60 + (lateralKm < 0.15 ? 1 : 2),
    });
  }
  resultado.sort((a, b) => a.posM - b.posM);
  return resultado;
}

// Tabla de máximos por rangos (sparse table) para saber cuánta energía se
// gasta como mucho dentro de un tramo con subidas y bajadas.
class MaximoEnRango {
  constructor(valores) {
    const n = valores.length;
    this.log = new Uint8Array(n + 1);
    for (let k = 2; k <= n; k++) this.log[k] = this.log[k >> 1] + 1;
    this.tabla = [Float64Array.from(valores)];
    for (let j = 1; (1 << j) <= n; j++) {
      const previa = this.tabla[j - 1];
      const fila = new Float64Array(n - (1 << j) + 1);
      for (let k = 0; k < fila.length; k++) fila[k] = Math.max(previa[k], previa[k + (1 << (j - 1))]);
      this.tabla.push(fila);
    }
  }

  maximo(a, b) {
    if (a > b) [a, b] = [b, a];
    const j = this.log[b - a + 1];
    return Math.max(this.tabla[j][a], this.tabla[j][b - (1 << j) + 1]);
  }
}

class ColaPrioridad {
  constructor() { this.datos = []; }
  get length() { return this.datos.length; }
  push(x) {
    const d = this.datos;
    d.push(x);
    let i = d.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (d[p][0] <= d[i][0]) break;
      [d[p], d[i]] = [d[i], d[p]];
      i = p;
    }
  }
  pop() {
    const d = this.datos;
    const cima = d[0];
    const ultimo = d.pop();
    if (d.length) {
      d[0] = ultimo;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < d.length && d[l][0] < d[m][0]) m = l;
        if (r < d.length && d[r][0] < d[m][0]) m = r;
        if (m === i) break;
        [d[m], d[i]] = [d[i], d[m]];
        i = m;
      }
    }
    return cima;
  }
}

// Energía (kWh) y tiempo (s) interpolados en la posición posM de la ruta.
export function enPosicion(ruta, perfil, posM) {
  const k = indiceAnterior(ruta.acum, posM);
  if (k >= ruta.acum.length - 1) {
    const u = ruta.acum.length - 1;
    return { energia: perfil.energia[u], tiempo: perfil.tiempo[u], indice: u };
  }
  const tramo = ruta.acum[k + 1] - ruta.acum[k];
  const t = tramo > 0 ? (posM - ruta.acum[k]) / tramo : 0;
  return {
    energia: perfil.energia[k] + (perfil.energia[k + 1] - perfil.energia[k]) * t,
    tiempo: perfil.tiempo[k] + (perfil.tiempo[k + 1] - perfil.tiempo[k]) * t,
    indice: k,
  };
}

// Calcula el plan. `salida` es un Date; `socInicial` en %.
export function planificar({ ruta, perfil, candidatos, socInicial, salida = new Date(), opciones = {}, veh = MODEL_Y_RWD_LFP }) {
  const op = { ...OPCIONES_PLAN, ...opciones };
  const cap = veh.capacidadUtilKwh;
  const total = ruta.acum[ruta.acum.length - 1];
  const nodos = [
    { tipo: 'origen', posM: 0, desvioKm: 0, desvioMin: 0 },
    ...candidatos.map((c) => ({ tipo: 'estacion', ...c })),
    { tipo: 'destino', posM: total, desvioKm: 0, desvioMin: 0 },
  ];
  for (const n of nodos) Object.assign(n, enPosicion(ruta, perfil, n.posM));
  const maximos = new MaximoEnRango(perfil.energia);
  const pct = (kwh) => (kwh / cap) * 100;
  const desvioPct = (n) => pct((n.desvioKm / 2) * op.consumoDesvioKwhKm);
  const ultimo = nodos.length - 1;

  // Energía necesaria de i a j y pico de gasto dentro del tramo (en %).
  function tramo(i, j) {
    const a = nodos[i], b = nodos[j];
    const necesario = pct(b.energia - a.energia) + desvioPct(a) + desvioPct(b);
    const pico = pct(maximos.maximo(a.indice, b.indice) - a.energia) + desvioPct(a);
    const segundos = b.tiempo - a.tiempo + (a.desvioMin / 2 + b.desvioMin / 2) * 60;
    return { necesario, pico, segundos };
  }

  // Si se sale con poca batería, al primer cargador se puede llegar con menos
  // reserva (nunca por debajo del margen de seguridad): es mejor ir a cargar
  // que no tener plan.
  const s0Real = Math.max(0, Math.min(100, socInicial));
  const reservaPrimerTramo = Math.min(op.reservaParadaPct, Math.max(op.margenTramoPct, s0Real - 5));
  const mejorTiempo = nodos.map(() => new Float64Array(101).fill(Infinity));
  const previo = nodos.map(() => new Array(101).fill(null));
  const socMaxCerrado = new Float64Array(nodos.length).fill(-1);
  const cola = new ColaPrioridad();
  const s0 = Math.max(0, Math.min(100, Math.round(socInicial)));
  mejorTiempo[0][s0] = 0;
  cola.push([0, 0, s0]);
  let final = null;

  while (cola.length) {
    const [t, i, s] = cola.pop();
    if (t > mejorTiempo[i][s]) continue;
    if (s <= socMaxCerrado[i]) continue; // otra etiqueta llegó antes con más batería
    socMaxCerrado[i] = s;
    if (i === ultimo) { final = { s, t }; break; }
    const nodo = nodos[i];
    const puedeCargar = nodo.tipo === 'estacion';
    const tope = puedeCargar ? Math.max(s, op.cargaMaxPct) : s;
    for (let j = i + 1; j <= ultimo; j++) {
      const { necesario, pico, segundos } = tramo(i, j);
      const reserva = j === ultimo ? op.reservaDestinoPct : i === 0 ? reservaPrimerTramo : op.reservaParadaPct;
      const requerido = Math.max(necesario + reserva, pico + op.margenTramoPct);
      if (requerido > tope) {
        // Más lejos solo puede costar más salvo bajadas largas: se sigue
        // mirando mientras el gasto bruto no supere la batería disponible.
        if (necesario > 100) break;
        continue;
      }
      const sSalida = Math.min(100, Math.max(s, Math.ceil(requerido)));
      let minCarga = 0;
      if (sSalida > s) {
        minCarga = minutosCarga(s, sSalida, nodo.estacion.kwCcsEfectiva, { veh }) +
          (nodo.estacion.esTesla ? op.minutosFijosTesla : op.minutosFijosOtros);
      }
      const llegada = t + minCarga * 60 + segundos;
      const destino = nodos[j];
      if (destino.tipo === 'estacion' && op.respetarHorario &&
          abiertaEn(destino.estacion, new Date(salida.getTime() + llegada * 1000)) === false) continue;
      const sLlegada = Math.max(0, Math.min(100, Math.floor(sSalida - necesario)));
      if (llegada < mejorTiempo[j][sLlegada]) {
        mejorTiempo[j][sLlegada] = llegada;
        previo[j][sLlegada] = { i, s, sSalida, minCarga };
        cola.push([llegada, j, sLlegada]);
      }
    }
  }

  if (!final) return { factible: false, ...diagnostico(nodos, tramo, socInicial, { ...op, reservaPrimerTramo }) };

  // Reconstrucción del camino.
  const pasos = [];
  let j = ultimo, s = final.s;
  while (j !== 0) {
    const p = previo[j][s];
    pasos.unshift({ desde: p.i, hasta: j, socSalida: p.sSalida, socLlegada: s, minCarga: p.minCarga, socAntes: p.s });
    j = p.i;
    s = p.s;
  }
  const paradas = [];
  let tiempo = 0;
  for (const paso of pasos) {
    const nodo = nodos[paso.desde];
    if (nodo.tipo === 'estacion') {
      const llegada = new Date(salida.getTime() + tiempo * 1000);
      paradas.push({
        estacion: nodo.estacion,
        posM: nodo.posM,
        desvioKm: nodo.desvioKm,
        socLlegada: paso.socAntes,
        socSalida: paso.socSalida,
        minutosCarga: Math.round(paso.minCarga),
        llegada,
        salida: new Date(llegada.getTime() + paso.minCarga * 60000),
        horarioDesconocido: abiertaEn(nodo.estacion, llegada) === null,
      });
    }
    tiempo += paso.minCarga * 60 + tramo(paso.desde, paso.hasta).segundos;
  }
  const minutosCargaTotal = paradas.reduce((x, p) => x + p.minutosCarga, 0);
  return {
    factible: true,
    paradas,
    socLlegada: final.s,
    llegada: new Date(salida.getTime() + final.t * 1000),
    duracionMin: Math.round(final.t / 60),
    minutosCarga: minutosCargaTotal,
    minutosConduccion: Math.round(final.t / 60 - minutosCargaTotal),
    energiaKwh: perfil.energia[perfil.energia.length - 1],
    distanciaKm: total / 1000,
  };
}

function nombreParaMotivo(nodo) {
  const e = nodo.estacion;
  return e.esTesla ? `el Supercharger de ${e.municipio || e.nombre}` : `${e.operador.marca} en ${e.municipio || e.nombre}`;
}

function diagnostico(nodos, tramo, socInicial, op) {
  const ultimo = nodos.length - 1;
  // ¿Llega al menos al primer cargador?
  const alcanceInicial = nodos.findIndex((n, k) => k > 0 &&
    Math.max(tramo(0, k).necesario + (k === ultimo ? op.reservaDestinoPct : op.reservaPrimerTramo),
      tramo(0, k).pico + op.margenTramoPct) <= socInicial);
  if (alcanceInicial === -1) {
    const primero = nodos[1];
    if (!primero || primero.tipo !== 'estacion') {
      return { motivo: 'No hay cargadores que cumplan los filtros cerca de la ruta y la batería no alcanza para llegar.' };
    }
    return {
      motivo: `Con un ${Math.round(socInicial)} % no llegas ni al primer cargador que cumple los filtros, ` +
        `${nombreParaMotivo(primero)} en el km ${Math.round(primero.posM / 1000)}: necesitarías un ` +
        `${Math.ceil(tramo(0, 1).necesario + op.margenTramoPct)} %. Carga antes de salir o relaja los filtros.`,
    };
  }
  // Mayor hueco entre cargadores consecutivos.
  let peor = { gasto: 0, desde: 0, hasta: 0 };
  for (let k = 0; k < ultimo; k++) {
    const g = tramo(k, k + 1).necesario;
    if (g > peor.gasto) peor = { gasto: g, desde: nodos[k].posM, hasta: nodos[k + 1].posM };
  }
  const util = op.cargaMaxPct - op.reservaParadaPct;
  if (peor.gasto > util) {
    return {
      motivo: `Entre el km ${Math.round(peor.desde / 1000)} y el ${Math.round(peor.hasta / 1000)} no hay cargadores que cumplan los filtros ` +
        `y ese tramo gasta un ${Math.round(peor.gasto)} % de batería (con cargas al ${op.cargaMaxPct} % solo dispones de un ${util} %).`,
      hueco: peor,
    };
  }
  return { motivo: 'No hay combinación de paradas que cumpla la reserva, la carga máxima y los horarios. Prueba a relajar los filtros.' };
}

// % de batería previsto en cada punto de la ruta según el plan (para la
// gráfica y para «llegarías con…» en la lista de cargadores).
export function perfilSoc(ruta, perfil, plan, socInicial, veh = MODEL_Y_RWD_LFP) {
  const cap = veh.capacidadUtilKwh;
  const recargas = (plan?.paradas || []).map((p) => {
    const pos = enPosicion(ruta, perfil, p.posM);
    return { k: pos.indice, soc: p.socSalida, energia: pos.energia };
  });
  const soc = new Float64Array(ruta.acum.length);
  let base = socInicial, energiaBase = 0, siguiente = 0;
  for (let k = 0; k < soc.length; k++) {
    // Tras cada parada se parte del % con el que se sale del cargador.
    while (siguiente < recargas.length && recargas[siguiente].k < k) {
      base = recargas[siguiente].soc;
      energiaBase = recargas[siguiente++].energia;
    }
    soc[k] = base - ((perfil.energia[k] - energiaBase) / cap) * 100;
  }
  return soc;
}

// Recalcula un plan con paradas ya fijadas sobre una ruta que pasa por ellas
// (la que devuelve OSRM con los cargadores como puntos de paso). En cada
// parada carga lo justo para el siguiente tramo, sin pasar de la carga máxima.
export function simularParadas({ ruta, perfil, estacionesParada, posiciones, socInicial, salida = new Date(), opciones = {}, veh = MODEL_Y_RWD_LFP }) {
  const op = { ...OPCIONES_PLAN, ...opciones };
  const cap = veh.capacidadUtilKwh;
  const total = ruta.acum[ruta.acum.length - 1];
  const hitos = [0, ...posiciones, total].map((posM) => ({ posM, ...enPosicion(ruta, perfil, posM) }));
  const pct = (kwh) => (kwh / cap) * 100;
  let s = socInicial, t = 0, minimo = socInicial, minutosCargaTotal = 0;
  const paradas = [];
  for (let k = 0; k < hitos.length - 1; k++) {
    const a = hitos[k], b = hitos[k + 1];
    let pico = -Infinity;
    for (let i = a.indice; i <= b.indice; i++) pico = Math.max(pico, perfil.energia[i]);
    const necesario = pct(b.energia - a.energia);
    const picoPct = pct(pico - a.energia);
    if (k > 0) {
      const estacion = estacionesParada[k - 1];
      const reserva = k + 1 === hitos.length - 1 ? op.reservaDestinoPct : op.reservaParadaPct;
      const requerido = Math.ceil(Math.max(necesario + reserva, picoPct + op.margenTramoPct));
      const objetivo = Math.min(Math.max(s, op.cargaMaxPct), Math.max(s, requerido));
      const minCarga = objetivo > s
        ? minutosCarga(s, objetivo, estacion.kwCcsEfectiva, { veh }) + (estacion.esTesla ? op.minutosFijosTesla : op.minutosFijosOtros)
        : 0;
      const llegada = new Date(salida.getTime() + t * 1000);
      const abierta = abiertaEn(estacion, llegada);
      paradas.push({
        estacion,
        posM: a.posM,
        desvioKm: 0,
        socLlegada: Math.round(s),
        socSalida: Math.round(objetivo),
        minutosCarga: Math.round(minCarga),
        llegada,
        salida: new Date(llegada.getTime() + minCarga * 60000),
        horarioDesconocido: abierta === null,
        cerradaAlLlegar: abierta === false,
      });
      t += minCarga * 60;
      minutosCargaTotal += minCarga;
      s = objetivo;
    }
    minimo = Math.min(minimo, s - picoPct);
    s -= necesario;
    t += b.tiempo - a.tiempo;
  }
  const llegaCorto = s < op.reservaDestinoPct - 1 || paradas.some((p) => p.socLlegada < op.reservaParadaPct - 1);
  return {
    factible: true,
    paradas,
    socLlegada: Math.round(s),
    socMinimo: minimo,
    llegada: new Date(salida.getTime() + t * 1000),
    duracionMin: Math.round(t / 60),
    minutosCarga: Math.round(minutosCargaTotal),
    minutosConduccion: Math.round(t / 60 - minutosCargaTotal),
    energiaKwh: perfil.energia[perfil.energia.length - 1],
    distanciaKm: total / 1000,
    alerta: llegaCorto
      ? 'Con la ruta exacta por los cargadores, algún tramo queda por debajo de la reserva. Sube la carga máxima o la reserva y vuelve a calcular.'
      : null,
  };
}
