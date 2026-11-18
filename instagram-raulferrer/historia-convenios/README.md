# @_raulferrer · Historias: convenios de sanidad privada

Serie de tres historias (1080 × 1920) con la retribución anual de tabla de un fisioterapeuta sin antigüedad en 24 convenios de sanidad privada, comparada con Madrid.

1. Los 12 convenios con mayor retribución estimada para 2026.
2. Los 12 siguientes, con Madrid como referencia.
3. Método: qué se compara, tablas caducadas actualizadas con IPC y convenios sin tabla comparable.

- `generar.py`: genera `historia.html` desde `../reel-respuesta-margen/datos/convenios-sanidad-privada-2026.csv`.
- `salida/historia-convenios-{1,2,3}-de-3.png`: imágenes finales.

## Tablas caducadas

Las tablas prorrogadas sin subida (de 2015, 2018, 2022 y 2025) llevan el símbolo ⟳, su año y su importe original, y se comparan con una estimación actualizada a 2026 con el IPC interanual de diciembre (INE) de cada año entre el de la tabla y 2025: 2015 0,0 %; 2016 1,6 %; 2017 1,1 %; 2018 1,2 %; 2019 0,8 %; 2020 −0,5 % (se cuenta como 0 %); 2021 6,5 %; 2022 5,7 %; 2023 3,1 %; 2024 2,8 %; 2025 2,9 %. Es una estimación de lo que cobrarían si se actualizasen, no lo que cobran hoy.

## Verificación

Madrid, Aragón y Asturias se leyeron en el boletín o en el convenio; Jaén, en la tabla del BOP citada literalmente. El resto procede de webs de convenios que citan el boletín oficial (columna `verificacion` del CSV). En Burgos, Valladolid, Córdoba y León el grupo del fisioterapeuta se ha deducido de la descripción de los grupos.

Sin tabla comparable: Málaga, Murcia, Pontevedra, Las Palmas, Tenerife, Navarra, La Rioja, Castilla-La Mancha, Extremadura y País Vasco.
