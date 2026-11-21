# Instrucciones para trabajar en este proyecto

Proyecto: informe técnico para solicitar al Ministerio de Sanidad la creación de la especialidad en Ciencias de la Salud de **Fisioterapia Familiar y Comunitaria (FFyC)**. Solicitante: Consejo General de Colegios de Fisioterapeutas de España.

## Antes de escribir nada

1. Lee `ARRANQUE.md`: estado, decisiones cerradas y orden de redacción.
2. La especificación vinculante es `SPEC.md`. Si una petición contradice la spec, dilo antes de redactar.
3. Consulta `seguimiento/decisiones.md` antes de reabrir cualquier decisión.

## Reglas de contenido

- Cada capítulo responde a descriptores concretos del anexo I del RD 589/2022. Al terminar un capítulo, actualiza `informe/anexos/A-matriz-rd589.md`.
- Las competencias se ciñen al ámbito del fisioterapeuta: Ley 44/2003, art. 7.2.b), y Orden CIN/2135/2008. Nunca incluyas diagnóstico médico, indicación de medicamentos ni solicitud de pruebas de laboratorio, anatomía patológica o imagen. Ver `referencias/cruce-competencias-grado-fisioterapia.md`, apartado 6.
- Cada competencia específica del capítulo 7 se etiqueta como **exclusiva** o **compartida** frente a los programas de MFyC y EFyC. Las exclusivas deben ser al menos el 50 % (criterio 4.1).
- Las estancias en servicios de otras especialidades suman menos de 7 meses (criterio 5.4).
- Toda cifra lleva fuente y año. Si falta un dato, escribe `[DATO PENDIENTE: qué, fuente prevista]` y regístralo en `seguimiento/datos-necesarios.md`. No inventes cifras ni referencias.
- Toda cita normativa se comprueba contra los PDF de `referencias/normativa/`. Si la norma no está ahí, márcala `[VERIFICAR BOE]`.

## Reglas de estilo

- Capítulos 7 y 8 y anexo B: registro normativo del BOE, con la numeración del anexo I de la Orden PJC/798/2024.
- Resto: español formal administrativo, impersonal, sin tono reivindicativo ni corporativista.
- Frases subordinadas entre comas, nunca entre guiones.
- Lenguaje inclusivo con el criterio de la Orden PJC/798/2024 («la persona residente», «tutoras/es»).
- Terminología fija: FFyC, FIR, UDMAFyC, POE, GIFT, PIF, «valoración diagnóstica de cuidados de fisioterapia», «plan de intervención de fisioterapia».
- Los documentos del informe no llevan etiquetas de confianza ni notas para el equipo fuera de los marcadores `[DATO PENDIENTE]` y `[VERIFICAR BOE]`.

## Flujo de trabajo

- Un capítulo por sesión o por bloque de trabajo. Al terminarlo: actualiza la matriz del anexo A, `seguimiento/pendientes.md` y el estado del capítulo en `ARRANQUE.md`.
- Los cambios de la spec suben de versión en `SPEC.md`, con su línea en el registro de cambios.
