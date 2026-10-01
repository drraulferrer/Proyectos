// Tests del motor de cálculo. Ejecutar: node --test tesla-viajes/test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  distanciaM, rumbo, decodificarPolilinea, acumulada, remuestrear, IndiceRuta,
} from '../web/js/geo.js';
import {
  MODEL_Y_RWD_LFP, minutosCarga, potenciaEfectivaPunto, socTrasMinutos, potenciaCurva,
} from '../web/js/vehiculo.js';
import { energiaTramoKwh, perfilRuta, densidadAire, interpolador } from '../web/js/consumo.js';
import {
  cargarEstaciones, resumenPago, avisoAfir, abiertaEn, horarioLegible, nombreVisible, resumenConectores,
} from '../web/js/estaciones.js';
import { estacionesEnRuta, planificar, perfilSoc, pasaFiltros, OPCIONES_PLAN } from '../web/js/planificador.js';

const datosMuestra = JSON.parse(readFileSync(new URL('./fixtures/estaciones-muestra.json', import.meta.url), 'utf8'));
const estaciones = cargarEstaciones(datosMuestra);
const porNombre = (n) => estaciones.find((e) => e.nombre === n);
const whKm = (o) => energiaTramoKwh({ distanciaM: 1000, ...o }) * 1000;

// Ruta sintética recta hacia el este a lo largo del paralelo 40, con
// velocidades OSRM de autovía (96 km/h = 120 km/h etiquetados × 0,8).
function rutaRecta(km, { velOsrmKmh = 96, latitud = 40, lon0 = -4 } = {}) {
  const puntos = [];
  const pasoKm = 0.5;
  const gradosPorKm = 1 / (111.32 * Math.cos((latitud * Math.PI) / 180));
  for (let d = 0; d <= km + 1e-9; d += pasoKm) puntos.push([latitud, lon0 + d * gradosPorKm]);
  const acum = acumulada(puntos);
  const segmentos = [];
  for (let k = 0; k < puntos.length - 1; k++) {
    const dist = acum[k + 1] - acum[k];
    const vel = velOsrmKmh / 3.6;
    segmentos.push({ dist, dur: dist / vel, vel });
  }
  return { puntos, acum, segmentos, duracionS: segmentos.reduce((s, x) => s + x.dur, 0) };
}

function estacionSintetica(id, kmDesdeOrigen, { kw = 150, tesla = false, horario = '24/7', pagos = ['apps'] } = {}) {
  const gradosPorKm = 1 / (111.32 * Math.cos((40 * Math.PI) / 180));
  return {
    id, nombre: id, operador: { id: tesla ? 'ES*TSL' : 'ES*ZUN', marca: tesla ? 'Tesla Supercharger' : 'Zunder' },
    lat: 40.001, lon: -4 + kmDesdeOrigen * gradosPorKm, horario, pagos, esTesla: tesla,
    compatibleDc: true, kwCcsEfectiva: kw, kwCcs: kw, puntosCcs: 4, conectores: [],
  };
}

test('geo: distancia Madrid–Valencia en línea recta ≈ 302 km', () => {
  const d = distanciaM(40.4168, -3.7038, 39.4699, -0.3763) / 1000;
  assert.ok(d > 299 && d < 305, `${d}`);
  assert.ok(Math.abs(rumbo(40, 0, 40, 1) - 90) < 1);
});

test('geo: decodifica la polilínea de referencia de Google (precisión 5)', () => {
  const p = decodificarPolilinea('_p~iF~ps|U_ulLnnqC_mqNvxq`@', 5);
  assert.deepEqual(p, [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]);
});

test('geo: remuestreo e índice espacial de la ruta', () => {
  const ruta = rutaRecta(10);
  const muestras = remuestrear(ruta.puntos, ruta.acum, 1000);
  assert.equal(muestras.length, 11);
  const indice = new IndiceRuta(ruta.puntos, ruta.acum);
  const cerca = indice.masCercano(40.01, -4 + 5 / (111.32 * Math.cos((40 * Math.PI) / 180)), 3000);
  assert.ok(cerca && Math.abs(cerca.d - 5000) < 300, JSON.stringify(cerca));
  assert.equal(indice.masCercano(41, -4, 3000), null);
});

test('vehículo: 10→80 % en un cargador rápido ronda los 30 minutos', () => {
  const t = minutosCarga(10, 80, 250);
  assert.ok(t > 27 && t < 33, `${t}`);
  assert.ok(minutosCarga(10, 80, 50) > 45, 'a 50 kW tarda mucho más');
  assert.equal(minutosCarga(50, 40, 150), 0);
  assert.ok(potenciaCurva(5) > potenciaCurva(70));
  const s = socTrasMinutos(10, t, 250);
  assert.ok(Math.abs(s - 80) < 1, `${s}`);
});

test('vehículo: la intensidad máxima limita la potencia real a ~370 V', () => {
  assert.equal(Math.round(potenciaEfectivaPunto({ kw: 350, voltios: 800, amperios: 438 })), 162);
  assert.equal(potenciaEfectivaPunto({ kw: 180, voltios: 1000, amperios: 500 }), 180);
  assert.equal(potenciaEfectivaPunto({ kw: 60, voltios: 0, amperios: 0 }), 60);
  assert.equal(potenciaEfectivaPunto({ kw: 22, modo: 'AC3' }), MODEL_Y_RWD_LFP.maxAcKw);
});

test('consumo: valores verosímiles para un Model Y RWD', () => {
  const a120 = whKm({ velocidadMs: 120 / 3.6 });
  const a90 = whKm({ velocidadMs: 90 / 3.6 });
  assert.ok(a120 > 165 && a120 < 195, `120 km/h: ${a120}`);
  assert.ok(a90 > 115 && a90 < 140, `90 km/h: ${a90}`);
  assert.ok(whKm({ velocidadMs: 120 / 3.6, temperaturaC: 0 }) > a120 * 1.1, 'el frío gasta más');
  assert.ok(whKm({ velocidadMs: 120 / 3.6, vientoFrontalMs: 5 }) > a120, 'el viento de cara gasta más');
  assert.ok(whKm({ velocidadMs: 120 / 3.6, desnivelM: 30 }) > 2 * a120, 'subir un 3 % casi duplica');
  assert.ok(whKm({ velocidadMs: 120 / 3.6, desnivelM: -30 }) < 0.2 * a120, 'bajar un 3 % casi no gasta');
  assert.ok(densidadAire(20, 1000) < densidadAire(20, 0));
});

test('consumo: la calibración personal escala el gasto', () => {
  const base = energiaTramoKwh({ distanciaM: 1000, velocidadMs: 30 });
  const mas = energiaTramoKwh({ distanciaM: 1000, velocidadMs: 30 }, MODEL_Y_RWD_LFP, { factorConsumo: 1.1, cargaKg: 100 });
  assert.ok(Math.abs(mas / base - 1.1) < 1e-9);
});

test('consumo: perfil de ruta llana a 120 km/h', () => {
  const ruta = rutaRecta(100);
  const perfil = perfilRuta(ruta, {}, MODEL_Y_RWD_LFP, { velocidadMaxKmh: 120, factorConsumo: 1, temperaturaDefecto: 20 });
  const kwh = perfil.energia[perfil.energia.length - 1];
  assert.ok(Math.abs(kwh - whKm({ velocidadMs: 120 / 3.6 }) * 100 / 1000) < 0.05, `${kwh}`);
  const horas = perfil.tiempo[perfil.tiempo.length - 1] / 3600;
  assert.ok(Math.abs(horas - 100 / 120) < 0.01, `${horas}`);
  assert.ok(perfil.fraccionVia > 0.99);
});

test('consumo: el desnivel neto cuenta (Madrid a 650 m → costa)', () => {
  const ruta = rutaRecta(100);
  const bajada = interpolador([{ d: 0, valor: 650 }, { d: 100000, valor: 0 }]);
  const llano = perfilRuta(ruta, {});
  const conBajada = perfilRuta(ruta, { elevacion: bajada });
  const diferencia = llano.energia.at(-1) - conBajada.energia.at(-1);
  // m·g·h·η = 2030 × 9,81 × 650 × 0,9 aprox ≈ 3,3 kWh por debajo
  assert.ok(diferencia > 2.5 && diferencia < 4.5, `${diferencia}`);
});

test('estaciones: medios de pago y potencia real desde el registro', () => {
  const tesla = porNombre('Torrent Southbound, Spain');
  assert.equal(tesla.esTesla, true);
  assert.equal(resumenPago(tesla).principal, 'Automático con tu cuenta Tesla');
  assert.equal(tesla.puntosCcs, 2);
  const ionity = porNombre('IONITY Pola de Lena');
  assert.equal(ionity.kwCcsEfectiva, 162);
  assert.deepEqual(ionity.pagos, ['rfid']);
  assert.match(avisoAfir(ionity, new Date('2026-10-01')), /13 de abril de 2024/);
  const zunder = porNombre('Burgos - Calle de la Igualdad');
  assert.equal(resumenPago(zunder).principal, 'App · Tarjeta de crédito · Tarjeta RFID');
  assert.equal(avisoAfir(zunder), null);
  const endesa = estaciones.find((e) => e.nombre === '22XP22T3KKJAK00963');
  assert.equal(nombreVisible(endesa), 'Endesa X Way · Rinconada, La');
  assert.equal(endesa.compatibleDc, false);
  assert.equal(endesa.acNecesitaCable, true);
  assert.match(resumenConectores(endesa)[0], /lleva tu cable/);
});

test('estaciones: horarios, incluidos los tramos nocturnos', () => {
  const electra = porNombre('ELECTRA ALTO MIÑO');
  assert.equal(abiertaEn(electra, new Date(2026, 8, 28, 10, 0)), true); // lunes
  assert.equal(abiertaEn(electra, new Date(2026, 8, 28, 15, 0)), false);
  assert.equal(abiertaEn(electra, new Date(2026, 9, 3, 10, 0)), null); // sábado «00:00-00:00»
  assert.equal(horarioLegible(electra), 'L-V 08:00-14:00 · S-D sin dato');
  const raros = porNombre('Casos raros & potencia en kW');
  assert.equal(abiertaEn(raros, new Date(2026, 9, 2, 23, 0)), true); // viernes 23 h
  assert.equal(abiertaEn(raros, new Date(2026, 9, 3, 1, 30)), true); // sábado 1:30, sigue el tramo
  assert.equal(abiertaEn(raros, new Date(2026, 9, 3, 3, 0)), null); // sábado sin dato
  assert.equal(abiertaEn(raros, new Date(2026, 9, 2, 20, 0)), false); // viernes antes de las 22
  assert.equal(abiertaEn({ horario: null }, new Date()), null);
});

test('estaciones: un horario que contradice el «24/7» no la da por cerrada', () => {
  const madrid = porNombre('Madrid_1');
  assert.equal(madrid.horarioDudoso, true);
  assert.equal(abiertaEn(madrid, new Date(2026, 8, 30, 15, 0)), true); // miércoles 15 h
  assert.equal(abiertaEn(madrid, new Date(2026, 8, 30, 20, 0)), null); // fuera de tramo, pero dudoso
  assert.match(horarioLegible(madrid), /también la marca como 24 h/);
});

test('planificador: viaje sin paradas si la batería da de sobra', () => {
  const ruta = rutaRecta(100);
  const perfil = perfilRuta(ruta, {});
  const plan = planificar({ ruta, perfil, candidatos: [], socInicial: 90 });
  assert.equal(plan.factible, true);
  assert.equal(plan.paradas.length, 0);
  assert.ok(plan.socLlegada >= 15);
});

test('planificador: elige paradas y respeta reservas y carga máxima', () => {
  const ruta = rutaRecta(500);
  const perfil = perfilRuta(ruta, {});
  const lista = [80, 160, 210, 240, 330, 420].map((km, k) => estacionSintetica(`E${k}`, km, { kw: k === 2 ? 50 : 180 }));
  const candidatos = estacionesEnRuta(lista, ruta);
  assert.equal(candidatos.length, 6);
  const plan = planificar({ ruta, perfil, candidatos, socInicial: 90, salida: new Date(2026, 9, 1, 9, 0) });
  assert.equal(plan.factible, true, plan.motivo);
  assert.ok(plan.paradas.length >= 2 && plan.paradas.length <= 3, `${plan.paradas.length} paradas`);
  for (const p of plan.paradas) {
    assert.ok(p.socLlegada >= OPCIONES_PLAN.reservaParadaPct, `llega con ${p.socLlegada}`);
    assert.ok(p.socSalida <= OPCIONES_PLAN.cargaMaxPct, `sale con ${p.socSalida}`);
    assert.notEqual(p.estacion.id, 'E2', 'evita la de 50 kW si hay alternativas rápidas');
  }
  assert.ok(plan.socLlegada >= OPCIONES_PLAN.reservaDestinoPct);
  const soc = perfilSoc(ruta, perfil, plan, 90);
  assert.ok(Math.min(...soc) >= OPCIONES_PLAN.reservaParadaPct - 1.5, `mínimo ${Math.min(...soc)}`);
  assert.ok(Math.abs(soc.at(-1) - plan.socLlegada) < 1.5);
});

test('planificador: no propone una estación cerrada a la hora de llegada', () => {
  const ruta = rutaRecta(400);
  const perfil = perfilRuta(ruta, {});
  const cerrada = ['', '', '', '', '', '', ''];
  const lista = [
    estacionSintetica('cerrada', 200, { kw: 250, horario: cerrada }),
    estacionSintetica('abierta', 210, { kw: 100 }),
  ];
  const plan = planificar({ ruta, perfil, candidatos: estacionesEnRuta(lista, ruta), socInicial: 80 });
  assert.equal(plan.factible, true);
  assert.deepEqual(plan.paradas.map((p) => p.estacion.id), ['abierta']);
});

test('planificador: explica qué tramo no tiene cobertura', () => {
  const ruta = rutaRecta(600);
  const perfil = perfilRuta(ruta, {});
  const lista = [estacionSintetica('A', 100), estacionSintetica('B', 450)];
  const plan = planificar({ ruta, perfil, candidatos: estacionesEnRuta(lista, ruta), socInicial: 90 });
  assert.equal(plan.factible, false);
  assert.match(plan.motivo, /km 100 y el 4(49|50)/);
});

test('planificador: saliendo en reserva va primero al cargador más cercano', () => {
  const ruta = rutaRecta(300);
  const perfil = perfilRuta(ruta, {});
  const lista = [estacionSintetica('cerca', 12), estacionSintetica('lejos', 150)];
  const plan = planificar({ ruta, perfil, candidatos: estacionesEnRuta(lista, ruta), socInicial: 8 });
  assert.equal(plan.factible, true, plan.motivo);
  assert.equal(plan.paradas[0].estacion.id, 'cerca');
  assert.ok(plan.paradas[0].socLlegada >= OPCIONES_PLAN.margenTramoPct);
  const imposible = planificar({ ruta, perfil, candidatos: estacionesEnRuta([estacionSintetica('lejos', 150)], ruta), socInicial: 8 });
  assert.equal(imposible.factible, false);
  assert.match(imposible.motivo, /Zunder en .* km 150/);
});

test('planificador: filtros de pago y de Superchargers', () => {
  const tarjeta = estacionSintetica('T', 10, { pagos: ['creditCard'] });
  const soloApp = estacionSintetica('A', 10, { pagos: ['apps'] });
  const tesla = estacionSintetica('S', 10, { tesla: true, pagos: [] });
  const op = { ...OPCIONES_PLAN, pago: 'tarjeta' };
  assert.equal(pasaFiltros(tarjeta, op), true);
  assert.equal(pasaFiltros(soloApp, op), false);
  assert.equal(pasaFiltros(tesla, op), true, 'un Tesla paga solo en un Supercharger');
  assert.equal(pasaFiltros(soloApp, { ...OPCIONES_PLAN, soloTesla: true }), false);
});
