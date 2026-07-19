# 📅 Calendario de comunicaciones a congresos — CS Entrevías

Herramienta **local y sin instalación** para que el equipo del Centro de Salud
Entrevías no se le escape ningún plazo: congresos de interés, fechas límite de
envío de resúmenes y estado de cada comunicación del equipo (de la idea al
póster presentado).

Responde a la especificación
[`specs/calendario-comunicaciones-congresos-cs-entrevias.md`](../specs/calendario-comunicaciones-congresos-cs-entrevias.md).

## 🚀 Cómo abrirla

Haz **doble clic en `index.html`**. Se abre en tu navegador; no necesita
internet, ni servidor, ni instalar nada.

| Pestaña | Qué hay dentro |
|---|---|
| ⏰ **Próximos plazos** | Una fila de **resumen** (plazos abiertos, urgentes, comunicaciones y cuántas en marcha) y, debajo, los plazos de envío ordenados por urgencia: en rojo si quedan ≤ 7 días, en ámbar si quedan ≤ 30. También los congresos sin plazo anunciado. |
| 🗓️ **Calendario** | Los 12 meses del año con los días de congreso y los días de plazo marcados. Toca un día marcado para ver el detalle. |
| 🏛️ **Congresos** | La lista completa (también los pasados). **Buscador y filtros** (por ámbito y situación del plazo). Añadir, editar y borrar congresos. |
| 📄 **Comunicaciones** | Tablero por estados: idea → en preparación → enviada → aceptada/rechazada → presentada. **Buscador y filtros** (por congreso y tipo). El estado se cambia desde la propia tarjeta. |

> Los buscadores ignoran mayúsculas y acentos; los filtros se combinan y cada
> pestaña indica cuántos elementos muestra («Mostrando 3 de 12») con un botón
> «Limpiar».

Arriba a la derecha: **Imprimir resumen** (hoja limpia para el corcho de la
sala), **Exportar** / **Importar** (JSON) y **Restaurar ejemplo**.

## 💾 Dónde se guardan los datos

Los cambios se guardan **en el navegador de cada equipo** (localStorage): si
abres la app en otro ordenador o navegador, no verás los cambios hechos aquí.

Para compartir el calendario o hacer copia de seguridad:

1. Pulsa **⬇️ Exportar** → se descarga `calendario-congresos-entrevias.json`.
2. Pásalo por correo o deja el archivo en una carpeta compartida.
3. En el otro equipo, pulsa **⬆️ Importar** y elige ese archivo. El archivo se
   valida antes de cargarlo: si tiene errores, se explica el motivo y no se
   toca nada.

## ✏️ Cambiar los datos de ejemplo

Los datos con los que arranca la app la primera vez viven en
[`datos.js`](datos.js) y se editan con cualquier editor de texto (las reglas
están comentadas en el propio archivo). El botón «Restaurar ejemplo» vuelve a
ese punto de partida. Ojo: los plazos marcados «por confirmar» son estimados;
confírmalos en la web de cada congreso.

## ✅ Comprobar que todo está bien

Con Node.js 18 o superior (sin instalar dependencias):

```
node comprobar.js
```

Valida los datos iniciales (fechas coherentes, estados válidos, referencias
correctas) y prueba la lógica de plazos y urgencias de `logica.js`. Termina
con «✔ Todo correcto» si todo pasa.

## 🗂️ Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página; ábrela con doble clic. |
| `style.css` | Los estilos (pantalla, móvil e impresión). |
| `app.js` | La interfaz: pestañas, formularios, exportar/importar. |
| `logica.js` | Las reglas puras (fechas, urgencias, validación), compartidas con `comprobar.js`. |
| `datos.js` | Los datos iniciales editables. |
| `comprobar.js` | Las comprobaciones: `node comprobar.js`. |
