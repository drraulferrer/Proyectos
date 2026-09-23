# 9. Dotación calculada por demanda, por fases y con ajuste territorial

Esta sección calcula cuántos fisioterapeutas de AP necesita el SNS a partir de la demanda que atienden. Las ratios no se fijan de antemano: salen de un modelo con parámetros explícitos, cada uno con su fuente o con su rango de supuesto. El resultado se presenta como un intervalo y como una secuencia de fases con horizonte temporal.

> **Advertencia metodológica.** Las estadísticas internacionales de densidad cuentan fisioterapeutas de todo el sistema, no de atención primaria, y no sirven para fijar una ratio de AP. El modelo de esta sección combina datos publicados con supuestos declarados. El resultado central depende sobre todo de pocos parámetros, que la tabla 9.3 identifica. Cada servicio de salud debe sustituir los supuestos por sus propios datos cuando disponga de ellos.

## 9.1. Punto de partida

El SNS contaba en 2024 con 2.418 fisioterapeutas de AP, según el informe monográfico de recursos humanos [@B1]. La dotación por comunidad autónoma variaba más de diez veces entre los extremos que recogió el editorial de 2022 (tabla 3.1). El punto de partida no es, por tanto, un valor único, sino una distribución muy desigual.

Los datos autonómicos de actividad pueden afinar ese punto de partida. La Comunidad de Madrid informó de que sus unidades de fisioterapia de AP atendieron a cerca de 159.000 personas en 2024 [@C14n]. A 30 de abril de 2024, las plantillas orgánicas del Servicio Madrileño de Salud tenían 947 plazas de fisioterapeuta [@C14p]. De ellas, 691 estaban en atención hospitalaria y 256 en AP [@C14p]. El informe de PwC para el colegio profesional madrileño estimó unos 218 fisioterapeutas en la AP de Madrid en 2021, a partir de una encuesta a las personas colegiadas [@G11]. En 2025, más de 50 fisioterapeutas de AP completaron una formación de la Gerencia Asistencial en dolor musculoesquelético [@C14f]. Según la Gerencia, suponían alrededor del 20 % de los que están en activo en AP [@C14f]. El SIAP permite sustituir estas estimaciones por la plantilla oficial de cada comunidad autónoma [@B1b].

## 9.2. Modelo de demanda

El modelo estima la carga anual de trabajo de fisioterapia por cada 10.000 habitantes. La carga tiene tres componentes:

- **Consulta individual.** Es el producto de las personas que consultan en AP por un problema musculoesquelético (P), la fracción que accede a fisioterapia (F1) y las consultas por persona. Cada persona tiene una primera consulta, y una fracción (F2) necesita además V consultas de seguimiento. Cada consulta dura t horas.
- **Programas grupales y comunitarios.** Es la suma, para cada programa del anexo A, de las ediciones anuales por las horas de fisioterapia de cada edición. El programa de caídas y fragilidad crece en proporción a la población de 65 años o más.
- **Atención domiciliaria.** Multiplica la población de 65 años o más (S65) por la fracción que necesita fisioterapia en el domicilio (D). El resultado se multiplica por las visitas por persona (Vd) y por las horas de cada visita (td).

La capacidad de un fisioterapeuta a tiempo completo es su jornada anual (J) menos la fracción de tiempo protegido (Tp). La dotación necesaria es la carga total dividida por esa capacidad.

Tabla 9.1. Parámetros del modelo de demanda

{{TABLA_PARAMETROS}}

Fuente: elaboración propia. Los parámetros de tipo supuesto no tienen un dato español publicado y se acompañan de su rango y de su justificación.

Tabla 9.2. Resultado del modelo en los tres escenarios

{{TABLA_ESCENARIOS}}

Fuente: modelo de demanda de esta sección, ejecutado con los parámetros de la tabla 9.1 y las fichas del anexo A. El escenario bajo combina los valores bajos de necesidad con la mayor capacidad por profesional, y el escenario alto hace lo contrario.

El escenario central necesita 1 fisioterapeuta de AP por cada {{M_CENTRAL_HAB}} habitantes (tabla 9.2). El intervalo entre los escenarios bajo y alto va de 1 por cada {{M_BAJO_HAB}} a 1 por cada {{M_ALTO_HAB}} habitantes (tabla 9.2). La amplitud del intervalo refleja la incertidumbre de los supuestos. Por eso el análisis de sensibilidad identifica los parámetros que más la explican.

Tabla 9.3. Análisis de sensibilidad univariante

{{TABLA_SENSIBILIDAD}}

Fuente: modelo de demanda de esta sección. Cada fila cambia un parámetro a su valor bajo o alto y mantiene el resto en el valor central. Las filas se ordenan de mayor a menor amplitud.

Los tres parámetros con más influencia son {{M_SENS_TOP}} (tabla 9.3). Ninguno de los tres tiene hoy un dato español publicado. Por eso la primera tarea del grupo de trabajo debe ser medirlos con los registros de actividad de las comunidades que ya tienen consulta de fisioterapia en AP. La instrucción madrileña facilita esa medición, porque asocia cada proceso de citación directa a sus códigos de la Clasificación Internacional de Atención Primaria [@G8]. Con esos códigos, un servicio de salud puede contar las personas que consultan por cada proceso y la fracción que llega a fisioterapia.

El número de consultas por persona tampoco tiene un valor fijo. Una revisión de ocho ensayos no encontró diferencias al año entre dos o menos visitas y tres o más en el dolor lumbar [@E99]. El modelo refleja esa incertidumbre con el rango del parámetro de consultas de seguimiento.

## 9.3. Escenarios como fases

Los tres escenarios del modelo se transforman en fases con un horizonte temporal. Las cifras de cada fase salen del modelo y no se fijan de antemano.

Tabla 9.4. Fases de dotación

| Fase | Horizonte | Objetivo de dotación | Contenido asistencial |
|---|---|---|---|
| Fase 1. Implantación | Años primero y segundo | Ninguna comunidad autónoma por debajo del escenario bajo: 1 fisioterapeuta por cada {{M_BAJO_HAB_R}} habitantes | Consulta propia en todas las zonas básicas, derivación desde medicina de familia y enfermería, y programas de caídas y de espalda |
| Fase 2. Consolidación | Años tercero a quinto | Escenario central: 1 fisioterapeuta por cada {{M_CENTRAL_HAB_R}} habitantes | Acceso directo protocolizado, todos los programas del anexo A y atención domiciliaria |
| Fase 3. Necesidad especial | Desde el tercer año, en paralelo | Ajuste territorial con el modelo: hasta 1 fisioterapeuta por cada {{M_T4_HAB_R}} habitantes en zonas rurales, envejecidas y con alta dependencia | Refuerzo de la atención domiciliaria y de los programas de fragilidad |

Fuente: elaboración propia a partir de las tablas 9.2 y 9.5. Los horizontes son una propuesta de calendario. Las cifras de dotación se redondean a la centena.

El mínimo de la fase 1 se aplica a cada comunidad autónoma por separado y no es una media nacional. De este modo, la propuesta se apoya en un cálculo y no solo en la comparación con otros sistemas.

## 9.4. Ajustes territoriales

El modelo se aplica a cada zona básica con sus propios datos. La tabla 9.5 muestra el efecto de cambiar solo los factores que admite esta sección.

Tabla 9.5. Ejemplos de ajuste territorial con el modelo

{{TABLA_AJUSTES}}

Fuente: modelo de demanda de esta sección. Los valores modificados son ilustrativos y cada servicio de salud los sustituye por los datos de la zona.

El documento admite cuatro factores de ajuste:

- **Ruralidad y dispersión.** Alargan el tiempo de cada visita domiciliaria. La respuesta puede combinar tres palancas: el refuerzo de la plantilla, un fisioterapeuta itinerante de área y las herramientas de salud digital de la sección 5.6.
- **Envejecimiento y dependencia.** Aumentan la atención domiciliaria y la oferta del programa de caídas y fragilidad.
- **Carga de incapacidad temporal musculoesquelética.** Aumenta el número de personas que consultan por estos procesos.
- **Centros docentes o con programas comunitarios extensos.** Aumentan el tiempo protegido no asistencial.

La demora en rehabilitación hospitalaria no es un factor de ajuste de la dotación de AP. Ambos son niveles asistenciales distintos, y la demora hospitalaria no debe condicionar la actividad de AP. Esa demora solo aparece como indicador del circuito de continuidad asistencial (indicador IR-11 del anexo B).

## 9.5. Referencias externas de dotación

La Chartered Society of Physiotherapy pidió en 2022 aumentar la dotación de fisioterapeutas de primer contacto en Inglaterra hasta 1 por cada 10.000 habitantes [@D7]. Esa cifra es una reivindicación profesional y no una norma del NHS [@D7]. Se refiere además solo al perfil de primer contacto, de modo que no incluye la atención domiciliaria ni los programas grupales.

## 9.6. Retorno económico esperado

Este documento no calcula un ahorro para el SNS, porque no existe ninguna evaluación económica española del modelo que propone. Sin embargo, la literatura internacional permite anticipar en qué partidas puede aparecer el retorno y cómo debe medirse.

En España, el cálculo más próximo es un informe de PwC encargado por el Colegio Profesional de Fisioterapeutas de la Comunidad de Madrid, con datos de 2021 [@G11]. Su capítulo económico cuantifica el ahorro de cuatro actuaciones: la fisioterapia respiratoria tras la cirugía del cáncer de pulmón, la rehabilitación cardiaca tras un bypass coronario, el síndrome del túnel carpiano y la EPOC grave [@G11]. La presentación del informe cifra en cerca de 568 millones de euros anuales lo que esas actuaciones podrían liberar al sistema de salud madrileño [@G11]. Esa cifra es un ahorro potencial y no un ahorro medido. Se obtuvo aplicando a los pacientes estimados en Madrid los efectos de estudios publicados, y tres de las cuatro actuaciones corresponden a la atención hospitalaria [@G11]. Por eso este documento la cita como orden de magnitud y no como resultado esperable del modelo de AP.

La primera partida son los costes indirectos. En el dolor lumbar, los costes indirectos supusieron el 88 % del coste total en los Países Bajos [@E50]. Una revisión de evaluaciones económicas concluyó que la atención del médico general por sí sola no parece la opción más coste-efectiva en el dolor lumbar [@E52]. Añadir consejo, educación y ejercicio a esa atención resultó más coste-efectivo que la atención médica habitual sola [@E52]. Otra revisión encontró que el ejercicio, la rehabilitación interdisciplinar, la manipulación vertebral y la terapia cognitivo-conductual suelen ser coste-efectivos en el dolor lumbar subagudo o persistente [@E53].

La segunda partida es el uso posterior de servicios. En el estudio de Fritz y colaboradores, la fisioterapia precoz se asoció a un coste médico 2.736 dólares menor por persona con dolor lumbar [@E90]. En el ensayo FRONTIER, el coste mediano para el NHS fue de 41,0 y 44,0 libras en los grupos de fisioterapia, frente a 105,5 libras en el grupo médico [@E13; @E13b]. En Suecia, la valoración inicial por fisioterapia resultó más coste-efectiva que la valoración inicial por el médico general [@E29b].

La tercera partida es la elección del tratamiento. En el dolor cervical, un ensayo neerlandés en AP comparó terapia manual, fisioterapia basada en ejercicio y atención por el médico general [@E55]. El coste total de la terapia manual, 447 euros por persona, fue alrededor de un tercio del coste de las otras dos opciones, de 1.297 y 1.379 euros [@E55]. En cambio, la fisioterapia basada en ejercicio no fue más barata que la atención médica en ese ensayo [@E55]. Una revisión posterior advierte que el número de evaluaciones económicas en dolor cervical no permite conclusiones firmes [@E57].

Tabla 9.6. Evidencia económica internacional aplicable al modelo

| Partida | Estudio | Resultado | Límite para el SNS |
|---|---|---|---|
| Costes indirectos | Lambeek y colaboradores [@E50] | Los costes indirectos suponen el 88 % del coste del dolor lumbar | Estudio de coste de la enfermedad, sin evaluar la fisioterapia |
| Atención médica frente a atención con ejercicio | Lin y colaboradores [@E52; @E53] | Añadir educación y ejercicio es más coste-efectivo que la atención médica sola | Evaluaciones de sistemas con precios distintos |
| Momento del acceso | Fritz y colaboradores [@E90] | Coste médico menor con la fisioterapia en los primeros 14 días | Estudio observacional en aseguradoras de Estados Unidos |
| Primer contacto en AP | FRONTIER [@E13; @E13b] | Coste mediano para el NHS menor en los grupos de fisioterapia | Sistema público con estructura distinta de la española |
| Primera valoración en el centro de salud | Bornhöft y colaboradores [@E29b] | Manejo más coste-efectivo con la valoración inicial por fisioterapia | Triaje dentro del centro, no acceso directo |
| Tratamiento del dolor cervical | Korthals-de Bos y colaboradores [@E55] | La terapia manual costó un tercio que la fisioterapia basada en ejercicio o la atención médica | Un solo ensayo, con evidencia global insuficiente [@E57] |
| Triaje en la interfaz hospitalaria | Trøstrup y colaboradores [@E107] | Ahorro del 27 % al 49 % en la valoración diagnóstica | Fuera del alcance de esta propuesta |
| Cuatro actuaciones de fisioterapia en Madrid | Informe de PwC para el CPFCM [@G11] | Ahorro potencial cercano a 568 millones de euros anuales para el sistema de salud madrileño | Estimación por extrapolación, con tres actuaciones hospitalarias |

Fuente: elaboración propia a partir de los resúmenes de PubMed de los estudios citados y del informe de PwC para el CPFCM.

Por todo ello, el retorno económico debe medirse y no suponerse. Los indicadores IR-5, IR-6 e IR-7 del anexo B miden las tres partidas descritas: pruebas y derivaciones, incapacidad temporal y medicación. El diseño de evaluación de la sección 11.4 permite atribuir sus cambios al modelo.