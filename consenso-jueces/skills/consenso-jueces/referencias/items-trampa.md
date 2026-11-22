# Catálogo de ítems trampa

Los ítems trampa son ítems redactados con un defecto conocido que se mezclan con los ítems reales. Sirven para medir qué defectos detecta cada juez antes de fiarse de lo que dice sobre los ítems reales. Los jueces no saben que existen.

## Reglas de redacción

1. Cada ítem trampa tiene **un solo defecto**. Si tiene dos, no se sabe cuál ha detectado el juez.
2. Debe parecer un ítem real: mismo estilo, misma persona gramatical, longitud parecida y mismo tema que los ítems de la dimensión en la que se coloca.
3. El defecto debe ser plausible, el tipo de error que comete un investigador real. Una trampa exagerada la detecta cualquiera y no informa de nada.
4. Se colocan en una dimensión concreta del instrumento, que es la etiqueta que verán los jueces.
5. El criterio objetivo debe estar entre los criterios activos del estudio.
6. Cantidad orientativa: en torno al 10 % del número de ítems reales, con un mínimo de 4 y un máximo de 10.
7. Hay que repartir los tipos de defecto. Al menos una trampa por cada criterio de ítem activo.

## Tipos de defecto

| Tipo | Ejemplo de defecto | Criterio objetivo |
|---|---|---|
| `doble` | Pregunta por dos cosas a la vez ("Me siento cansado y triste") | `claridad` |
| `doble_negacion` | "No es raro que no consiga dormir" | `claridad` |
| `cuantificador_vago` | "A veces me ocurre bastante" | `claridad` |
| `tecnicismo` | Término técnico que la población no conoce ("rumiación", "anhedonia") | `claridad` o `adecuacion_poblacion` |
| `dimension_equivocada` | Ítem bien redactado de otra dimensión, colocado con la etiqueta de esta | `coherencia` |
| `fuera_constructo` | Ítem bien redactado que no pertenece al constructo | `relevancia` |
| `redundante` | Paráfrasis casi literal de un ítem real de la misma dimensión | `relevancia` |
| `deseabilidad` | La respuesta socialmente deseable es evidente ("Trato a los demás con respeto") | `deseabilidad_social` |
| `marco_temporal` | Enunciado incompatible con las opciones o con el periodo de referencia | `formato_respuesta` |
| `sesgo_cultural` | Situación o referencia que solo comparte una parte de la población | `adecuacion_poblacion` |

## Formato de `trampas.csv`

```csv
id,dimension,texto,tipo,criterio_objetivo,justificacion
T01,D1,"Me siento cansado y sin ganas de ver a nadie",doble,claridad,"Combina fatiga y retirada social"
T02,D2,"Suelo pensar mucho en mis errores",dimension_equivocada,coherencia,"Pertenece a D3, rumiación"
```

Un juez **detecta** una trampa cuando puntúa con 1 o 2 su criterio objetivo.
