/*
 * App del calendario de comunicaciones (CS Entrevías).
 * Sin dependencias: lee la lógica de logica.js (window.LOGICA) y los datos
 * iniciales de datos.js (window.DATOS_INICIALES). Guarda en localStorage.
 */
(function () {
  "use strict";

  const L = window.LOGICA;
  const CLAVE_ALMACEN = "calendario-congresos-entrevias";

  let datos = cargarDatos();
  let anioCalendario = new Date().getFullYear();

  // ---------- utilidades ----------

  function hoyISO() {
    return L.isoDe(new Date());
  }

  function clonar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function cargarDatos() {
    try {
      const crudo = localStorage.getItem(CLAVE_ALMACEN);
      if (crudo) {
        const guardados = JSON.parse(crudo);
        if (L.validarDatos(guardados).length === 0) return guardados;
        console.warn("Los datos guardados no superan la validación; se cargan los datos de ejemplo.");
      }
    } catch (e) {
      console.warn("No se pudieron leer los datos guardados; se cargan los datos de ejemplo.", e);
    }
    return clonar(window.DATOS_INICIALES);
  }

  function guardar() {
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(datos));
    } catch (e) {
      avisar("No se pudo guardar en este navegador (¿modo privado?). Exporta el JSON para no perder los cambios.");
    }
  }

  function avisar(mensaje) {
    document.getElementById("avisos").textContent = mensaje;
  }

  // Crea un elemento con atributos y contenido de forma segura (sin innerHTML).
  function el(etiqueta, atributos, hijos) {
    const nodo = document.createElement(etiqueta);
    for (const [clave, valor] of Object.entries(atributos || {})) {
      if (valor === null || valor === undefined || valor === false) continue;
      if (clave === "text") nodo.textContent = valor;
      else if (clave.slice(0, 2) === "on") nodo.addEventListener(clave.slice(2), valor);
      else nodo.setAttribute(clave, valor === true ? "" : valor);
    }
    for (const hijo of [].concat(hijos || [])) {
      if (hijo !== null && hijo !== undefined && hijo !== false) nodo.append(hijo);
    }
    return nodo;
  }

  function generarId(nombre, existentes) {
    let base = nombre.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    if (!base) base = "elemento";
    let id = base;
    let n = 2;
    while (existentes.has(id)) {
      id = base + "-" + n;
      n++;
    }
    return id;
  }

  function congresoPorId(id) {
    return datos.congresos.find(function (c) { return c.id === id; });
  }

  function comunicacionesDe(congresoId) {
    return datos.comunicaciones.filter(function (m) { return m.congresoId === congresoId; });
  }

  function etiquetaPlazo(congreso, hoy) {
    const clase = L.clasificarPlazo(congreso.plazoResumenes, hoy);
    const dias = L.diasHasta(congreso.plazoResumenes, hoy);
    const nombres = { urgente: "Urgente", proximo: "Próximo", normal: "En plazo", vencido: "Cerrado" };
    return el("span", {
      class: "etiqueta etiqueta-" + (clase === "vencido" ? "cerrado" : clase),
      text: nombres[clase] + " · " + L.textoDiasRestantes(dias)
    });
  }

  function chipPorConfirmar() {
    return el("span", { class: "etiqueta etiqueta-confirmar", text: "por confirmar" });
  }

  function chipEstado(estado) {
    return el("span", {
      class: "etiqueta etiqueta-estado estado-" + estado,
      text: L.ESTADOS[estado] || estado
    });
  }

  // ---------- pestañas ----------

  const PESTANAS = ["plazos", "calendario", "congresos", "comunicaciones"];

  function activarPestana(nombre, enfocar) {
    for (const p of PESTANAS) {
      const tab = document.getElementById("tab-" + p);
      const panel = document.getElementById("panel-" + p);
      const activa = p === nombre;
      tab.setAttribute("aria-selected", activa ? "true" : "false");
      tab.tabIndex = activa ? 0 : -1;
      panel.hidden = !activa;
      if (activa && enfocar) tab.focus();
    }
  }

  function prepararPestanas() {
    const lista = document.querySelector(".pestanas");
    for (const p of PESTANAS) {
      document.getElementById("tab-" + p).addEventListener("click", function () {
        activarPestana(p);
      });
    }
    lista.addEventListener("keydown", function (evento) {
      if (evento.key !== "ArrowRight" && evento.key !== "ArrowLeft") return;
      const actual = PESTANAS.findIndex(function (p) {
        return document.getElementById("tab-" + p).getAttribute("aria-selected") === "true";
      });
      const paso = evento.key === "ArrowRight" ? 1 : -1;
      const siguiente = (actual + paso + PESTANAS.length) % PESTANAS.length;
      activarPestana(PESTANAS[siguiente], true);
      evento.preventDefault();
    });
  }

  // ---------- pestaña: próximos plazos ----------

  function renderPlazos() {
    const hoy = hoyISO();
    const panel = document.getElementById("panel-plazos");
    panel.textContent = "";

    panel.append(el("h2", { text: "Próximos plazos de envío" }));

    const proximos = L.congresosConPlazoFuturo(datos.congresos, hoy);
    if (proximos.length === 0) {
      panel.append(el("p", { class: "vacio", text: "No hay plazos de envío pendientes. Añade congresos (o sus plazos) en la pestaña «Congresos»." }));
    } else {
      panel.append(el("ul", { class: "lista-plazos" }, proximos.map(function (c) {
        const clase = L.clasificarPlazo(c.plazoResumenes, hoy);
        const asociadas = comunicacionesDe(c.id);
        return el("li", { class: "tarjeta-plazo es-" + clase }, [
          el("h3", {}, [
            document.createTextNode(c.nombre + " "),
            etiquetaPlazo(c, hoy),
            c.plazoPorConfirmar ? document.createTextNode(" ") : null,
            c.plazoPorConfirmar ? chipPorConfirmar() : null
          ]),
          el("p", { class: "linea-detalle", text: "Plazo de envío: " + L.formatearFecha(c.plazoResumenes) }),
          el("p", { class: "linea-detalle", text: "Congreso: " + L.formatearRango(c.inicio, c.fin) + (c.lugar ? " · " + c.lugar : "") }),
          asociadas.length
            ? el("ul", {}, asociadas.map(function (m) {
                return el("li", {}, [document.createTextNode(m.titulo + " "), chipEstado(m.estado)]);
              }))
            : el("p", { class: "linea-detalle", text: "Sin comunicaciones asociadas todavía." })
        ]);
      })));
    }

    const sinPlazo = L.congresosSinPlazo(datos.congresos).filter(function (c) {
      return L.diasHasta(c.inicio, hoy) >= 0;
    });
    if (sinPlazo.length) {
      panel.append(el("h2", { text: "Sin plazo anunciado" }));
      panel.append(el("ul", { class: "lista-plazos" }, sinPlazo.map(function (c) {
        return el("li", { class: "tarjeta-plazo" }, [
          el("h3", {}, [
            document.createTextNode(c.nombre + " "),
            el("span", { class: "etiqueta etiqueta-confirmar", text: "sin plazo anunciado" })
          ]),
          el("p", { class: "linea-detalle", text: "Congreso: " + L.formatearRango(c.inicio, c.fin) + (c.lugar ? " · " + c.lugar : "") })
        ]);
      })));
    }
  }

  // ---------- pestaña: calendario ----------

  function renderCalendario() {
    const hoy = hoyISO();
    const panel = document.getElementById("panel-calendario");
    panel.textContent = "";

    panel.append(el("div", { class: "controles-anio" }, [
      el("button", { type: "button", "aria-label": "Año anterior", onclick: function () { anioCalendario--; renderCalendario(); } }, "‹"),
      el("h2", { text: "Año " + anioCalendario }),
      el("button", { type: "button", "aria-label": "Año siguiente", onclick: function () { anioCalendario++; renderCalendario(); } }, "›")
    ]));

    panel.append(el("p", { class: "leyenda" }, [
      el("span", {}, [el("span", { class: "muestra muestra-congreso", "aria-hidden": "true" }), "días de congreso"]),
      el("span", {}, [el("span", { class: "muestra muestra-plazo", "aria-hidden": "true" }), "plazo de envío"]),
      el("span", {}, [el("span", { class: "muestra muestra-hoy", "aria-hidden": "true" }), "hoy"])
    ]));

    const marcas = L.marcasDeAnio(datos.congresos, anioCalendario);
    const rejilla = el("div", { class: "rejilla-meses" });
    const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

    for (let mes = 0; mes < 12; mes++) {
      const tabla = el("table", {}, [
        el("caption", { text: L.MESES_LARGOS[mes] }),
        el("thead", {}, el("tr", {}, DIAS_SEMANA.map(function (d) {
          return el("th", { scope: "col", text: d });
        })))
      ]);
      const cuerpo = el("tbody");
      const primerDia = new Date(anioCalendario, mes, 1);
      const diasDelMes = new Date(anioCalendario, mes + 1, 0).getDate();
      // getDay(): 0=domingo … queremos lunes en la primera columna.
      let columna = (primerDia.getDay() + 6) % 7;
      let fila = el("tr");
      for (let i = 0; i < columna; i++) fila.append(el("td"));

      for (let dia = 1; dia <= diasDelMes; dia++) {
        const iso = L.isoDe(new Date(anioCalendario, mes, dia));
        const marca = marcas[iso];
        const esHoy = iso === hoy;
        const clases = ["dia"];
        if (marca && marca.congresos.length) clases.push("dia-congreso");
        if (marca && marca.plazos.length) clases.push("dia-plazo");
        if (esHoy) clases.push("dia-hoy");

        let contenido;
        if (marca || esHoy) {
          const partes = [];
          if (marca && marca.congresos.length) partes.push("Congreso: " + marca.congresos.join(", "));
          if (marca && marca.plazos.length) partes.push("Plazo de envío: " + marca.plazos.join(", "));
          if (esHoy) partes.push("Hoy");
          const descripcion = L.formatearFecha(iso) + " — " + partes.join(" · ");
          contenido = el("button", {
            type: "button",
            class: clases.join(" "),
            title: descripcion,
            "aria-label": descripcion,
            onclick: function () {
              document.getElementById("info-dia").textContent = descripcion;
            }
          }, String(dia));
        } else {
          contenido = el("span", { class: clases.join(" ") }, String(dia));
        }
        fila.append(el("td", {}, contenido));
        columna++;
        if (columna === 7) {
          cuerpo.append(fila);
          fila = el("tr");
          columna = 0;
        }
      }
      if (columna > 0) {
        while (columna < 7) { fila.append(el("td")); columna++; }
        cuerpo.append(fila);
      }
      tabla.append(cuerpo);
      rejilla.append(el("div", { class: "mes" }, tabla));
    }

    panel.append(rejilla);
    panel.append(el("p", { class: "info-dia", id: "info-dia", "aria-live": "polite", text: "Toca un día marcado para ver el detalle aquí." }));
  }

  // ---------- pestaña: congresos ----------

  function renderCongresos() {
    const hoy = hoyISO();
    const panel = document.getElementById("panel-congresos");
    panel.textContent = "";

    panel.append(el("h2", { text: "Congresos y jornadas" }));
    panel.append(el("div", { class: "acciones-seccion" },
      el("button", { type: "button", class: "principal", onclick: function () { abrirFormularioCongreso(null); } }, "➕ Añadir congreso")));

    if (datos.congresos.length === 0) {
      panel.append(el("p", { class: "vacio", text: "Todavía no hay congresos. Añade el primero con el botón de arriba." }));
      return;
    }

    const ordenados = L.congresosPorInicio(datos.congresos);

    const filas = ordenados.map(function (c) {
      const finalizado = L.diasHasta(c.fin, hoy) < 0;
      const celdaPlazo = el("td", {});
      if (c.plazoResumenes) {
        celdaPlazo.append(el("span", { text: L.formatearFecha(c.plazoResumenes) + " " }));
        celdaPlazo.append(etiquetaPlazo(c, hoy));
        if (c.plazoPorConfirmar) {
          celdaPlazo.append(document.createTextNode(" "));
          celdaPlazo.append(chipPorConfirmar());
        }
      } else {
        celdaPlazo.append(el("span", { text: "— sin anunciar" }));
      }

      const numAsociadas = comunicacionesDe(c.id).length;
      return el("tr", { class: finalizado ? "congreso-finalizado" : null }, [
        el("td", {}, [
          c.web
            ? el("a", { href: c.web, target: "_blank", rel: "noopener", text: c.nombre })
            : el("span", { text: c.nombre }),
          el("p", { class: "linea-detalle", text: (c.organizador || "") + (c.lugar ? (c.organizador ? " · " : "") + c.lugar : "") }),
          c.notas ? el("p", { class: "linea-detalle", text: "📝 " + c.notas }) : null
        ]),
        el("td", { text: L.AMBITOS[c.ambito] || c.ambito }),
        el("td", {}, [
          el("span", { text: L.formatearRango(c.inicio, c.fin) }),
          finalizado ? document.createTextNode(" ") : null,
          finalizado ? el("span", { class: "etiqueta etiqueta-cerrado", text: "finalizado" }) : null
        ]),
        celdaPlazo,
        el("td", { text: String(numAsociadas) }),
        el("td", {}, el("div", { class: "acciones-fila" }, [
          el("button", { type: "button", onclick: function () { abrirFormularioCongreso(c.id); } }, "Editar"),
          el("button", { type: "button", class: "peligro", onclick: function () { borrarCongreso(c.id); } }, "Borrar")
        ]))
      ]);
    });

    panel.append(el("div", { class: "tabla-envoltorio" },
      el("table", {}, [
        el("thead", {}, el("tr", {}, [
          el("th", { scope: "col", text: "Congreso" }),
          el("th", { scope: "col", text: "Ámbito" }),
          el("th", { scope: "col", text: "Fechas" }),
          el("th", { scope: "col", text: "Plazo de resúmenes" }),
          el("th", { scope: "col", text: "Comunicaciones" }),
          el("th", { scope: "col", text: "Acciones" })
        ])),
        el("tbody", {}, filas)
      ])));
  }

  function borrarCongreso(id) {
    const congreso = congresoPorId(id);
    if (!congreso) return;
    const asociadas = comunicacionesDe(id);
    const mensaje = asociadas.length
      ? "«" + congreso.nombre + "» tiene " + asociadas.length + " comunicación(es) asociada(s), que se borrarán también. ¿Seguro que quieres borrarlo todo?"
      : "¿Borrar el congreso «" + congreso.nombre + "»?";
    if (!window.confirm(mensaje)) return;
    datos.congresos = datos.congresos.filter(function (c) { return c.id !== id; });
    datos.comunicaciones = datos.comunicaciones.filter(function (m) { return m.congresoId !== id; });
    guardar();
    renderTodo();
    avisar("Congreso borrado.");
  }

  // ---------- pestaña: comunicaciones ----------

  function renderComunicaciones() {
    const panel = document.getElementById("panel-comunicaciones");
    panel.textContent = "";

    panel.append(el("h2", { text: "Comunicaciones del equipo" }));
    panel.append(el("div", { class: "acciones-seccion" },
      el("button", { type: "button", class: "principal", onclick: function () { abrirFormularioComunicacion(null); } }, "➕ Añadir comunicación")));

    const tablero = el("div", { class: "tablero" });
    for (const estado of L.ORDEN_ESTADOS) {
      const del_estado = datos.comunicaciones.filter(function (m) { return m.estado === estado; });
      const columna = el("div", { class: "columna-estado" }, [
        el("h3", {}, [
          document.createTextNode(L.ESTADOS[estado] + " "),
          el("span", { class: "contador", text: "(" + del_estado.length + ")" })
        ])
      ]);
      for (const m of del_estado) {
        const congreso = congresoPorId(m.congresoId);
        const selector = el("select", { "aria-label": "Estado de «" + m.titulo + "»" });
        for (const e of L.ORDEN_ESTADOS) {
          selector.append(el("option", { value: e, selected: e === m.estado ? "" : null, text: L.ESTADOS[e] }));
        }
        selector.addEventListener("change", function () {
          m.estado = selector.value;
          guardar();
          renderTodo();
          avisar("Estado actualizado.");
        });
        columna.append(el("div", { class: "tarjeta-comunicacion" }, [
          el("h4", { text: m.titulo }),
          el("p", { class: "linea-detalle", text: "🏛️ " + (congreso ? congreso.nombre : "(congreso desconocido)") }),
          el("p", { class: "linea-detalle", text: (L.TIPOS[m.tipo] || m.tipo) + (m.responsable ? " · " + m.responsable : "") }),
          m.notas ? el("p", { class: "linea-detalle", text: "📝 " + m.notas }) : null,
          selector,
          el("div", { class: "acciones-fila" }, [
            el("button", { type: "button", onclick: function () { abrirFormularioComunicacion(m.id); } }, "Editar"),
            el("button", { type: "button", class: "peligro", onclick: function () { borrarComunicacion(m.id); } }, "Borrar")
          ])
        ]));
      }
      tablero.append(columna);
    }
    panel.append(tablero);

    if (datos.comunicaciones.length === 0) {
      panel.append(el("p", { class: "vacio", text: "Todavía no hay comunicaciones. Crea la primera con el botón de arriba." }));
    }
  }

  function borrarComunicacion(id) {
    const comunicacion = datos.comunicaciones.find(function (m) { return m.id === id; });
    if (!comunicacion) return;
    if (!window.confirm("¿Borrar la comunicación «" + comunicacion.titulo + "»?")) return;
    datos.comunicaciones = datos.comunicaciones.filter(function (m) { return m.id !== id; });
    guardar();
    renderTodo();
    avisar("Comunicación borrada.");
  }

  // ---------- formularios ----------

  function mostrarErrores(contenedorId, errores) {
    const caja = document.getElementById(contenedorId);
    caja.textContent = "";
    if (!errores.length) {
      caja.hidden = true;
      return;
    }
    caja.hidden = false;
    caja.append(el("strong", { text: "Revisa el formulario:" }));
    caja.append(el("ul", {}, errores.map(function (e) { return el("li", { text: e }); })));
  }

  function abrirFormularioCongreso(id) {
    const dialogo = document.getElementById("dialogo-congreso");
    const formulario = document.getElementById("formulario-congreso");
    const congreso = id ? congresoPorId(id) : null;

    document.getElementById("titulo-dialogo-congreso").textContent =
      congreso ? "Editar congreso" : "Nuevo congreso";

    const selectorAmbito = formulario.elements.ambito;
    selectorAmbito.textContent = "";
    for (const [valor, nombre] of Object.entries(L.AMBITOS)) {
      selectorAmbito.append(el("option", { value: valor, text: nombre }));
    }

    formulario.elements.id.value = congreso ? congreso.id : "";
    formulario.elements.nombre.value = congreso ? congreso.nombre : "";
    formulario.elements.organizador.value = congreso ? (congreso.organizador || "") : "";
    formulario.elements.ambito.value = congreso ? congreso.ambito : "otro";
    formulario.elements.lugar.value = congreso ? (congreso.lugar || "") : "";
    formulario.elements.inicio.value = congreso ? congreso.inicio : "";
    formulario.elements.fin.value = congreso ? congreso.fin : "";
    formulario.elements.plazoResumenes.value = congreso && congreso.plazoResumenes ? congreso.plazoResumenes : "";
    formulario.elements.plazoPorConfirmar.checked = congreso ? !!congreso.plazoPorConfirmar : false;
    formulario.elements.web.value = congreso ? (congreso.web || "") : "";
    formulario.elements.notas.value = congreso ? (congreso.notas || "") : "";

    mostrarErrores("errores-congreso", []);
    dialogo.showModal();
  }

  function guardarCongreso(formulario) {
    const errores = [];
    const nombre = formulario.elements.nombre.value.trim();
    const inicio = formulario.elements.inicio.value;
    let fin = formulario.elements.fin.value;
    const plazo = formulario.elements.plazoResumenes.value;

    if (!nombre) errores.push("El nombre del congreso es obligatorio.");
    if (!inicio) errores.push("La fecha de inicio es obligatoria.");
    if (!fin) fin = inicio;
    if (inicio && fin && fin < inicio) errores.push("La fecha de fin no puede ser anterior al inicio.");
    if (inicio && plazo && plazo > inicio) errores.push("El plazo de envío debe ser anterior (o igual) al inicio del congreso.");
    if (errores.length) {
      mostrarErrores("errores-congreso", errores);
      return false;
    }

    const idExistente = formulario.elements.id.value;
    const idsActuales = new Set(datos.congresos.map(function (c) { return c.id; }));
    const candidato = {
      id: idExistente || generarId(nombre, idsActuales),
      nombre: nombre,
      organizador: formulario.elements.organizador.value.trim(),
      ambito: formulario.elements.ambito.value,
      lugar: formulario.elements.lugar.value.trim(),
      inicio: inicio,
      fin: fin,
      plazoResumenes: plazo || null,
      plazoPorConfirmar: formulario.elements.plazoPorConfirmar.checked,
      web: formulario.elements.web.value.trim(),
      notas: formulario.elements.notas.value.trim()
    };

    const copia = clonar(datos);
    if (idExistente) {
      const indice = copia.congresos.findIndex(function (c) { return c.id === idExistente; });
      copia.congresos[indice] = candidato;
    } else {
      copia.congresos.push(candidato);
    }
    const erroresIntegridad = L.validarDatos(copia);
    if (erroresIntegridad.length) {
      mostrarErrores("errores-congreso", erroresIntegridad);
      return false;
    }

    datos = copia;
    guardar();
    renderTodo();
    avisar("Congreso guardado.");
    return true;
  }

  function abrirFormularioComunicacion(id) {
    if (datos.congresos.length === 0) {
      window.alert("Primero crea un congreso en la pestaña «Congresos»: toda comunicación se asocia a uno.");
      return;
    }
    const dialogo = document.getElementById("dialogo-comunicacion");
    const formulario = document.getElementById("formulario-comunicacion");
    const comunicacion = id ? datos.comunicaciones.find(function (m) { return m.id === id; }) : null;

    document.getElementById("titulo-dialogo-comunicacion").textContent =
      comunicacion ? "Editar comunicación" : "Nueva comunicación";

    const selectorCongreso = formulario.elements.congresoId;
    selectorCongreso.textContent = "";
    const ordenados = L.congresosPorInicio(datos.congresos);
    for (const c of ordenados) {
      selectorCongreso.append(el("option", { value: c.id, text: c.nombre + " (" + L.formatearRango(c.inicio, c.fin) + ")" }));
    }

    const selectorTipo = formulario.elements.tipo;
    selectorTipo.textContent = "";
    for (const [valor, nombre] of Object.entries(L.TIPOS)) {
      selectorTipo.append(el("option", { value: valor, text: nombre }));
    }

    const selectorEstado = formulario.elements.estado;
    selectorEstado.textContent = "";
    for (const e of L.ORDEN_ESTADOS) {
      selectorEstado.append(el("option", { value: e, text: L.ESTADOS[e] }));
    }

    formulario.elements.id.value = comunicacion ? comunicacion.id : "";
    formulario.elements.titulo.value = comunicacion ? comunicacion.titulo : "";
    formulario.elements.congresoId.value = comunicacion ? comunicacion.congresoId : ordenados[0].id;
    formulario.elements.tipo.value = comunicacion ? comunicacion.tipo : "poster";
    formulario.elements.estado.value = comunicacion ? comunicacion.estado : "idea";
    formulario.elements.responsable.value = comunicacion ? (comunicacion.responsable || "") : "";
    formulario.elements.autores.value = comunicacion ? (comunicacion.autores || "") : "";
    formulario.elements.notas.value = comunicacion ? (comunicacion.notas || "") : "";

    mostrarErrores("errores-comunicacion", []);
    dialogo.showModal();
  }

  function guardarComunicacion(formulario) {
    const errores = [];
    const titulo = formulario.elements.titulo.value.trim();
    const congresoId = formulario.elements.congresoId.value;

    if (!titulo) errores.push("El título de la comunicación es obligatorio.");
    if (!congresoId) errores.push("Elige el congreso al que se presenta.");
    if (errores.length) {
      mostrarErrores("errores-comunicacion", errores);
      return false;
    }

    const idExistente = formulario.elements.id.value;
    const idsActuales = new Set(datos.comunicaciones.map(function (m) { return m.id; }));
    const candidato = {
      id: idExistente || generarId(titulo, idsActuales),
      titulo: titulo,
      congresoId: congresoId,
      tipo: formulario.elements.tipo.value,
      responsable: formulario.elements.responsable.value.trim(),
      autores: formulario.elements.autores.value.trim(),
      estado: formulario.elements.estado.value,
      notas: formulario.elements.notas.value.trim()
    };

    const copia = clonar(datos);
    if (idExistente) {
      const indice = copia.comunicaciones.findIndex(function (m) { return m.id === idExistente; });
      copia.comunicaciones[indice] = candidato;
    } else {
      copia.comunicaciones.push(candidato);
    }
    const erroresIntegridad = L.validarDatos(copia);
    if (erroresIntegridad.length) {
      mostrarErrores("errores-comunicacion", erroresIntegridad);
      return false;
    }

    datos = copia;
    guardar();
    renderTodo();
    avisar("Comunicación guardada.");
    return true;
  }

  function prepararDialogos() {
    document.getElementById("formulario-congreso").addEventListener("submit", function (evento) {
      evento.preventDefault();
      if (guardarCongreso(evento.target)) {
        document.getElementById("dialogo-congreso").close();
      }
    });
    document.getElementById("formulario-comunicacion").addEventListener("submit", function (evento) {
      evento.preventDefault();
      if (guardarComunicacion(evento.target)) {
        document.getElementById("dialogo-comunicacion").close();
      }
    });
    for (const boton of document.querySelectorAll("dialog [data-cerrar]")) {
      boton.addEventListener("click", function (evento) {
        evento.target.closest("dialog").close();
      });
    }
  }

  // ---------- exportar / importar / restaurar / imprimir ----------

  function exportar() {
    const contenido = JSON.stringify(datos, null, 2);
    const blob = new Blob([contenido], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = el("a", { href: url, download: "calendario-congresos-entrevias.json" });
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
    avisar("Datos exportados.");
  }

  function importar(archivo) {
    const lector = new FileReader();
    lector.onload = function () {
      let importados;
      try {
        importados = JSON.parse(String(lector.result));
      } catch (e) {
        window.alert("El archivo no es un JSON válido y no se ha importado nada.");
        return;
      }
      const errores = L.validarDatos(importados);
      if (errores.length) {
        window.alert("El archivo no se ha importado porque tiene errores:\n\n- " + errores.slice(0, 10).join("\n- ") +
          (errores.length > 10 ? "\n… y " + (errores.length - 10) + " más." : ""));
        return;
      }
      datos = importados;
      guardar();
      renderTodo();
      window.alert("Datos importados correctamente: " + datos.congresos.length + " congresos y " +
        datos.comunicaciones.length + " comunicaciones.");
    };
    lector.onerror = function () {
      window.alert("No se pudo leer el archivo.");
    };
    lector.readAsText(archivo);
  }

  function restaurarEjemplo() {
    if (!window.confirm("Esto sustituirá los datos actuales por los de ejemplo (datos.js). ¿Continuar?")) return;
    datos = clonar(window.DATOS_INICIALES);
    guardar();
    renderTodo();
    avisar("Datos de ejemplo restaurados.");
  }

  function renderImpresion() {
    const hoy = hoyISO();
    const vista = document.getElementById("vista-impresion");
    vista.textContent = "";

    vista.append(el("h1", { text: "Calendario de comunicaciones — CS Entrevías" }));
    vista.append(el("p", { class: "fecha-informe", text: "Hoja resumen impresa el " + L.formatearFecha(hoy) + "." }));

    vista.append(el("h2", { text: "Próximos plazos de envío" }));
    const proximos = L.congresosConPlazoFuturo(datos.congresos, hoy);
    if (proximos.length === 0) {
      vista.append(el("p", { text: "No hay plazos de envío pendientes." }));
    } else {
      vista.append(el("table", {}, [
        el("thead", {}, el("tr", {}, [
          el("th", { scope: "col", text: "Congreso" }),
          el("th", { scope: "col", text: "Plazo de envío" }),
          el("th", { scope: "col", text: "Fechas del congreso" }),
          el("th", { scope: "col", text: "Comunicaciones" })
        ])),
        el("tbody", {}, proximos.map(function (c) {
          const asociadas = comunicacionesDe(c.id);
          return el("tr", {}, [
            el("td", { text: c.nombre }),
            el("td", {
              text: L.formatearFecha(c.plazoResumenes) + " (" +
                L.textoDiasRestantes(L.diasHasta(c.plazoResumenes, hoy)) + ")" +
                (c.plazoPorConfirmar ? " — por confirmar" : "")
            }),
            el("td", { text: L.formatearRango(c.inicio, c.fin) + (c.lugar ? " · " + c.lugar : "") }),
            el("td", {
              text: asociadas.length
                ? asociadas.map(function (m) { return m.titulo + " [" + L.ESTADOS[m.estado] + "]"; }).join("; ")
                : "—"
            })
          ]);
        }))
      ]));
    }

    vista.append(el("h2", { text: "Estado de las comunicaciones" }));
    if (datos.comunicaciones.length === 0) {
      vista.append(el("p", { text: "No hay comunicaciones registradas." }));
    } else {
      vista.append(el("table", {}, [
        el("thead", {}, el("tr", {}, [
          el("th", { scope: "col", text: "Título" }),
          el("th", { scope: "col", text: "Congreso" }),
          el("th", { scope: "col", text: "Tipo" }),
          el("th", { scope: "col", text: "Responsable" }),
          el("th", { scope: "col", text: "Estado" })
        ])),
        el("tbody", {}, datos.comunicaciones.map(function (m) {
          const congreso = congresoPorId(m.congresoId);
          return el("tr", {}, [
            el("td", { text: m.titulo }),
            el("td", { text: congreso ? congreso.nombre : "—" }),
            el("td", { text: L.TIPOS[m.tipo] || m.tipo }),
            el("td", { text: m.responsable || "—" }),
            el("td", { text: L.ESTADOS[m.estado] || m.estado })
          ]);
        }))
      ]));
    }
  }

  function prepararAcciones() {
    document.getElementById("boton-exportar").addEventListener("click", exportar);
    document.getElementById("boton-restaurar").addEventListener("click", restaurarEjemplo);
    document.getElementById("boton-imprimir").addEventListener("click", function () {
      window.print();
    });
    const entrada = document.getElementById("entrada-importar");
    document.getElementById("boton-importar").addEventListener("click", function () {
      entrada.click();
    });
    entrada.addEventListener("change", function () {
      if (entrada.files && entrada.files[0]) importar(entrada.files[0]);
      entrada.value = "";
    });
  }

  // ---------- arranque ----------

  function renderTodo() {
    renderPlazos();
    renderCalendario();
    renderCongresos();
    renderComunicaciones();
    renderImpresion();
  }

  prepararPestanas();
  prepararDialogos();
  prepararAcciones();
  renderTodo();
})();
