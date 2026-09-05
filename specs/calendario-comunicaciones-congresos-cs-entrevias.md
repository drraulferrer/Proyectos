# Especificación: Calendario de comunicaciones a congresos — CS Entrevías

## Contexto

El equipo del Centro de Salud Entrevías (SERMAS, Madrid) presenta comunicaciones
científicas (pósteres, comunicaciones orales, talleres) a congresos y jornadas de
atención primaria, fisioterapia, enfermería y dolor. Hoy ese seguimiento se hace
de memoria o en papeles sueltos, y se escapan plazos de envío de resúmenes.

Se quiere una herramienta **local, sencilla y en español** que cualquier persona
del equipo pueda abrir sin instalar nada ni usar la terminal, para:

- Ver de un vistazo **qué plazos de envío están próximos**.
- Mantener la lista de **congresos** de interés (fechas, sede, plazo de envío, web).
- Hacer seguimiento de cada **comunicación** del equipo (qué es, a qué congreso
  va, quién la lidera y en qué estado está).
- **Imprimir** una hoja resumen para el corcho de la sala común.

## Alcance y forma

- Vive en la carpeta `calendario-congresos-entrevias/` de este repositorio
  (convención del repo: minúsculas y guiones, README propio).
- **App 100 % estática**: HTML + CSS + JavaScript puro. Sin dependencias
  externas, sin build, sin conexión a internet.
- Debe funcionar **abriendo `index.html` con doble clic** (protocolo `file://`).
  Por eso los datos iniciales se cargan desde un archivo `datos.js` (variable
  global), no vía `fetch`.
- Los cambios del usuario se guardan en **localStorage** del navegador. Debe
  existir **exportar a JSON** (descarga) e **importar desde JSON** para
  compartir el calendario entre equipos o hacer copia de seguridad.
- Todo el texto visible en **español**.

## Modelo de datos

Archivo `datos.js` con una variable global `DATOS_INICIALES`:

```js
window.DATOS_INICIALES = {
  version: 1,
  congresos: [
    {
      id: "sed-2027",                      // único, minúsculas-y-guiones
      nombre: "23.º Congreso de la SED",
      organizador: "Sociedad Española del Dolor",
      ambito: "dolor",                     // dolor | fisioterapia | atencion-primaria | enfermeria | otro
      lugar: "Por confirmar",
      inicio: "2027-05-12",                // fecha ISO (YYYY-MM-DD)
      fin: "2027-05-14",                   // >= inicio
      plazoResumenes: "2027-01-31",        // fecha límite de envío, o null si no se conoce
      plazoPorConfirmar: true,             // true si el plazo es estimado/por confirmar
      web: "https://sedolor.es/",
      notas: ""
    }
  ],
  comunicaciones: [
    {
      id: "eps-dolor-poster",
      titulo: "Programa EPS de dolor crónico: resultados a 6 meses",
      congresoId: "sed-2027",              // debe existir en congresos
      tipo: "poster",                      // poster | oral | taller | otro
      responsable: "Raúl Ferrer",
      autores: "Ferrer R, et al.",
      estado: "en-preparacion",            // idea | en-preparacion | enviada | aceptada | rechazada | presentada
      notas: ""
    }
  ]
};
```

Reglas de integridad (aplican a los datos iniciales y a los importados):

- `id` únicos dentro de cada colección.
- Fechas en formato ISO `YYYY-MM-DD` y válidas; `fin >= inicio`.
- Si `plazoResumenes` no es `null`, debe ser fecha válida y `<= inicio`.
- `estado`, `tipo` y `ambito` limitados a los valores enumerados arriba.
- Toda comunicación referencia un `congresoId` existente.

## Requisitos funcionales (criterios de aceptación)

Cada requisito tiene un identificador **RA-nn** para poder verificarse uno a uno.

### Estructura y arranque

- **RA-01** La app abre desde `file://` sin errores de consola y sin peticiones
  de red externas (cero dependencias, cero CDN, cero fuentes remotas).
- **RA-02** Al primer arranque (localStorage vacío) se cargan los datos de
  `datos.js`. Los datos iniciales incluyen al menos 4 congresos reales del
  ámbito del equipo (dolor, fisioterapia, atención primaria…) y al menos
  2 comunicaciones de ejemplo, cumpliendo las reglas de integridad.
- **RA-03** La cabecera identifica la herramienta: título con
  «Calendario de comunicaciones» y «CS Entrevías».

### Pestaña «Próximos plazos» (vista inicial)

- **RA-04** Lista los congresos con plazo de envío futuro, ordenados por plazo
  ascendente, mostrando: nombre, plazo, días restantes, fechas del congreso y
  comunicaciones asociadas con su estado.
- **RA-05** Urgencia visual del plazo: **≤ 7 días** se marca como urgente,
  **≤ 30 días** como próximo, resto normal. Los plazos vencidos no aparecen en
  esta lista (quedan visibles en la pestaña Congresos como «cerrado»).
- **RA-06** Los plazos con `plazoPorConfirmar: true` muestran la etiqueta
  «por confirmar»; los congresos sin plazo (`null`) aparecen en un bloque
  aparte «sin plazo anunciado».

### Pestaña «Calendario»

- **RA-07** Vista anual de 12 meses (cuadrícula) del año seleccionado, con
  controles ‹ año › para cambiar de año. Los días con congreso y los días de
  plazo se distinguen con marcas distintas, con leyenda visible.
- **RA-08** Pasar el ratón (title) o tocar un día marcado indica qué congreso
  o plazo es. El día de hoy queda resaltado.

### Pestaña «Congresos»

- **RA-09** Tabla/lista de todos los congresos (incluidos los pasados, marcados
  «cerrado») con sus datos y enlace a la web si existe.
- **RA-10** Alta, edición y borrado de congresos mediante formulario con
  validación (nombre y fecha de inicio obligatorios; fechas coherentes según
  las reglas de integridad; mensajes de error en español). Borrar un congreso
  con comunicaciones asociadas pide confirmación y explica qué pasará con ellas
  (quedan sin congreso o se borran; la implementación debe elegir y explicarlo).

### Pestaña «Comunicaciones»

- **RA-11** Tablero por estado (columnas: idea, en preparación, enviada,
  aceptada, rechazada, presentada) con una tarjeta por comunicación mostrando
  título, congreso, tipo y responsable.
- **RA-12** Alta, edición y borrado de comunicaciones con formulario validado
  (título y congreso obligatorios). El estado puede cambiarse desde la propia
  tarjeta sin abrir el formulario completo.

### Persistencia y datos

- **RA-13** Cualquier cambio se guarda en localStorage al momento; recargar la
  página conserva los cambios.
- **RA-14** «Exportar» descarga un JSON con todos los datos. «Importar» acepta
  un JSON con el mismo esquema, lo **valida** con las reglas de integridad
  y, si es inválido, explica el problema en español sin romper los datos
  actuales. «Restaurar ejemplo» vuelve a los datos de `datos.js` previa
  confirmación.

### Impresión

- **RA-15** Un botón «Imprimir resumen» lanza la impresión de una vista limpia
  (sin botones ni navegación) con los próximos plazos y el estado de las
  comunicaciones, pensada para A4 en el corcho de la sala.

### Calidad

- **RA-16** Responsive: usable en un móvil de 375 px de ancho (las pestañas no
  desbordan, las tablas se pueden desplazar horizontalmente).
- **RA-17** Accesibilidad básica: `lang="es"`, un `<h1>`, controles con
  etiqueta o `aria-label`, la urgencia no se comunica solo por color (hay
  texto), contraste suficiente en los avisos.
- **RA-18** Script `comprobar.js` ejecutable con `node comprobar.js` (Node ≥ 18,
  sin dependencias) que: valida las reglas de integridad de `datos.js` y prueba
  las funciones puras de `logica.js` (días restantes, clasificación de
  urgencia, orden por plazo, validación de datos). Termina con código 0 y
  resumen en español si todo pasa; código ≠ 0 si algo falla.
- **RA-19** La lógica de fechas/urgencia/validación vive en `logica.js`,
  compartida por la app (navegador) y por `comprobar.js` (Node), sin duplicar
  reglas.
- **RA-20** `README.md` del proyecto en español: qué es, cómo abrirlo con doble
  clic, cómo editar los datos iniciales, cómo exportar/importar y cómo ejecutar
  `comprobar.js`. Además, el proyecto queda añadido al índice del `README.md`
  raíz del repositorio.

### Búsqueda, filtros y resumen (v2)

- **RA-21** Búsqueda y filtros para cuando la lista crezca:
  - En «Congresos»: un buscador de texto (nombre, organizador o lugar) y filtros
    por ámbito y por situación del plazo (abierto / cerrado / sin plazo). Los
    filtros se combinan (Y lógica). La búsqueda ignora mayúsculas y acentos.
  - En «Comunicaciones»: un buscador de texto (título, responsable o autores) y
    filtros por congreso y por tipo. También combinables e insensibles a
    acentos/mayúsculas.
  - Cada pestaña tiene un botón «Limpiar» que restablece sus filtros, e indica
    cuántos elementos se están mostrando de cuántos («3 de 12»). Escribir en el
    buscador no hace perder el foco del campo.
- **RA-22** La pestaña «Próximos plazos» abre con una fila de **resumen** con
  contadores calculados por lógica pura: plazos abiertos, de ellos cuántos
  urgentes (≤ 7 días), total de comunicaciones y cuántas «en preparación» o
  «enviada» (en marcha). El resumen no se comunica solo por color.

## Fuera de alcance (v1)

- Sin servidor, sin cuentas de usuario, sin sincronización automática entre
  equipos (se comparte exportando/importando el JSON).
- Sin recordatorios por correo o notificaciones.
- Sin edición simultánea multiusuario.

## Datos iniciales orientativos

Congresos reales conocidos a fecha de la especificación (los plazos de envío se
marcan «por confirmar» salvo confirmación oficial):

| Congreso | Fechas | Lugar |
|---|---|---|
| XLVI Congreso semFYC | 5–7 nov 2026 | Las Palmas de Gran Canaria |
| VI Congreso SEMDOR | 12–14 nov 2026 | Por confirmar |
| 23.º Congreso SED | 12–14 may 2027 | Por confirmar |
| Congreso SEFID | Por confirmar 2027 | Por confirmar |

(El equipo los corregirá desde la propia app; son un punto de partida.)
