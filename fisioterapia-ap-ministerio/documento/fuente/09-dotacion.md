# 9. Dotación calculada por demanda, por fases y con ajuste territorial

Esta sección calcula cuántos fisioterapeutas de AP necesita el SNS a partir de la demanda que atienden. Las ratios no se fijan de antemano: salen de un modelo con parámetros explícitos, cada uno con su fuente o con su rango de supuesto. El resultado se presenta como un intervalo y como una secuencia de fases con horizonte temporal.

> **Advertencia metodológica.** Las estadísticas internacionales de densidad cuentan fisioterapeutas de todo el sistema, no de atención primaria, y no sirven para fijar una ratio de AP. El modelo de esta sección combina datos publicados con supuestos declarados. El resultado central depende sobre todo de pocos parámetros, que la tabla 9.3 identifica. Cada servicio de salud debe sustituir los supuestos por sus propios datos cuando disponga de ellos.

## 9.1. Punto de partida

El SNS contaba en 2024 con 2.418 fisioterapeutas de AP, según el informe monográfico de recursos humanos [@B1]. La dotación por comunidad autónoma variaba más de diez veces entre los extremos que recogió el editorial de 2022 (tabla 3.1). El punto de partida no es, por tanto, un valor único, sino una distribución muy desigual.

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

Los tres parámetros con más influencia son {{M_SENS_TOP}} (tabla 9.3). Ninguno de los tres tiene hoy un dato español publicado. Por eso la primera tarea del grupo de trabajo debe ser medirlos con los registros de actividad de las comunidades que ya tienen consulta de fisioterapia en AP.

## 9.3. Escenarios como fases

Los tres escenarios del borrador de trabajo se transforman en fases con un horizonte temporal [@G0]. Las cifras de cada fase salen del modelo y no se fijan de antemano.

Tabla 9.4. Fases de dotación

| Fase | Horizonte | Objetivo de dotación | Contenido asistencial |
|---|---|---|---|
| Fase 1. Implantación | Años primero y segundo | Ninguna comunidad autónoma por debajo del escenario bajo: 1 fisioterapeuta por cada {{M_BAJO_HAB_R}} habitantes | Consulta propia en todas las zonas básicas, derivación desde medicina de familia y enfermería, y programas de caídas y de espalda |
| Fase 2. Consolidación | Años tercero a quinto | Escenario central: 1 fisioterapeuta por cada {{M_CENTRAL_HAB_R}} habitantes | Acceso directo protocolizado, todos los programas del anexo A y atención domiciliaria |
| Fase 3. Necesidad especial | Desde el tercer año, en paralelo | Ajuste territorial con el modelo: hasta 1 fisioterapeuta por cada {{M_T4_HAB_R}} habitantes en zonas rurales, envejecidas y con alta dependencia | Refuerzo de la atención domiciliaria y de los programas de fragilidad |

Fuente: elaboración propia a partir de las tablas 9.2 y 9.5. Los horizontes son una propuesta de calendario. Las cifras de dotación se redondean a la centena.

El escenario central del modelo coincide con la ratio de 1 fisioterapeuta por cada 7.500 habitantes que proponía el borrador de trabajo [@G0]. El borrador proponía además un mínimo de 1 por cada 15.000 habitantes y un máximo de 1 por cada 3.000 en zonas de alta necesidad [@G0]. Frente al borrador, el modelo propone un mínimo de fase 1 menos exigente y un máximo por ajuste territorial también menos exigente (tabla 9.4). El mínimo de la fase 1 se aplica a cada comunidad autónoma por separado y no es una media nacional. Con estas diferencias, la propuesta final se apoya en un cálculo y no solo en la comparación con otros sistemas.

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

La Chartered Society of Physiotherapy pidió en 2022 aumentar la dotación de fisioterapeutas de primer contacto en Inglaterra hasta 1 por cada 10.000 habitantes [@D7]. Esa cifra es una reivindicación profesional y no una norma del NHS [@D7]. Se refiere además solo al perfil de primer contacto, de modo que no incluye la atención domiciliaria ni los programas grupales. El borrador de trabajo atribuía unas ratios a una resolución del Consejo General de Colegios de Fisioterapeutas de 2007, que la búsqueda no ha localizado (anexo F). Este documento no usa esas ratios.
