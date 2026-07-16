/*
 * Lógica compartida del calendario de comunicaciones (CS Entrevías).
 * La usan la app del navegador (como window.LOGICA) y el script de
 * comprobación de Node (`node comprobar.js`), para no duplicar reglas.
 * Todas las funciones son puras: la fecha de «hoy» siempre llega como parámetro.
 */
(function (raiz, definir) {
  const modulo = definir();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = modulo;
  } else {
    raiz.LOGICA = modulo;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const AMBITOS = {
    "dolor": "Dolor",
    "fisioterapia": "Fisioterapia",
    "atencion-primaria": "Atención primaria",
    "enfermeria": "Enfermería",
    "otro": "Otro"
  };

  const TIPOS = {
    "poster": "Póster",
    "oral": "Comunicación oral",
    "taller": "Taller",
    "otro": "Otro"
  };

  const ESTADOS = {
    "idea": "Idea",
    "en-preparacion": "En preparación",
    "enviada": "Enviada",
    "aceptada": "Aceptada",
    "rechazada": "Rechazada",
    "presentada": "Presentada"
  };

  const ORDEN_ESTADOS = ["idea", "en-preparacion", "enviada", "aceptada", "rechazada", "presentada"];

  const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const MESES_LARGOS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  function esFechaISO(valor) {
    if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const [a, m, d] = valor.split("-").map(Number);
    const fecha = new Date(a, m - 1, d);
    return fecha.getFullYear() === a && fecha.getMonth() === m - 1 && fecha.getDate() === d;
  }

  // Convierte "AAAA-MM-DD" a Date a medianoche LOCAL (evita el desfase de un
  // día que produce new Date("AAAA-MM-DD"), que interpreta UTC).
  function aFecha(iso) {
    const [a, m, d] = iso.split("-").map(Number);
    return new Date(a, m - 1, d);
  }

  function isoDe(fecha) {
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return fecha.getFullYear() + "-" + mes + "-" + dia;
  }

  // Días completos desde hoy hasta la fecha (negativo si ya pasó).
  // Math.round absorbe la hora de más o de menos de los cambios horarios.
  function diasHasta(iso, hoyIso) {
    const MS_POR_DIA = 24 * 60 * 60 * 1000;
    return Math.round((aFecha(iso) - aFecha(hoyIso)) / MS_POR_DIA);
  }

  // "vencido" | "urgente" (de hoy a 7 días) | "proximo" (8 a 30) | "normal" (más de 30)
  function clasificarPlazo(iso, hoyIso) {
    const dias = diasHasta(iso, hoyIso);
    if (dias < 0) return "vencido";
    if (dias <= 7) return "urgente";
    if (dias <= 30) return "proximo";
    return "normal";
  }

  function textoDiasRestantes(dias) {
    if (dias === 0) return "¡hoy!";
    if (dias === 1) return "mañana";
    if (dias === -1) return "venció ayer";
    if (dias < 0) return "venció hace " + (-dias) + " días";
    return "en " + dias + " días";
  }

  function formatearFecha(iso) {
    const f = aFecha(iso);
    return f.getDate() + " " + MESES_CORTOS[f.getMonth()] + " " + f.getFullYear();
  }

  function formatearRango(inicioIso, finIso) {
    if (!finIso || finIso === inicioIso) return formatearFecha(inicioIso);
    const i = aFecha(inicioIso);
    const f = aFecha(finIso);
    if (i.getFullYear() === f.getFullYear() && i.getMonth() === f.getMonth()) {
      return i.getDate() + "–" + f.getDate() + " " + MESES_CORTOS[i.getMonth()] + " " + i.getFullYear();
    }
    if (i.getFullYear() === f.getFullYear()) {
      return i.getDate() + " " + MESES_CORTOS[i.getMonth()] + " – " + f.getDate() + " " + MESES_CORTOS[f.getMonth()] + " " + f.getFullYear();
    }
    return formatearFecha(inicioIso) + " – " + formatearFecha(finIso);
  }

  // Congresos con plazo de envío hoy o en el futuro, ordenados por plazo.
  function congresosConPlazoFuturo(congresos, hoyIso) {
    return congresos
      .filter(function (c) { return c.plazoResumenes && diasHasta(c.plazoResumenes, hoyIso) >= 0; })
      .slice()
      .sort(function (a, b) {
        if (a.plazoResumenes < b.plazoResumenes) return -1;
        if (a.plazoResumenes > b.plazoResumenes) return 1;
        return 0;
      });
  }

  function congresosSinPlazo(congresos) {
    return congresos.filter(function (c) { return !c.plazoResumenes; });
  }

  // Copia ordenada cronológicamente por fecha de inicio (las ISO comparan bien como texto).
  function congresosPorInicio(congresos) {
    return congresos.slice().sort(function (a, b) {
      if (a.inicio < b.inicio) return -1;
      if (a.inicio > b.inicio) return 1;
      return 0;
    });
  }

  // Mapa "AAAA-MM-DD" → { congresos: [nombres], plazos: [nombres] } para un año.
  function marcasDeAnio(congresos, anio) {
    const dias = {};
    const primeroDelAnio = new Date(anio, 0, 1);
    const ultimoDelAnio = new Date(anio, 11, 31);
    function asegura(iso) {
      if (!dias[iso]) dias[iso] = { congresos: [], plazos: [] };
      return dias[iso];
    }
    for (const c of congresos) {
      if (esFechaISO(c.inicio) && esFechaISO(c.fin)) {
        // Recorremos solo la intersección de [inicio, fin] con el año pedido, para
        // no iterar años enteros si una fecha tiene una errata (p. ej. fin "2999-…").
        const inicio = aFecha(c.inicio);
        const fin = aFecha(c.fin);
        const cursor = inicio < primeroDelAnio ? new Date(primeroDelAnio) : inicio;
        const tope = fin < ultimoDelAnio ? fin : ultimoDelAnio;
        while (cursor <= tope) {
          asegura(isoDe(cursor)).congresos.push(c.nombre);
          cursor.setDate(cursor.getDate() + 1);
        }
      }
      if (esFechaISO(c.plazoResumenes) && aFecha(c.plazoResumenes).getFullYear() === anio) {
        asegura(c.plazoResumenes).plazos.push(c.nombre);
      }
    }
    return dias;
  }

  // Valida el esquema completo (datos iniciales, importados o editados).
  // Devuelve una lista de errores en español; lista vacía = todo correcto.
  function validarDatos(datos) {
    const errores = [];
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      return ["Los datos no tienen la forma esperada (debe ser un objeto con \"congresos\" y \"comunicaciones\")."];
    }
    if (!Array.isArray(datos.congresos)) errores.push("Falta la lista \"congresos\".");
    if (!Array.isArray(datos.comunicaciones)) errores.push("Falta la lista \"comunicaciones\".");
    if (errores.length) return errores;

    const idsCongresos = new Set();
    datos.congresos.forEach(function (c, i) {
      const ref = "Congreso " + (i + 1) + (c && typeof c.nombre === "string" && c.nombre ? " («" + c.nombre + "»)" : "");
      if (!c || typeof c !== "object" || Array.isArray(c)) {
        errores.push(ref + ": no es un objeto.");
        return;
      }
      if (typeof c.id !== "string" || !c.id.trim()) {
        errores.push(ref + ": falta el identificador (\"id\").");
      } else if (idsCongresos.has(c.id)) {
        errores.push(ref + ": el id \"" + c.id + "\" está repetido.");
      } else {
        idsCongresos.add(c.id);
      }
      if (typeof c.nombre !== "string" || !c.nombre.trim()) {
        errores.push(ref + ": falta el nombre.");
      }
      if (!esFechaISO(c.inicio)) {
        errores.push(ref + ": la fecha de inicio no es válida (se espera AAAA-MM-DD).");
      }
      if (!esFechaISO(c.fin)) {
        errores.push(ref + ": la fecha de fin no es válida (se espera AAAA-MM-DD).");
      }
      if (esFechaISO(c.inicio) && esFechaISO(c.fin) && c.fin < c.inicio) {
        errores.push(ref + ": la fecha de fin (" + c.fin + ") es anterior al inicio (" + c.inicio + ").");
      }
      if (c.plazoResumenes !== null && c.plazoResumenes !== undefined) {
        if (!esFechaISO(c.plazoResumenes)) {
          errores.push(ref + ": el plazo de resúmenes no es una fecha válida (usa AAAA-MM-DD o déjalo vacío).");
        } else if (esFechaISO(c.inicio) && c.plazoResumenes > c.inicio) {
          errores.push(ref + ": el plazo de resúmenes (" + c.plazoResumenes + ") es posterior al inicio del congreso (" + c.inicio + ").");
        }
      }
      if (!(c.ambito in AMBITOS)) {
        errores.push(ref + ": ámbito desconocido \"" + c.ambito + "\" (válidos: " + Object.keys(AMBITOS).join(", ") + ").");
      }
      if (c.plazoPorConfirmar !== undefined && typeof c.plazoPorConfirmar !== "boolean") {
        errores.push(ref + ": \"plazoPorConfirmar\" debe ser true o false.");
      }
    });

    const idsComunicaciones = new Set();
    datos.comunicaciones.forEach(function (m, i) {
      const ref = "Comunicación " + (i + 1) + (m && typeof m.titulo === "string" && m.titulo ? " («" + m.titulo + "»)" : "");
      if (!m || typeof m !== "object" || Array.isArray(m)) {
        errores.push(ref + ": no es un objeto.");
        return;
      }
      if (typeof m.id !== "string" || !m.id.trim()) {
        errores.push(ref + ": falta el identificador (\"id\").");
      } else if (idsComunicaciones.has(m.id)) {
        errores.push(ref + ": el id \"" + m.id + "\" está repetido.");
      } else {
        idsComunicaciones.add(m.id);
      }
      if (typeof m.titulo !== "string" || !m.titulo.trim()) {
        errores.push(ref + ": falta el título.");
      }
      if (!idsCongresos.has(m.congresoId)) {
        errores.push(ref + ": el congreso \"" + m.congresoId + "\" no existe.");
      }
      if (!(m.tipo in TIPOS)) {
        errores.push(ref + ": tipo desconocido \"" + m.tipo + "\" (válidos: " + Object.keys(TIPOS).join(", ") + ").");
      }
      if (!(m.estado in ESTADOS)) {
        errores.push(ref + ": estado desconocido \"" + m.estado + "\" (válidos: " + Object.keys(ESTADOS).join(", ") + ").");
      }
    });

    return errores;
  }

  return {
    AMBITOS: AMBITOS,
    TIPOS: TIPOS,
    ESTADOS: ESTADOS,
    ORDEN_ESTADOS: ORDEN_ESTADOS,
    MESES_LARGOS: MESES_LARGOS,
    esFechaISO: esFechaISO,
    aFecha: aFecha,
    isoDe: isoDe,
    diasHasta: diasHasta,
    clasificarPlazo: clasificarPlazo,
    textoDiasRestantes: textoDiasRestantes,
    formatearFecha: formatearFecha,
    formatearRango: formatearRango,
    congresosConPlazoFuturo: congresosConPlazoFuturo,
    congresosSinPlazo: congresosSinPlazo,
    congresosPorInicio: congresosPorInicio,
    marcasDeAnio: marcasDeAnio,
    validarDatos: validarDatos
  };
});
