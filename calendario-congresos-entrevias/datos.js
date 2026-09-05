/*
 * Datos iniciales del calendario. Se cargan la primera vez que se abre la app
 * (o al pulsar «Restaurar ejemplo»). Edita este archivo con cualquier editor
 * de texto para cambiar el punto de partida del equipo.
 *
 * Reglas: fechas en formato AAAA-MM-DD; el plazo de resúmenes debe ser
 * anterior o igual al inicio del congreso (o null si no se conoce);
 * toda comunicación referencia el id de un congreso existente.
 * Comprueba que todo es válido con: node comprobar.js
 */
(function () {
  const DATOS_INICIALES = {
    version: 1,
    congresos: [
      {
        id: "jornada-fisio-ap-2026",
        nombre: "I Jornada de Fisioterapia en Atención Primaria",
        organizador: "SoMaMFyC",
        ambito: "fisioterapia",
        lugar: "Madrid",
        inicio: "2026-06-12",
        fin: "2026-06-12",
        plazoResumenes: "2026-05-15",
        plazoPorConfirmar: false,
        web: "",
        notas: "Ya celebrada. Ejemplo de congreso con plazo cerrado."
      },
      {
        id: "semfyc-2026",
        nombre: "XLVI Congreso semFYC",
        organizador: "Sociedad Española de Medicina de Familia y Comunitaria",
        ambito: "atencion-primaria",
        lugar: "Las Palmas de Gran Canaria",
        inicio: "2026-11-05",
        fin: "2026-11-07",
        plazoResumenes: "2026-07-31",
        plazoPorConfirmar: true,
        web: "https://congresodelasemfyc.com/",
        notas: ""
      },
      {
        id: "semdor-2026",
        nombre: "VI Congreso SEMDOR",
        organizador: "Sociedad Española Multidisciplinar del Dolor",
        ambito: "dolor",
        lugar: "Por confirmar",
        inicio: "2026-11-12",
        fin: "2026-11-14",
        plazoResumenes: "2026-09-15",
        plazoPorConfirmar: true,
        web: "https://www.congresosemdor.es/",
        notas: ""
      },
      {
        id: "sed-2027",
        nombre: "23.º Congreso de la SED",
        organizador: "Sociedad Española del Dolor",
        ambito: "dolor",
        lugar: "Por confirmar",
        inicio: "2027-05-12",
        fin: "2027-05-14",
        plazoResumenes: "2027-01-31",
        plazoPorConfirmar: true,
        web: "https://sedolor.es/",
        notas: ""
      },
      {
        id: "sefid-2027",
        nombre: "Congreso SEFID",
        organizador: "Sociedad Española de Fisioterapia y Dolor",
        ambito: "fisioterapia",
        lugar: "Por confirmar",
        inicio: "2027-03-05",
        fin: "2027-03-06",
        plazoResumenes: null,
        plazoPorConfirmar: true,
        web: "https://sefid.es/",
        notas: "Fechas estimadas, pendiente de anuncio oficial."
      }
    ],
    comunicaciones: [
      {
        id: "eps-dolor-resultados",
        titulo: "Educación en dolor crónico en Entrevías: resultados del programa EPS",
        congresoId: "sed-2027",
        tipo: "poster",
        responsable: "Raúl Ferrer",
        autores: "Ferrer R, et al.",
        estado: "en-preparacion",
        notas: "Esperando datos de seguimiento a 6 meses."
      },
      {
        id: "paincafe-experiencia",
        titulo: "PainCafé: tertulias comunitarias sobre dolor en un centro de salud",
        congresoId: "semfyc-2026",
        tipo: "poster",
        responsable: "Equipo EPS",
        autores: "Por definir",
        estado: "idea",
        notas: ""
      },
      {
        id: "fisio-comunitaria-vallecas",
        titulo: "Fisioterapia comunitaria en un centro de salud de Vallecas",
        congresoId: "jornada-fisio-ap-2026",
        tipo: "oral",
        responsable: "Raúl Ferrer",
        autores: "Ferrer R, et al.",
        estado: "presentada",
        notas: ""
      }
    ]
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = DATOS_INICIALES;
  }
  if (typeof window !== "undefined") {
    window.DATOS_INICIALES = DATOS_INICIALES;
  }
})();
