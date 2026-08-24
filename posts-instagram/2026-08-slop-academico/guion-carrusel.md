# Guion del carrusel — Academic slop

10 diapositivas, 1080 × 1350 px (4:5). El argumento sale de
[`post-final.md`](post-final.md); aquí va reducido a lo mínimo que se lee de un
vistazo en el móvil, con esquemas donde el texto sobraba.

## Sistema visual

| | |
|---|---|
| Paleta | Naranja `#FF5A00`, negro `#0B0B0B`, blanco `#FFFFFF`. Nada más. |
| Tipografía | Inter (900 para titulares, 500–800 para el resto). |
| Ritmo de fondos | negro · blanco · **naranja** · negro · blanco · negro · blanco · negro · blanco · **naranja** |
| Esquemas | Flechas opuestas (5), gráfico de barras (6), dos recuadros (7), flujo tachado (9). Todo vectorial, sin imágenes. |
| Textura | Líneas de texto que se fragmentan hacia abajo, en la portada y en la 3. Es la metáfora del post: arriba parece un trabajo limpio, abajo son restos. Se dibuja con un generador determinista, así que dos ejecuciones dan el mismo PNG. |

Las dos diapositivas naranjas son los golpes del carrusel: la 3 remata la
escena y la 10 cierra. El resto alterna negro y blanco.

## Checklist

- [ ] Crear contenido (imágenes generadas en `imagenes/`)
- [ ] Escribir caption (`copy-caption.txt`)
- [ ] Programar contenido
- [ ] Publicar `copy-primer-comentario.txt` como primer comentario
- [ ] Pegar los textos alternativos (`textos-alt.txt`)

## Diapositivas

| # | Fondo | Qué lleva |
|---|-------|-----------|
| 1 | Negro | **Academic slop.** «El trabajo mejora. El aprendizaje empeora.» |
| 2 | Blanco | «Análisis impecable. Bibliografía correcta. **Notable alto.**» Abajo: «¿Por qué elegiste ese marco y no otro?» |
| 3 | Naranja | **«No hay respuesta.»** A toda página, sin nada más. |
| 4 | Negro | **Slop académico**: cumple la tarea, sustituye el proceso intelectual que pretendía provocar. Pie: no hay plagio, no es honestidad, es aprendizaje. |
| 5 | Blanco | «Suben las notas. Baja la competencia.» + esquema de flechas opuestas. |
| 6 | Negro | **−17 %** + gráfico: IA libre frente a tutor con pistas. |
| 7 | Blanco | «No es usar IA o no usarla. **Es qué hace con la dificultad.**» + dos recuadros: la elimina / la sostiene. |
| 8 | Negro | Los tres límites de la evidencia + «La coherencia es parte del argumento». |
| 9 | Blanco | «Cambiar qué evaluamos» + flujo: archivo final tachado → el proceso. |
| 10 | Naranja | «¿Qué conserva el estudiante cuando retiramos la herramienta?» + remate y llamada a las fuentes. |

## Sobre el gráfico de la diapositiva 6

Muestra la caída en la evaluación sin IA frente al grupo que nunca la usó: una
barra para el grupo con acceso libre (−17 %) y, para el grupo con tutor de
pistas, una barra a cero etiquetada «sin deterioro». No se le atribuye a ese
grupo una cifra que el estudio no da: lo que reporta es ausencia de deterioro
apreciable frente al control. Cada barra lleva su etiqueta escrita, así que el
color nunca es la única forma de distinguirlas.

## Nota

El pie de página de todas las imágenes lleva `@drraulferrer`. Si se publica
desde otro perfil hay que cambiar la constante `HANDLE` en
`generar-imagenes.js` y regenerar.
