# Tesla Viajes

Planificador de viajes para un **Tesla Model Y RWD con batería LFP de 60 kWh**,
pensado para usarse desde el navegador del coche. Calcula la ruta, el % de
batería con el que llegas a cada cargador y al destino, propone dónde parar y
cuánto cargar, y enseña en cada punto de recarga **cómo se paga** según el
registro oficial.

**Dirección para el coche:** <https://drraulferrer.github.io/Proyectos/tesla-viajes/>
(funciona en cuanto GitHub Pages esté activado, ver más abajo).

## Qué hace

- **Ruta y % de batería.** Ruta por carretera con OSRM y consumo físico tramo a
  tramo: velocidad real (hasta tu velocidad de autovía), desnivel (altitud cada
  kilómetro), temperatura, viento de cara o de cola y lluvia previstos a la hora
  en que pasarás por cada punto, y gasto de climatización.
- **Paradas óptimas.** Elige la combinación de cargadores que llega antes,
  llegando a cada uno con la reserva mínima, sin pasar de la carga máxima que
  elijas y descartando los que estén cerrados a la hora de llegada. Usa la curva
  de carga del paquete LFP (unos 30 minutos del 10 % al 80 %) y la potencia real
  que da cada punto a una batería de ~370 V.
- **Medio de pago de cada cargador.** App, tarjeta RFID, tarjeta de crédito, de
  débito, datáfono con PIN o NFC, tal como lo declara el operador. En los
  Superchargers indica que el pago es automático con tu cuenta Tesla. Si un punto
  de 50 kW o más no declara tarjeta, recuerda lo que exige el Reglamento (UE)
  2023/1804 (AFIR).
- **Cargadores en la ruta.** Lista de todos los cargadores rápidos compatibles a
  menos de 3 km, con el % con el que llegarías, el desvío y el medio de pago.
  Filtros por potencia, por pago con tarjeta o por Superchargers.
- **Cerca de mí.** Con el GPS del coche, los cargadores rápidos más cercanos.

## Lo que no hace (y por qué)

- **Disponibilidad en tiempo real.** La DGT solo publica el registro estático
  (actualizado cada 24 h). La API de Mapa REVE exige pedir una clave por
  formulario, y los proyectos que ya la usan citan un límite de 5 peticiones por
  hora, insuficiente para consultar en directo. Cada ficha lo dice y enlaza a la
  app del operador o a Mapa REVE. En los Superchargers, la pantalla del coche ya
  muestra los postes libres.
- **Precios.** No están en el registro oficial.
- **Leer la batería del coche.** Requiere la Fleet API de Tesla (registro de
  desarrollador, dominio propio y coste por uso). El % se introduce a mano.

## Datos

| Dato | Fuente | Frescura |
|---|---|---|
| Cargadores, conectores, potencia, intensidad, horario, servicios y **medios de pago** | Registro de puntos de recarga del MITERD publicado por la DGT en el [Punto de Acceso Nacional](https://nap.dgt.es/dataset/puntos-de-recarga-electrica-para-vehiculos) (DATEX II v3, CC BY 4.0) | Diaria, regenerado por GitHub Actions |
| Ruta | [OSRM](https://project-osrm.org/) sobre OpenStreetMap | En cada consulta |
| Altitud | [Open-Meteo Elevation](https://open-meteo.com/en/docs/elevation-api) (Copernicus DEM 90 m) | En cada consulta |
| Temperatura, viento y lluvia | [Open-Meteo Forecast](https://open-meteo.com/en/docs) | Previsión horaria |
| Búsqueda de lugares y mapa | [Nominatim](https://nominatim.org/) y teselas de OpenStreetMap | En cada consulta |

El conversor (`scripts/construir_datos.py`) corrige lo que el registro trae mal:
une registros duplicados del mismo operador en el mismo punto, interpreta
«00:00 - 00:00» en todos los días como 24 horas, no da por cerrado un día que el
operador no declara y marca como dudoso el horario que contradice el «24/7» del
propio registro. Con el registro del 30 de septiembre de 2026: 11.074 estaciones,
4.961 con CCS de 50 kW o más y solo 1.285 de ellas declaran pago con tarjeta.

## Modelo del coche

| Parámetro | Valor por defecto | Dónde se cambia |
|---|---|---|
| Batería utilizable | 57,5 kWh (60 kWh nominales) | Ajustes |
| Masa | 1.930 kg + 100 kg de ocupantes y equipaje | Ajustes |
| Aerodinámica y rodadura | CdA 0,60 m², Crr 0,0085 | `web/js/vehiculo.js` |
| Eficiencia | 90 % de tracción, 65 % de regeneración | `web/js/vehiculo.js` |
| Consumo resultante en llano a 20 °C | ~179 Wh/km a 120 km/h, ~126 Wh/km a 90 km/h | Ajuste de consumo (%) |
| Carga en corriente continua | Pico de ~170 kW, 10→80 % en ~30 min | `web/js/vehiculo.js` |
| Carga en alterna | 11 kW (trifásica) | `web/js/vehiculo.js` |

Si tu coche gasta más o menos que la estimación, cambia el **ajuste de consumo**
en Ajustes (por ejemplo, 108 % si en autovía ves unos 195 Wh/km en lugar de 180).

## Publicación (una sola vez)

1. En GitHub, **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Fusiona el PR en `main`. El flujo `tesla-viajes` prueba la aplicación,
   descarga el registro oficial, genera los datos y publica la web.
3. A partir de ahí se regenera sola cada día a las 09:07 UTC.

En el coche: abre el navegador, entra en la dirección de arriba y guárdala en
favoritos.

## Desarrollo

Requisitos: Node 20 o superior y Python 3.9 o superior, sin más dependencias en
tiempo de ejecución (Leaflet va incluido en `web/vendor`).

```bash
cd tesla-viajes
npm install                 # solo para la prueba de interfaz (Playwright)
npm test                    # motor (node:test) y conversor (unittest)
npm run test:interfaz       # Chromium de punta a punta, con la red simulada
npm run datos               # descarga el registro y genera web/datos/
npm run servir              # http://localhost:8080
```

```
scripts/construir_datos.py   XML DATEX II → web/datos/estaciones.json
scripts/capturar_fixtures.py fixtures reales del corredor Madrid → Valencia
web/js/vehiculo.js           parámetros del Model Y y curva de carga
web/js/consumo.js            modelo físico de consumo
web/js/planificador.js       búsqueda de paradas (Dijkstra sobre cargador × % de batería)
web/js/estaciones.js         compatibilidad, potencia real, pagos y horarios
web/js/servicios.js          OSRM, Nominatim y Open-Meteo
web/js/app.js                interfaz
```

## Siguientes pasos posibles

- **Tiempo real:** solicitar la clave de la API de Mapa REVE
  (<https://www.mapareve.es/api-contacto>) y, si el límite lo permite, cachear el
  estado de los cargadores rápidos en una tarea programada.
- **Batería en directo:** integrar la Fleet API de Tesla para leer el % sin
  teclearlo.
- **Sin cobertura:** un *service worker* para que la última ruta y los datos
  funcionen en túneles y zonas sin señal.

Datos de cargadores: © Ministerio para la Transición Ecológica y el Reto
Demográfico y Dirección General de Tráfico, licencia CC BY 4.0. Mapas y lugares:
© colaboradores de OpenStreetMap (ODbL). Leaflet: licencia BSD-2.
