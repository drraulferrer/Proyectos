# Analítica con PostHog — raulferrer.org

Medición de visitas y **acciones** (qué se lee, qué se pulsa, quién llega al contacto)
para la web personal del Dr. Raúl Ferrer.

## Archivos

| Archivo | Dónde va | Qué hace |
|---|---|---|
| `rf-analytics.html` | WordPress → Divi → **Opciones del tema → Integración → `<head>`** | Carga PostHog y registra todos los eventos. Mide **todo el sitio**. |
| `../wordpress-kimi.html` | Módulo **Código** de Divi en la página de inicio | La web. Ya lleva los atributos `data-ph` que dan nombre a cada acción. |

Separar las dos piezas es intencionado: el motor de medición vive en la cabecera
(y así cubre también entradas del blog y páginas futuras), y la página solo aporta
las **etiquetas** de lo que hay que medir.

## Instalación en 3 pasos

1. Crea el proyecto en **PostHog** eligiendo región **EU** (RGPD) y copia la
   *Project API Key* (empieza por `phc_`).
2. Pega el contenido de `rf-analytics.html` en Divi → Opciones del tema →
   Integración → «Código añadido al `<head>` del blog» y sustituye
   `phc_PEGA_AQUI_TU_PROJECT_API_KEY` por tu clave real.
3. Abre la web y compruébalo en PostHog → **Activity** (eventos en vivo).

> Sin clave válida el script no carga nada y avisa por consola. Es deliberado:
> evita enviar datos a un proyecto equivocado.

## Configuración (`CFG`, arriba del archivo)

| Opción | Valores | Por defecto |
|---|---|---|
| `API_KEY` | tu clave `phc_…` | — (obligatoria) |
| `REGION` | `'eu'` · `'us'` | `'eu'` |
| `MODO` | `'consentimiento'` · `'sin-cookies'` · `'siempre'` | `'consentimiento'` |
| `GRABAR_SESIONES` | `true` · `false` | `false` |
| `DEBUG` | `true` · `false` | `false` |

**`MODO: 'consentimiento'`** (recomendado): arranca sin escribir nada en el
dispositivo (`persistence: 'memory'`) y sube a cookies solo cuando hay
consentimiento de analítica. Detecta automáticamente **Complianz**, **Cookiebot**
y **CookieYes**; si usas otro banner, basta con:

```js
window.rfAnalyticsConsent = true;
window.dispatchEvent(new Event('rf-analytics-consent'));
```

`'sin-cookies'` nunca persiste nada: cumples sin banner, pero cada visita cuenta
como usuario nuevo (las visitas recurrentes y los embudos entre páginas se pierden).

## Eventos que se registran

| Evento | Cuándo | Propiedades |
|---|---|---|
| `$pageview` / `$pageleave` | automático | url, referrer, UTM, dispositivo |
| `cta_click` | botones principales | `cta`, `zona`, `texto` |
| `nav_click` | enlaces internos `#` | `destino`, `texto` |
| `seccion_vista` | la sección entra en pantalla (1 vez) | `seccion` |
| `scroll_profundidad` | 25 / 50 / 75 / 90 % | `porcentaje` |
| `ambito_click` | tarjeta de ámbito | `ambito` |
| `proyecto_click` | tarjeta de proyecto | `proyecto` |
| `contacto_click` | email · LinkedIn · ORCID | `canal`, `destino` |
| `enlace_externo` | cualquier enlace a otro dominio | `dominio`, `destino` |
| `salida_pagina` | al abandonar la página | `segundos`, `scroll_max` |

**Conversión principal:** `contacto_click` con `canal = email`.

## Añadir eventos nuevos

No hace falta tocar JavaScript. Basta con marcar el elemento en el HTML:

```html
<a href="/cv.pdf" data-ph="descarga_cv" data-ph-formato="pdf">Descargar CV</a>
```

Regla: `data-ph` es el **nombre del evento** y cada `data-ph-*` se convierte en
una **propiedad** (`data-ph-formato` → `formato`). Si un elemento tiene `data-ph`,
manda ese evento y se desactiva la regla genérica para él (así el email no cuenta
dos veces como `contacto_click` y `enlace_externo`).

Desde JavaScript, en cualquier momento:

```js
rfTrack('newsletter_alta', { origen: 'pie' });
```

## Verificación y problemas

- **No aparece nada** → mira la consola del navegador. Si dice *«Falta la Project
  API Key»*, no sustituiste la clave. Si dice *«No se pudo cargar PostHog»*, es un
  bloqueador de anuncios: pruébalo en ventana privada sin extensiones.
- **Depurar** → pon `DEBUG: true` y verás en consola cada evento antes de enviarse.
- **Contar de más** → Divi a veces duplica el código de cabecera si también lo
  pegas en un módulo Código. Debe estar **solo** en Integración → `<head>`.

## Privacidad

- Región **EU**, `person_profiles: 'identified_only'` y grabación de sesiones
  desactivada: no se crean perfiles de personas ni se graba la navegación.
- Aun así, PostHog es un tratamiento de datos: añádelo a tu **política de
  privacidad y de cookies** y decláralo en el banner como analítica.
