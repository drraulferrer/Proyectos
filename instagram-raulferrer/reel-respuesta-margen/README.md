# @_raulferrer · Reel de respuesta: facturación, margen y sueldos

Reel vertical (1080 × 1920, 55 s) que responde a un comentario del carrusel sobre el valor de la fisioterapia. Misma identidad visual que el carrusel (`../valor-fisioterapia`).

Guion por bloques: el comentario citado sin nombre, «veamos qué hay de cierto», dos clínicas con la misma facturación mensual por fisio, el reparto a final de mes con el cálculo del convenio de Madrid, la fórmula del margen, Madrid frente a Cataluña (mínimo de convenio y precio por sesión) y la conclusión: superada la sostenibilidad, el salario es una decisión empresarial.

- `index.html`: composición de HyperFrames.
- `salida/reel-margen-y-sueldos.mp4`: vídeo final.
- `salida/portada-reel.jpg`: fotograma para la portada.
- `textos.md`: texto del reel y respuesta para el hilo.

Regenerar: `npx hyperframes check && npx hyperframes render -q delivery -f 30 -o salida/reel-margen-y-sueldos.mp4`

- `datos/convenios-sanidad-privada-2026.csv`: tablas aplicables en 2026 de 24 convenios de sanidad privada, con fuente, año de la tabla y nivel de verificación.
