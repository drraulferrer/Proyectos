---
name: consenso-jueces
description: Validez de contenido de un instrumento de autoinforme mediante un panel de jueces. Crea jueces expertos simulados con perfiles profesionales definidos por el usuario, que puntúan a ciegas claridad, coherencia, relevancia y suficiencia en una escala de 1 a 4, con asignación ciega a dimensión e ítems trampa. Calcula la V de Aiken con IC, I-CVI, S-CVI y kappa modificado, y redacta un informe con decisiones por ítem. También analiza las puntuaciones de un panel humano real. Úsala cuando el usuario quiera validar el contenido de una escala, un cuestionario o un test, depurar ítems antes de un juicio de expertos o analizar las valoraciones de sus jueces.
argument-hint: "[carpeta del estudio o archivo del instrumento]"
model: opus
---

# Panel de jueces para validez de contenido

## Reparto de modelos

Este reparto es un requisito del diseño y no se negocia con el usuario ni se cambia por comodidad:

- **Opus coordina**: la entrevista, el diseño de los perfiles y sus narrativas, la redacción de los ítems trampa, la interpretación de los resultados y el informe. La skill declara `model: opus` para que todo esto lo haga Opus aunque la sesión use otro modelo.
- **Sonnet juzga**: todos los jueces, tanto la evaluación como la asignación ciega, se lanzan con `model: "sonnet"`. Nunca uses otro modelo para un juez.

Si al empezar detectas que no estás funcionando con Opus (por ejemplo, porque el entorno no permite cambiar de modelo), díselo al usuario antes de la entrevista y pregúntale si quiere continuar.

Esta skill tiene dos modos:

- **Simulado**: tú redactas los perfiles de los jueces y cada juez es un subagente que evalúa a ciegas. Sirve para depurar ítems antes del panel humano. **No es evidencia de validez de contenido**, porque todos los jueces proceden de modelos con un entrenamiento común y sus errores están correlacionados. Recuérdalo al usuario al empezar y escríbelo en el informe.
- **Humano**: el usuario aporta las puntuaciones de su panel real en CSV y la skill calcula los mismos índices.

Los scripts están en `${CLAUDE_SKILL_DIR}/scripts/` y solo usan la biblioteca estándar de Python. Si `${CLAUDE_SKILL_DIR}` no está definido, usa la carpeta donde está este archivo.

Cada estudio vive en su propia carpeta, por defecto `validaciones/<nombre-del-estudio>/` dentro del directorio de trabajo:

```
validaciones/<estudio>/
├── config.json            configuración completa del estudio
├── instrumento.csv        ítems reales: id, dimension, texto, sentido
├── dimensiones.csv        id, nombre, definicion
├── trampas.csv            ítems trampa (solo modo simulado)
├── privado/               claves de los códigos ciegos (los jueces no lo leen)
├── jueces/                prompt completo de cada juez, para la trazabilidad
├── cuadernillos/          material que recibe cada juez
├── respuestas/            JSON de cada juez
└── resultados/            tablas, índices, comentarios e informe
```

## Fase 1. Entrevista inicial

Haz las preguntas de una en una o en bloques pequeños. No avances a la fase siguiente sin las respuestas. Usa AskUserQuestion cuando las opciones sean cerradas y la conversación cuando haya que recoger texto.

**1. Modo.** Simulado o humano. Si es humano, salta a la fase 6.

**2. Instrumento.** Pide la ruta de los archivos o que los pegue. Necesitas, como mínimo:
- Los ítems con su dimensión asignada y, si existe, su sentido (directo o inverso).
- La definición conceptual y operativa del constructo y de cada dimensión. Sin definiciones operativas no se puede juzgar la coherencia ni la suficiencia: si faltan, pídelas y no las inventes.
- Las instrucciones del instrumento, el formato de respuesta y el marco temporal.
- La población diana, el idioma y la variante, y el propósito del estudio.
- Si es un instrumento nuevo o una adaptación. En una adaptación pide también el original.

Pasa los ítems a `instrumento.csv` y las dimensiones a `dimensiones.csv` con el formato de `${CLAUDE_SKILL_DIR}/plantillas/`. Muestra al usuario un resumen (número de ítems por dimensión) para que lo confirme.

**3. Número de jueces.** Pregunta con AskUserQuestion. Opciones: 6 (recomendado), 5, 8, 10. Explica en la pregunta que con 5 jueces o menos el criterio de Lynn exige acuerdo total en el I-CVI y que, a partir de 6, el umbral es 0,78. Mínimo 3, máximo 10.

**4. Perfiles de los jueces.** Pregunta si el usuario quiere dictar los perfiles o prefiere que los propongas tú a partir del constructo. En ambos casos, cada perfil debe tener:
- Título profesional.
- Formación.
- Años de experiencia.
- Ámbito de trabajo (universidad, clínica, escuela, empresa, comunidad).
- Enfoque teórico o metodológico.
- Prioridades: en qué se fija al revisar un instrumento.

Si los propones tú, presenta una tabla y pide que el usuario la apruebe o la modifique juez a juez. Reglas de diversidad que debes cumplir y explicar si el usuario las incumple:
- No puede haber dos jueces con el mismo título y el mismo ámbito.
- Al menos un juez experto en metodología o psicometría.
- Al menos un juez experto en el constructo.
- Al menos un juez que trabaje directamente con la población diana o que aplique instrumentos de este tipo.
- Los perfiles deben diferir en formación y prioridades, no solo en el título.

Redacta para cada juez una `narrativa` de 4 a 6 frases en segunda persona ("Eres..."), con su trayectoria y lo que le preocupa al revisar ítems. Es lo que leerá el subagente.

**5. Criterios.** Los criterios base son fijos: claridad, coherencia y relevancia por ítem, y suficiencia por dimensión, en una escala de 1 a 4 con las anclas de Escobar-Pérez y Cuervo-Martínez (2008). Pregunta con AskUserQuestion (multiSelect) qué módulos adicionales quiere:
- Asignación ciega a dimensión (recomendado). Cada juez asigna los ítems sin ver su dimensión, en una tarea separada.
- Adecuación a la población diana.
- Neutralidad ante la deseabilidad social.
- Ajuste al formato de respuesta.

Si elige "Other", recoge un criterio personalizado: clave sin espacios, nombre, definición y las cuatro anclas, orientadas de modo que 4 sea el valor óptimo. Advierte de que cada criterio añadido también tendrá que puntuarlo el panel humano si quiere comparar los resultados.

**6. Ítems trampa.** Explica qué son y propón usarlos. Si acepta, redáctalos tú siguiendo `${CLAUDE_SKILL_DIR}/referencias/items-trampa.md`, guárdalos en `trampas.csv` y muéstraselos para que los apruebe.

**7. Umbrales.** Muestra los umbrales por defecto y pregunta si quiere cambiarlos: V de Aiken ≥ 0,70, límite inferior del IC al 95 % ≥ 0,50, I-CVI ≥ 0,78 (1,00 con 5 jueces o menos), V < 0,50 en coherencia o relevancia para proponer eliminar, asignación ciega correcta ≥ 70 %.

Escribe `config.json` siguiendo `${CLAUDE_SKILL_DIR}/plantillas/config-ejemplo.json`. En `perfil` incluye los campos y la `narrativa`. El campo `modelo` de cada juez es siempre `sonnet`; `preparar.py` rechaza cualquier otro valor. Fija una semilla y anótala, para que el estudio sea reproducible.

## Fase 2. Preparación

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/preparar.py validaciones/<estudio>
```

El script asigna códigos ciegos (E01, E02...) a los ítems reales y a las trampas, aleatoriza el orden para cada juez, escribe los cuadernillos y los prompts de cada juez en `jueces/`, y lista los lanzamientos. Si da error, corrige el archivo que indica y vuelve a ejecutarlo.

No leas los cuadernillos completos ni los muestres: no hace falta y gastan contexto.

## Fase 3. Evaluación

Lanza **todos** los subagentes de la lista en un solo mensaje, para que trabajen en paralelo y ninguno vea la salida de otro. Por cada línea de la lista:

- `subagent_type`: `general-purpose`
- `model`: `sonnet`, siempre
- `description`: `<juez> <tarea>`
- `prompt`: `Lee el archivo <ruta del prompt> y sigue sus instrucciones al pie de la letra. No leas ningún otro archivo salvo el cuadernillo que ese archivo indica.`

No añadas al prompt nada sobre el instrumento, los ítems trampa ni las respuestas de otros jueces. Espera a que terminen todos.

## Fase 4. Validación

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/analizar.py validaciones/<estudio> --validar
```

Si el script devuelve jueces con problemas (código de salida 2), relanza solo esos jueces con el mismo prompt, como máximo dos veces. Si un juez sigue fallando, díselo al usuario y pregunta si continúa sin él.

## Fase 5. Análisis

```bash
python3 ${CLAUDE_SKILL_DIR}/scripts/analizar.py validaciones/<estudio>
```

Genera en `resultados/`:
- `decisiones.csv`: decisión propuesta por ítem (Mantener, Revisar, Eliminar o reformular a fondo) y motivo.
- `indices_items.csv`: media, mediana, V de Aiken con IC, I-CVI y kappa modificado por ítem y criterio.
- `escala.csv`: S-CVI/Ave y S-CVI/UA por criterio.
- `suficiencia.csv`: V de Aiken de la suficiencia por dimensión y el contenido ausente señalado.
- `trampas.csv` y `jueces.csv`: detección de trampas, severidad, desviación respecto al panel y acierto en la asignación ciega de cada juez.
- `tablas.md` y `comentarios.md`: tablas listas para el informe y comentarios agrupados por ítem.

Lee `tablas.md` y `comentarios.md`. No hace falta leer los CSV.

## Fase 6. Modo humano

1. Pide los archivos del instrumento y escribe `config.json` con `"modo": "humano"`, los criterios usados por el panel y los umbrales. Los jueces no hace falta listarlos.
2. Pide las puntuaciones en el formato de `${CLAUDE_SKILL_DIR}/plantillas/respuestas-humanos.csv`. Si llegan en otro formato (una hoja por juez, formato ancho), conviértelas tú a ese formato y enséñale al usuario las primeras filas para que las confirme.
3. Ejecuta:
   ```bash
   python3 ${CLAUDE_SKILL_DIR}/scripts/importar.py validaciones/<estudio> <archivo.csv>
   python3 ${CLAUDE_SKILL_DIR}/scripts/analizar.py validaciones/<estudio>
   ```
4. Si existe un estudio simulado previo del mismo instrumento, compara las decisiones de ambos paneles ítem a ítem en el informe.

## Fase 7. Informe

Escribe `resultados/informe.md` con estas secciones:

1. **Resumen**: número de ítems que se mantienen, se revisan y se proponen para eliminar, e índices globales de la escala.
2. **Método**: modo, reparto de modelos (perfiles, ítems trampa e informe con Claude Opus; jueces con Claude Sonnet), número y perfil de los jueces (tabla), criterios y anclas, escala, procedimiento ciego, ítems trampa, índices, umbrales y semilla. En el modo simulado, redacta esta sección a partir de `${CLAUDE_SKILL_DIR}/referencias/parrafo-metodos.md`, con los datos reales del estudio en lugar de los corchetes, y entrega también ese párrafo por separado en `resultados/parrafo-metodos.md` para que el usuario lo pegue en su manuscrito.
3. **Calidad del panel**: detección de ítems trampa por juez y por tipo de defecto, jueces muy indulgentes o muy alejados del panel, y qué implica para fiarse del resto de resultados.
4. **Resultados por ítem**: para cada ítem que no se mantiene, los índices que fallan, una síntesis de los comentarios de los jueces y una o dos propuestas de redacción. Los ítems que se mantienen van en una tabla.
5. **Asignación ciega**: ítems que los jueces asignan a otra dimensión y qué sugiere eso sobre la estructura.
6. **Suficiencia**: dimensiones insuficientes y contenido que falta, con propuestas de ítems nuevos si el usuario las quiere.
7. **Limitaciones y siguientes pasos**.

Normas de redacción del informe:
- Escribe con frases completas y en el idioma del estudio.
- No uses incisos entre guiones; usa comas.
- No pongas etiquetas de confianza como [Seguro] o [Probable] en el informe. Son solo para la conversación.
- Las decisiones del script son propuestas. Preséntalas así: la decisión final es del investigador.
- Usa la coma decimal si el estudio está en español.

Al terminar, resume al usuario en el chat los hallazgos principales, señala lo que más le conviene revisar y ofrece convertir el informe en un documento.

## Referencias de los índices

- Aiken, L. R. (1985). Three coefficients for analyzing the reliability and validity of ratings. *Educational and Psychological Measurement, 45*, 131-142.
- Penfield, R. D. y Giacobbi, P. R. (2004). Applying a score confidence interval to Aiken's item content-relevance index. *Measurement in Physical Education and Exercise Science, 8*(4), 213-225.
- Lynn, M. R. (1986). Determination and quantification of content validity. *Nursing Research, 35*(6), 382-385.
- Polit, D. F. y Beck, C. T. (2006). The content validity index: Are you sure you know what's being reported? *Research in Nursing & Health, 29*, 489-497.
- Polit, D. F., Beck, C. T. y Owen, S. V. (2007). Is the CVI an acceptable indicator of content validity? *Research in Nursing & Health, 30*, 459-467.
- Rovinelli, R. J. y Hambleton, R. K. (1977). On the use of content specialists in the assessment of criterion-referenced test item validity. *Tijdschrift voor Onderwijsresearch, 2*, 49-60.
- Escobar-Pérez, J. y Cuervo-Martínez, Á. (2008). Validez de contenido y juicio de expertos: una aproximación a su utilización. *Avances en Medición, 6*, 27-36.
