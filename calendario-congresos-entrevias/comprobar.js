#!/usr/bin/env node
/*
 * Comprobaciones del calendario de comunicaciones (CS Entrevías).
 * Uso: node comprobar.js   (Node 18 o superior, sin dependencias)
 *
 * 1) Prueba las funciones puras de logica.js con casos conocidos.
 * 2) Valida que los datos iniciales de datos.js cumplen las reglas de
 *    integridad de la especificación.
 * Termina con código 0 si todo pasa, y distinto de 0 si algo falla.
 */
"use strict";

const L = require("./logica.js");
const DATOS = require("./datos.js");

let superadas = 0;
const fallos = [];

function prueba(nombre, condicion) {
  if (condicion) {
    superadas++;
  } else {
    fallos.push(nombre);
  }
}

function igual(nombre, obtenido, esperado) {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado);
  prueba(nombre + " → obtenido " + JSON.stringify(obtenido) + ", esperado " + JSON.stringify(esperado), ok);
}

// ---------- esFechaISO ----------
prueba("esFechaISO acepta una fecha normal", L.esFechaISO("2026-07-15") === true);
prueba("esFechaISO acepta el 29 de febrero bisiesto", L.esFechaISO("2024-02-29") === true);
prueba("esFechaISO rechaza el 29 de febrero no bisiesto", L.esFechaISO("2023-02-29") === false);
prueba("esFechaISO rechaza el 30 de febrero", L.esFechaISO("2026-02-30") === false);
prueba("esFechaISO rechaza formato sin ceros", L.esFechaISO("2026-2-3") === false);
prueba("esFechaISO rechaza texto", L.esFechaISO("mañana") === false);
prueba("esFechaISO rechaza null", L.esFechaISO(null) === false);
prueba("esFechaISO rechaza mes 13", L.esFechaISO("2026-13-01") === false);

// ---------- diasHasta ----------
igual("diasHasta a 5 días vista", L.diasHasta("2026-07-20", "2026-07-15"), 5);
igual("diasHasta el mismo día", L.diasHasta("2026-07-15", "2026-07-15"), 0);
igual("diasHasta ayer", L.diasHasta("2026-07-14", "2026-07-15"), -1);
igual("diasHasta cruza el cambio de hora de octubre", L.diasHasta("2026-11-05", "2026-07-15"), 113);
igual("diasHasta cruza el cambio de año", L.diasHasta("2027-01-02", "2026-12-30"), 3);

// ---------- clasificarPlazo (límites de la especificación RA-05) ----------
igual("plazo de ayer → vencido", L.clasificarPlazo("2026-07-14", "2026-07-15"), "vencido");
igual("plazo hoy → urgente", L.clasificarPlazo("2026-07-15", "2026-07-15"), "urgente");
igual("plazo a 7 días → urgente", L.clasificarPlazo("2026-07-22", "2026-07-15"), "urgente");
igual("plazo a 8 días → proximo", L.clasificarPlazo("2026-07-23", "2026-07-15"), "proximo");
igual("plazo a 30 días → proximo", L.clasificarPlazo("2026-08-14", "2026-07-15"), "proximo");
igual("plazo a 31 días → normal", L.clasificarPlazo("2026-08-15", "2026-07-15"), "normal");

// ---------- textoDiasRestantes ----------
igual("texto para hoy", L.textoDiasRestantes(0), "¡hoy!");
igual("texto para mañana", L.textoDiasRestantes(1), "mañana");
igual("texto para 5 días", L.textoDiasRestantes(5), "en 5 días");
igual("texto para ayer", L.textoDiasRestantes(-1), "venció ayer");
igual("texto para hace 3 días", L.textoDiasRestantes(-3), "venció hace 3 días");

// ---------- formateo de fechas ----------
igual("formatearFecha", L.formatearFecha("2026-11-05"), "5 nov 2026");
igual("rango en el mismo mes", L.formatearRango("2026-11-05", "2026-11-07"), "5–7 nov 2026");
igual("rango entre meses", L.formatearRango("2027-04-30", "2027-05-02"), "30 abr – 2 may 2027");
igual("rango de un solo día", L.formatearRango("2027-05-12", "2027-05-12"), "12 may 2027");
igual("rango entre años", L.formatearRango("2026-12-30", "2027-01-02"), "30 dic 2026 – 2 ene 2027");

// ---------- orden y filtrado de plazos ----------
const congresosPrueba = [
  { id: "c1", nombre: "Sin plazo", plazoResumenes: null },
  { id: "c2", nombre: "Plazo lejano", plazoResumenes: "2026-12-01" },
  { id: "c3", nombre: "Plazo vencido", plazoResumenes: "2026-07-01" },
  { id: "c4", nombre: "Plazo cercano", plazoResumenes: "2026-08-01" },
  { id: "c5", nombre: "Plazo hoy", plazoResumenes: "2026-07-15" }
];
igual(
  "congresosConPlazoFuturo filtra vencidos y ordena por plazo",
  L.congresosConPlazoFuturo(congresosPrueba, "2026-07-15").map(function (c) { return c.id; }),
  ["c5", "c4", "c2"]
);
igual(
  "congresosSinPlazo devuelve los que no tienen plazo",
  L.congresosSinPlazo(congresosPrueba).map(function (c) { return c.id; }),
  ["c1"]
);
igual(
  "congresosPorInicio ordena por fecha de inicio sin mutar el original",
  L.congresosPorInicio([
    { id: "b", inicio: "2027-03-01" },
    { id: "a", inicio: "2026-01-01" },
    { id: "c", inicio: "2027-11-01" }
  ]).map(function (c) { return c.id; }),
  ["a", "b", "c"]
);

// ---------- marcas del calendario ----------
const marcas2026 = L.marcasDeAnio(
  [{ id: "x", nombre: "Cruce de año", inicio: "2026-12-30", fin: "2027-01-02", plazoResumenes: "2026-10-01" }],
  2026
);
igual("marcasDeAnio incluye los días del congreso dentro del año", Object.keys(marcas2026).sort(),
  ["2026-10-01", "2026-12-30", "2026-12-31"]);
prueba("marcasDeAnio distingue el día de plazo", marcas2026["2026-10-01"].plazos.length === 1 && marcas2026["2026-10-01"].congresos.length === 0);
const marcas2027 = L.marcasDeAnio(
  [{ id: "x", nombre: "Cruce de año", inicio: "2026-12-30", fin: "2027-01-02", plazoResumenes: "2026-10-01" }],
  2027
);
igual("marcasDeAnio recorta al año siguiente", Object.keys(marcas2027).sort(), ["2027-01-01", "2027-01-02"]);
// Fecha de fin absurda (errata de tecleo): no debe colgarse ni marcar fuera del año.
const inicioPatologico = Date.now();
const marcasPatologicas = L.marcasDeAnio(
  [{ id: "y", nombre: "Errata", inicio: "2026-06-01", fin: "2999-06-01", plazoResumenes: null }],
  2026
);
prueba("marcasDeAnio acota fechas de fin absurdas al año (no marca fuera de 2026)",
  Object.keys(marcasPatologicas).every(function (iso) { return iso.slice(0, 4) === "2026"; }) &&
  Object.keys(marcasPatologicas).length === 214); // del 1 jun al 31 dic de 2026
prueba("marcasDeAnio con fecha absurda no se cuelga (termina rápido)", Date.now() - inicioPatologico < 1000);

// ---------- validarDatos ----------
function datosValidos() {
  return {
    version: 1,
    congresos: [{
      id: "congreso-a",
      nombre: "Congreso A",
      organizador: "Sociedad A",
      ambito: "dolor",
      lugar: "Madrid",
      inicio: "2026-10-01",
      fin: "2026-10-03",
      plazoResumenes: "2026-09-01",
      plazoPorConfirmar: false,
      web: "",
      notas: ""
    }],
    comunicaciones: [{
      id: "comunicacion-a",
      titulo: "Comunicación A",
      congresoId: "congreso-a",
      tipo: "poster",
      responsable: "Alguien",
      autores: "",
      estado: "idea",
      notas: ""
    }]
  };
}

igual("validarDatos acepta datos correctos", L.validarDatos(datosValidos()), []);

function esperarError(nombre, mutar, fragmento) {
  const datos = datosValidos();
  mutar(datos);
  const errores = L.validarDatos(datos);
  prueba(
    nombre + " → errores: " + JSON.stringify(errores),
    errores.length > 0 && errores.some(function (e) { return e.includes(fragmento); })
  );
}

esperarError("detecta datos que no son un objeto", function (d) { d.congresos = "no"; }, "congresos");
esperarError("detecta id de congreso repetido", function (d) {
  d.congresos.push(Object.assign({}, d.congresos[0]));
}, "repetido");
esperarError("detecta congreso sin nombre", function (d) { d.congresos[0].nombre = "  "; }, "nombre");
esperarError("detecta fecha de inicio inválida", function (d) { d.congresos[0].inicio = "01/10/2026"; }, "inicio no es válida");
esperarError("detecta fin anterior al inicio", function (d) { d.congresos[0].fin = "2026-09-30"; }, "anterior al inicio");
esperarError("detecta plazo posterior al inicio", function (d) { d.congresos[0].plazoResumenes = "2026-10-02"; }, "posterior al inicio");
esperarError("detecta plazo con formato inválido", function (d) { d.congresos[0].plazoResumenes = "pronto"; }, "plazo de resúmenes");
esperarError("detecta ámbito desconocido", function (d) { d.congresos[0].ambito = "astrofisica"; }, "ámbito desconocido");
esperarError("detecta plazoPorConfirmar no booleano", function (d) { d.congresos[0].plazoPorConfirmar = "sí"; }, "plazoPorConfirmar");
esperarError("detecta comunicación sin título", function (d) { d.comunicaciones[0].titulo = ""; }, "título");
esperarError("detecta id de comunicación repetido", function (d) {
  d.comunicaciones.push(Object.assign({}, d.comunicaciones[0]));
}, "repetido");
esperarError("detecta congreso inexistente en comunicación", function (d) { d.comunicaciones[0].congresoId = "no-existe"; }, "no existe");
esperarError("detecta tipo desconocido", function (d) { d.comunicaciones[0].tipo = "holograma"; }, "tipo desconocido");
esperarError("detecta estado desconocido", function (d) { d.comunicaciones[0].estado = "perdida"; }, "estado desconocido");
igual("validarDatos con algo que no es objeto", L.validarDatos("hola").length, 1);

// ---------- datos iniciales reales (RA-02) ----------
const erroresDatos = L.validarDatos(DATOS);
prueba("datos.js cumple las reglas de integridad → " + JSON.stringify(erroresDatos), erroresDatos.length === 0);
prueba("datos.js incluye al menos 4 congresos", Array.isArray(DATOS.congresos) && DATOS.congresos.length >= 4);
prueba("datos.js incluye al menos 2 comunicaciones", Array.isArray(DATOS.comunicaciones) && DATOS.comunicaciones.length >= 2);
prueba("hay al menos un congreso sin plazo anunciado (para la vista RA-06)",
  DATOS.congresos.some(function (c) { return c.plazoResumenes === null; }));

// ---------- resultado ----------
if (fallos.length === 0) {
  console.log("✔ Todo correcto: " + superadas + " comprobaciones superadas.");
  process.exit(0);
} else {
  console.error("✘ Han fallado " + fallos.length + " comprobaciones (superadas: " + superadas + "):");
  for (const f of fallos) console.error("  - " + f);
  process.exit(1);
}
