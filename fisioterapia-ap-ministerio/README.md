# Fisioterapia en Atención Primaria: documento técnico para el Ministerio de Sanidad

Especificación y materiales de trabajo para el documento técnico
«Fisioterapia en Atención Primaria en el Sistema Nacional de Salud: modelo organizativo,
acceso, dotación y evaluación», que amplía y corrige el borrador
`Propuesta de Fisioterapia en Atención Primaria para el Ministerio de Sanidad`.

## Archivos

| Archivo | Qué es |
|---|---|
| [SPEC.md](SPEC.md) | Especificación del documento final: propósito, estructura, contenido obligatorio por sección, reglas de estilo y terminología, política de referencias, criterios de aceptación y decisiones pendientes de autoría. |
| [trazabilidad-comentarios.md](trazabilidad-comentarios.md) | Los 52 comentarios de revisión del borrador y la decisión adoptada para cada uno. |
| [referencias.md](referencias.md) | Banco de fuentes primarias con estado de verificación, en formato de lectura. |
| [documento/salida/](documento/salida/) | **Documento v1.1** en Word y PDF: `fisioterapia-ap-sns.docx` y `fisioterapia-ap-sns.pdf`. |
| [documento/fuente/](documento/fuente/) | Texto fuente de cada sección, en Markdown. |
| [documento/datos/](documento/datos/) | Fuente única de datos: matriz de coherencia, vías, programas, indicadores, parámetros del modelo, cifras, referencias y comprobaciones de los 52 comentarios. |
| [documento/build/](documento/build/) | Scripts de modelo, ensamblado, validación y maquetación. |

## Cómo reconstruir el documento

```bash
cd documento/build
npm install            # paquete docx para la maquetación
./construir.sh         # genera, valida y maqueta en Word y PDF
python3 validar.py     # solo la validación contra SPEC.md y la Voice DNA
```

Requisitos: Python 3, Node.js, LibreOffice Writer, poppler-utils y la fuente Carlito.
Para cambiar un proceso, un programa, un indicador o un parámetro del modelo, se edita el
archivo de `documento/datos/` y se reconstruye: las tablas de las secciones 5, 6, 8, 9 y
10 y los anexos se regeneran solos.

## Estado de la versión 1.1

La versión 1.1 amplía cada sección con tres documentos aportados: la instrucción de la
Gerencia Asistencial de AP de Madrid sobre procesos de demanda, el análisis de la
Sociedade Galega de Fisioterapeutas de 2019 y un documento de trabajo sobre la situación
madrileña. El documento tiene 87 páginas y cita 166 referencias.

Todos los criterios de aceptación de `SPEC.md` se cumplen salvo el 9.2. Ese criterio exige
que todas las referencias estén verificadas abriendo la fuente, y el entorno de trabajo
solo permitió abrir PubMed. Los 101 artículos y documentos aportados citados están
verificados; las 65 normas, documentos autonómicos y estadísticas citados quedan
pendientes de cotejo. El anexo F del documento enumera esas referencias, las
discrepancias encontradas en los documentos aportados y los datos que faltan por
incorporar.

Pendiente: aplicar la plantilla del colegio profesional con los logos de la portada. La
plantilla no estaba entre los archivos recibidos.
