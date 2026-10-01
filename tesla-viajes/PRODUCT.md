# Brief de producto · Tesla Viajes

## Para quién

Un conductor de Tesla Model Y RWD (batería LFP de 60 kWh) que viaja por España y
abre la herramienta en el navegador del coche, aparcado o con el copiloto
manejándola. Conoce su coche; no quiere aprender una app nueva.

## Para qué

Planificar un viaje sabiendo, antes de salir:

1. con qué % de batería llega a cada cargador y al destino;
2. dónde parar, cuánto cargar y cuánto tiempo;
3. **cómo se paga en cada cargador** (app, tarjeta RFID, tarjeta bancaria,
   NFC, datáfono o automático en Supercharger), con el dato oficial.

Éxito = desde el coche, en menos de un minuto, ver la ruta con las paradas, el %
de llegada a cada una y el medio de pago de cada cargador, con datos del
registro oficial con menos de 24 h.

## Qué queda fuera (y por qué)

- **Disponibilidad en tiempo real.** No existe hoy una fuente abierta: la DGT
  solo publica el registro estático y la API de Mapa REVE exige solicitar clave
  y limita a 5 peticiones por hora. Se dice claramente en cada ficha.
- **Precios.** El registro oficial no los incluye; inventarlos sería peor que no
  mostrarlos.
- **Leer la batería del coche.** Exigiría la Fleet API de Tesla (registro de
  desarrollador, dominio propio y coste por uso). El % se introduce a mano.
- **Backend propio.** La web es estática; los datos se regeneran a diario en
  GitHub Actions.

## Personalidad

Un instrumento de cuadro, no un escaparate: sobrio, legible de un vistazo,
honesto con la incertidumbre.

## Reglas de diseño

- **Regla del vistazo.** El % de llegada se lee en menos de un segundo: cifra
  grande, alto contraste, sin decoración alrededor.
- **Regla del pago visible.** En cada cargador, el medio de pago aparece junto a
  la potencia, nunca escondido en un desplegable.
- **Regla de la fuente.** Todo dato dice de dónde sale y de cuándo es; lo que es
  estimación se llama estimación.
- **Regla del dedo en marcha.** Áreas táctiles de 56 px como mínimo, texto base
  de 18 px, contraste ≥ 4,5:1 en los dos temas.

## Anti-referencias

- Un mapa de agregador saturado de iconos, banners y capas.
- Un salpicadero «gamer» con neones, degradados y animaciones.
- Una app que promete «tiempo real» sin tenerlo.
- Formularios con veinte opciones antes de poder calcular nada.
