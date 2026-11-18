# @_raulferrer · Historia: convenios de sanidad privada

Imagen de historia (1080 × 1920) con la retribución anual de tabla que se aplica en 2026 a un fisioterapeuta sin antigüedad en 24 convenios de sanidad privada, ordenados de mayor a menor y comparados con Madrid. Las tablas que no se han actualizado (prorrogadas de 2015, 2018, 2022 o 2025) llevan el año marcado en naranja.

- `generar.py`: genera `historia.html` a partir de `../reel-respuesta-margen/datos/convenios-sanidad-privada-2026.csv`.
- `salida/historia-convenios-2026.png`: imagen final.

Regenerar: `python3 generar.py` y captura de `#historia` con Playwright.

Verificación: Madrid, Aragón y Asturias se leyeron en el boletín o en el convenio; Jaén, en la tabla del BOP citada literalmente. El resto procede de webs de convenios que citan el boletín oficial (columna `verificacion` del CSV). En Burgos, Valladolid, Córdoba y León el grupo del fisioterapeuta se ha deducido de la descripción de los grupos.

Sin tabla comparable: Málaga (tabla no publicada en la fuente), Murcia y Pontevedra (sin categoría de fisioterapeuta), Las Palmas (estructura de salario garantizado no comparable), Tenerife, Navarra, La Rioja, Castilla-La Mancha y Extremadura (no localizados o solo convenio de ambulancias) y País Vasco (sin convenio sectorial).
