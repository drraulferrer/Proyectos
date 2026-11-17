# MH · Valor profesional · ¿Cuánto vale lo que sabes?

Carrusel de Instagram de 8 páginas (1080 × 1350, 4:5) para @motion.health_, con la misma maqueta que la serie «MH P1 · Activo de salud» y el kit de marca v2 de Canva (Montserrat + Inter, azul marino #091E3D, azul #0A6DEF, menta #18CBA3, violeta #9362ED, coral #EE6A6B, papel #F4F2ED).

## Qué hay

| Ruta | Qué es |
|---|---|
| `salida/01-s1.png` … `08-s8.png` | Las 8 páginas listas para subir |
| `salida/02-la-distancia-animada.mp4` | Versión animada de la página 2 (9 s, H.264), sustituye a `02-s2.png` si se quiere un carrusel mixto |
| `texto-post.md` | Texto del post con llamada a la acción y etiquetas |
| `src/carrusel.html` + `src/marca.css` | Fuente de las 8 páginas |
| `animacion/` | Proyecto HyperFrames de la página 2 animada |

## Cómo regenerar

```bash
# PNG estáticas (Playwright)
node render.js src/carrusel.html salida 1

# Vídeo de la página 2 (HyperFrames 0.9.61)
cd animacion && npx hyperframes check && npx hyperframes render -q delivery -f 30 -o ../salida/02-la-distancia-animada.mp4
```

`render.js` hace una captura por cada `section.slide` y avisa si algún elemento se sale del lienzo.

## Notas de contenido

- Portada: imagen generada en kie.ai (nano-banana), sin personas, logotipo del portátil difuminado. Lleva la etiqueta «Imagen generada con IA», como exige la guía de marca.
- El gráfico de la página 2 empieza en cero a propósito: la cercanía visual entre ambas barras es el mensaje.
- El texto en coral sobre papel usa #D24F51 en lugar del coral de marca para superar el contraste 3:1 en texto grande.
- Cifras: SMI 2027 de 1.286 € (14 pagas), propuesta anunciada el 17/11/2026 y pendiente de publicación en el BOE. Grupo IV del convenio de establecimientos sanitarios de Madrid, anexo IV, tabla 2026: 1.424,25 €. Diferencia 138,25 € (10,75 %).
