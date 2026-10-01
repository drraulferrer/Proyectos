// Lectura del JSON compacto del registro oficial y todo lo que la interfaz
// necesita saber de cada estación: compatibilidad con el Model Y, potencia
// real, medios de pago y si está abierta a una hora dada.

import { MODEL_Y_RWD_LFP, potenciaEfectivaPunto } from './vehiculo.js';

export const NOMBRES_CONECTOR = {
  C2: 'CCS2', T2: 'Tipo 2', CH: 'CHAdeMO', SK: 'Schuko', T1: 'Tipo 1', C1: 'CCS1', IN: 'Industrial', OT: 'Otro',
};

// Medios de pago e identificación, en el orden en que se muestran.
export const MEDIOS_PAGO = [
  { clave: 'apps', etiqueta: 'App', detalle: 'Pago con la app del operador o de una red de roaming' },
  { clave: 'creditCard', etiqueta: 'Tarjeta de crédito', detalle: 'Terminal para tarjeta de crédito en el cargador' },
  { clave: 'debitCard', etiqueta: 'Tarjeta de débito', detalle: 'Terminal para tarjeta de débito en el cargador' },
  { clave: 'pinpad', etiqueta: 'Datáfono con PIN', detalle: 'Terminal bancario con teclado PIN' },
  { clave: 'nfc', etiqueta: 'NFC', detalle: 'Identificación sin contacto por NFC (móvil o tarjeta)' },
  { clave: 'rfid', etiqueta: 'Tarjeta RFID', detalle: 'Tarjeta o llavero RFID del operador o de roaming' },
];

export const SERVICIOS = {
  foodShopping: 'Supermercado', restaurant: 'Restaurante', cafe: 'Cafetería', leisureActivities: 'Ocio',
  petrolStation: 'Gasolinera', shop: 'Tienda', hotel: 'Hotel', bikeSharing: 'Bicicletas',
  parkingSite: 'Aparcamiento', publicTransportHub: 'Transporte público', trainStation: 'Estación de tren',
  airport: 'Aeropuerto',
};

export const TIPOS_SITIO = { a: 'Al aire libre', v: 'En la vía pública', e: 'En edificio o parking', o: 'Otro' };

const ID_TESLA = 'ES*TSL';
const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function cargarEstaciones(datos, veh = MODEL_Y_RWD_LFP) {
  const i = Object.fromEntries(datos.campos.map((c, k) => [c, k]));
  const bitsPago = datos.bits_pago;
  const bitsServicio = datos.bits_servicio;
  const operadores = datos.operadores;
  return datos.estaciones.map((f) => {
    const op = operadores[f[i.operador]] || { id: '', marca: 'Desconocido', razon_social: '' };
    const conectores = f[i.conectores].map(([tipo, modo, formato, kw, voltios, amperios, n]) =>
      ({ tipo, modo, formato, kw, voltios, amperios, n }));
    const e = {
      id: f[i.id],
      nombre: f[i.nombre],
      operador: op,
      lat: f[i.lat],
      lon: f[i.lon],
      direccion: f[i.direccion],
      municipio: f[i.municipio],
      provincia: f[i.provincia],
      cp: f[i.cp],
      horario: f[i.horario],
      pagosBits: f[i.pagos],
      pagos: MEDIOS_PAGO.filter((m) => f[i.pagos] & bitsPago[m.clave]).map((m) => m.clave),
      tipo: f[i.tipo],
      servicios: Object.keys(SERVICIOS).filter((s) => f[i.servicios] & (bitsServicio[s] || 0)),
      actualizado: f[i.actualizado],
      puntos: f[i.puntos],
      conectores,
      esTesla: op.id === ID_TESLA,
    };
    Object.assign(e, compatibilidad(e, veh));
    return e;
  });
}

// Qué puede usar el Model Y aquí y a qué potencia real.
export function compatibilidad(e, veh = MODEL_Y_RWD_LFP) {
  let ccs = 0, kwCcs = 0, kwCcsEfectiva = 0, ac = 0, kwAc = 0, kwAcEfectiva = 0, acNecesitaCable = true;
  for (const c of e.conectores) {
    if (c.tipo === 'C2' && c.modo === 'DC') {
      ccs += c.n;
      kwCcs = Math.max(kwCcs, c.kw);
      kwCcsEfectiva = Math.max(kwCcsEfectiva, potenciaEfectivaPunto(c, veh));
    } else if (c.tipo === 'T2' && c.modo !== 'DC') {
      ac += c.n;
      kwAc = Math.max(kwAc, c.kw);
      kwAcEfectiva = Math.max(kwAcEfectiva, potenciaEfectivaPunto(c, veh));
      if (c.formato === 'c') acNecesitaCable = false;
    }
  }
  return {
    puntosCcs: ccs,
    kwCcs,
    kwCcsEfectiva: Math.round(kwCcsEfectiva),
    puntosAc: ac,
    kwAc,
    kwAcEfectiva: Math.round(kwAcEfectiva * 10) / 10,
    acNecesitaCable: ac > 0 && acNecesitaCable,
    compatibleDc: ccs > 0 && kwCcsEfectiva > 0,
    compatible: (ccs > 0 && kwCcsEfectiva > 0) || ac > 0,
  };
}

export function nombreVisible(e) {
  const pareceCodigo = /^[A-Z0-9_*\-]{8,}$/i.test(e.nombre) && /\d/.test(e.nombre) && !/\s/.test(e.nombre);
  if (!e.nombre || pareceCodigo) return `${e.operador.marca} · ${e.municipio || e.direccion}`;
  return e.nombre;
}

export function aceptaTarjetaBancaria(e) {
  return e.pagos.some((p) => p === 'creditCard' || p === 'debitCard' || p === 'pinpad');
}

// Descripción del pago pensada para un conductor de Tesla.
export function resumenPago(e) {
  if (e.esTesla) {
    return {
      principal: 'Automático con tu cuenta Tesla',
      detalle: 'Enchufar y cargar: se cobra en el método de pago de tu cuenta Tesla. No necesitas app ni tarjeta.',
      medios: e.pagos,
    };
  }
  if (!e.pagos.length) {
    return { principal: 'No declarado', detalle: 'El operador no ha declarado medios de pago en el registro oficial.', medios: [] };
  }
  const etiquetas = MEDIOS_PAGO.filter((m) => e.pagos.includes(m.clave)).map((m) => m.etiqueta);
  return { principal: etiquetas.join(' · '), detalle: '', medios: e.pagos };
}

// Aviso del Reglamento (UE) 2023/1804 (AFIR) cuando un punto ≥50 kW no
// declara pago con tarjeta. No afirma que la tenga: solo explica la norma.
export function avisoAfir(e, fecha = new Date()) {
  if (e.esTesla || e.kwCcs < 50 || aceptaTarjetaBancaria(e)) return null;
  const desde2027 = fecha >= new Date('2027-01-01T00:00:00Z');
  return desde2027
    ? 'No declara pago con tarjeta. Desde el 1 de enero de 2027, los puntos de 50 kW o más de la red transeuropea deben aceptarla (AFIR).'
    : 'No declara pago con tarjeta. AFIR la exige en los puntos de 50 kW o más instalados desde el 13 de abril de 2024, y en los de la red transeuropea a partir del 1 de enero de 2027.';
}

function minutosDelDia(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// ¿Abierta en `fecha` (Date, hora local del navegador = hora de España)?
// Devuelve true, false o null si el horario es desconocido.
export function abiertaEn(e, fecha) {
  if (e.horario === '24/7') return true;
  if (!Array.isArray(e.horario)) return null;
  const dia = (fecha.getDay() + 6) % 7; // lunes = 0
  const minuto = fecha.getHours() * 60 + fecha.getMinutes();
  const dentro = (texto, d, m) => texto.split(',').filter(Boolean).some((tramo) => {
    const [a, b] = tramo.split('-').map(minutosDelDia);
    return b > a ? m >= a && m < b : m >= a; // los tramos nocturnos siguen al día siguiente
  });
  if (dentro(e.horario[dia], dia, minuto)) return true;
  // Tramo nocturno que empezó el día anterior (p. ej. viernes 22:00-02:00).
  const anterior = e.horario[(dia + 6) % 7];
  return anterior.split(',').filter(Boolean).some((tramo) => {
    const [a, b] = tramo.split('-').map(minutosDelDia);
    return b <= a && minuto < b;
  });
}

export function horarioLegible(e) {
  if (e.horario === '24/7') return '24 horas, todos los días';
  if (!Array.isArray(e.horario)) return 'Horario no declarado';
  const grupos = [];
  e.horario.forEach((h, d) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.h === h) ultimo.hasta = d;
    else grupos.push({ desde: d, hasta: d, h });
  });
  return grupos.map((g) => {
    const dias = g.desde === g.hasta ? DIAS_CORTOS[g.desde] : `${DIAS_CORTOS[g.desde]}-${DIAS_CORTOS[g.hasta]}`;
    const horas = g.h ? g.h.replaceAll('00:00-24:00', '24 h').replaceAll(',', ' y ') : 'cerrado';
    return `${dias} ${horas}`;
  }).join(' · ');
}

export function resumenConectores(e) {
  return e.conectores.map((c) => {
    const corriente = c.modo === 'DC' ? 'CC' : 'CA';
    const formato = c.modo !== 'DC' && c.formato === 's' ? ', enchufe (lleva tu cable)' : '';
    return `${c.n} × ${NOMBRES_CONECTOR[c.tipo] || c.tipo} ${corriente} ${formatoKw(c.kw)}${formato}`;
  });
}

export function formatoKw(kw) {
  return `${Number.isInteger(kw) ? kw : kw.toFixed(1).replace('.', ',')} kW`;
}
