# Arranque de la redacción del informe FFyC

**Fecha de corte:** 19 de octubre de 2026 · **Spec vigente:** v0.4.4

## 1. Qué se va a escribir

Un informe técnico de 100 a 140 páginas, más anexos, que el Consejo General de Colegios de Fisioterapeutas de España presentará por la sede electrónica del Ministerio de Sanidad. En él se solicita crear la especialidad de Fisioterapia Familiar y Comunitaria por el procedimiento del RD 589/2022 (arts. 4 a 6) y se justifican los 20 descriptores de su anexo I. Incluye el programa formativo, listo para publicarse como orden ministerial, y la propuesta de texto normativo.

## 2. Decisiones cerradas

| Decisión | Valor | Dónde |
|---|---|---|
| Vía | Nuevo título de especialista, no ACE | SPEC §2.1 |
| Solicitante | Consejo General de Colegios de Fisioterapeutas de España, aceptado por la DGOP | SPEC §2.4 |
| Entidades que acompañan | Asociación de la sección de AP de la AEF (grupo de expertos) y AEF | SPEC §2.4 |
| Cambios normativos | Nuevo apartado «Especialidades de Fisioterapia» en el anexo I del RD 183/2008; FFyC en la letra c) del anexo II (UDMAFyC) | SPEC §2.2 |
| Duración | 2 años, como EFyC (criterio 5.3) | SPEC §5 |
| Unidad docente | UDMAFyC, con adenda al anexo II de la Orden PJC/798/2024 | SPEC §6, cap. 8 |
| Modelo del programa | Numeración del programa de MFyC 2024; tablas de actividades mínimas y cronograma de EFyC 2010 | SPEC §6, cap. 7 |
| Modelo del informe de justificación | Libro Blanco de las ACE Pediátricas 2024: elementos diferenciales, 7 categorías de necesidad, matriz de relación | `referencias/contraste-libro-blanco-ACE-2024.md` |
| Límite competencial | Ley 44/2003, art. 7.2.b), y Orden CIN/2135/2008 | `referencias/cruce-competencias-grado-fisioterapia.md` |

El registro completo, con fechas, está en `seguimiento/decisiones.md`.

## 3. Decisiones abiertas que bloquean capítulos

| Decisión | Bloquea | Quién decide |
|---|---|---|
| Atención continuada: guardias o actividad de tarde, domicilio y comunidad | Cap. 7, apartado 8 | Comité de redacción |
| Duración de la rotación libre (propuesta: 2 meses) | Cap. 7 | Comité de redacción |
| Capacidad docente inicial por centro de salud (1 o 2 residentes/año) | Cap. 8 y 9 | Comité de redacción |
| Número mínimo de fisioterapeutas por centro docente (propuesta: 2) | Cap. 8 | Consenso de expertos |
| Umbrales de actividad mínima del centro docente | Cap. 8 | Consenso de expertos |

## 4. Orden de redacción recomendado

El orden prioriza lo que no depende de datos externos, para que el trabajo avance mientras llegan los datos.

| Paso | Capítulo | Depende de | Estado |
|---|---|---|---|
| 1 | Anexo A, matriz del RD 589/2022 (ya precargada) | Nada | Precargado |
| 2 | Cap. 2, marco normativo | PDF de `referencias/normativa/` | Pendiente |
| 3 | Cap. 3, definición, elementos diferenciales y matriz de relación | Cruce de competencias | Pendiente |
| 4 | Cap. 7, programa oficial (borrador 0) | Caps. 2 y 3; decisiones abiertas | Pendiente |
| 5 | Anexo J, recuento de competencias exclusivas | Cap. 7 | Pendiente |
| 6 | Cap. 8, requisitos de acreditación | Cap. 7; consenso de expertos | Pendiente |
| 7 | Cap. 10, test de proporcionalidad | Caps. 2 y 3 | Pendiente |
| 8 | Cap. 6, comparación internacional | Búsqueda propia | Pendiente |
| 9 | Caps. 4 y 5, necesidad y situación en España | Datos de `seguimiento/datos-necesarios.md` | Pendiente |
| 10 | Cap. 9, necesidades y plan de implantación | Caps. 5 y 8 | Pendiente |
| 11 | Cap. 1, introducción y metodología | Método real seguido | Pendiente |
| 12 | Anexo B, texto normativo | Caps. 7 y 8 | Pendiente |
| 13 | Cap. 11, resumen ejecutivo y bibliografía | Todo lo anterior | Pendiente |

## 5. Mapa de archivos

```
especialidad-fisioterapia-fyc/
├── CLAUDE.md                 reglas para cualquier sesión de trabajo
├── ARRANQUE.md               este documento
├── SPEC.md                   especificación vinculante
├── informe/                  el informe, un archivo por capítulo
│   └── anexos/               anexos A a J
├── seguimiento/
│   ├── decisiones.md         registro de decisiones
│   ├── pendientes.md         gestiones externas y verificaciones
│   └── datos-necesarios.md   datos por capítulo, con fuente
└── referencias/
    ├── normativa/            BOE en PDF
    ├── cruce-competencias-grado-fisioterapia.md
    └── contraste-libro-blanco-ACE-2024.md
```

El PDF del Libro Blanco de las ACE Pediátricas 2024 no está en el repositorio. Si hace falta consultarlo, hay que adjuntarlo en la sesión; lo esencial está en `referencias/contraste-libro-blanco-ACE-2024.md`.

## 6. Mensaje para abrir la nueva sesión

Copia esto como primer mensaje:

> Vamos a redactar el informe de la especialidad de Fisioterapia Familiar y Comunitaria. Trabaja en `especialidad-fisioterapia-fyc/`. Lee primero `CLAUDE.md`, `ARRANQUE.md` y `SPEC.md`. Empieza por el paso [N] del orden de redacción: [capítulo]. Al terminar, actualiza la matriz del anexo A, los pendientes y el estado en `ARRANQUE.md`.
