# @_raulferrer · Historia: precio de la primera visita por ciudad

Imagen de historia (1080 × 1920) con la mediana del precio de primera visita de fisioterapia que publican los profesionales en Doctoralia en 14 capitales, junto al salario anual de tabla del convenio de sanidad privada de esa zona.

- `generar.py`: genera `historia.html` desde `../reel-respuesta-margen/datos/precios-primera-visita-doctoralia-2026-11.csv`.
- `salida/historia-precio-primera-visita.png`: imagen final, con el boletín oficial de cada convenio bajo su importe y la ruta de Doctoralia consultada al pie.

## Método

- Fuente: primera página de resultados de «Primera visita fisioterapia» en Doctoralia para cada ciudad, consultada el 18/11/2026. Se cuenta un precio por ficha; «desde X €» cuenta como X; se excluyen fichas sin precio o gratuitas.
- Solo ciudades con al menos 10 precios. Fuera por falta de muestra: Oviedo (4), Pamplona (5), Santander (2), Salamanca (3), Burgos (2), Córdoba (1), Jaén (6), Huelva (8), Almería (2) y León (0). Alicante no tiene página propia.
- Limitaciones: es precio de primera visita, no de sesión de seguimiento; solo incluye a quien publica precio en la plataforma; el orden de resultados lo decide Doctoralia. Es orientativo, no una estadística.
- No se usaron guías comerciales de precios por ciudad: no publican metodología, y una de ellas (costeya.com) da en 52 ciudades rangos en los que el máximo es casi exactamente tres veces el mínimo, lo que apunta a cifras calculadas y no observadas.
