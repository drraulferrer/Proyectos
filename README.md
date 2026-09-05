# Proyectos

Repositorio genérico para proyectos varios. Es independiente del
[cuadro de mando fisio DASE](https://github.com/drraulferrer/cuadro-mando-fisio-dase)
y de la [landing EPS dolor Entrevías](https://github.com/drraulferrer/landing-eps-dolor-entrevias),
que tienen sus propios repositorios.

## Organización

Cada proyecto vive en su propia carpeta en la raíz del repositorio:

```
Proyectos/
├── proyecto-a/
│   └── README.md
├── proyecto-b/
│   └── README.md
└── ...
```

### Convenciones

- Nombres de carpeta en minúsculas y con guiones: `mi-nuevo-proyecto`
- Cada proyecto incluye su propio `README.md` con una breve descripción de qué es y cómo usarlo
- Si un proyecto crece lo suficiente, puede moverse a su propio repositorio

## Índice de proyectos

| Proyecto | Descripción | Estado |
|----------|-------------|--------|
| [calendario-congresos-entrevias](calendario-congresos-entrevias/) | Calendario de comunicaciones a congresos del CS Entrevías: plazos de envío, estado de cada comunicación y hoja imprimible. App local sin dependencias (se abre con doble clic). | En uso |
| [panel-claude](panel-claude/) | Panel web local sobre Claude Code: informe diario, botones de un clic (habilidades y automatizaciones) y registro de sesiones. Pensado para usarse sin terminal. | En uso |
| [skillspector](skillspector/) | Escáner de seguridad de NVIDIA para revisar habilidades (*Skills*) de Claude Code antes de instalarlas: detecta instrucciones ocultas, fugas de datos y código malicioso. | En uso |

## Notas

- [Bitácora de herramientas](lecciones-integracion-herramientas.md) — qué patrones de diseño/UI, persistencia de datos e integración de herramientas se repiten en el portfolio, para arrancar la siguiente idea con menos dudas.
