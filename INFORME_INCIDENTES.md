# Informe de incidencias · Gestor de tareas

**Estudiante:** Agustina Alcaraz

**Fecha:** 19 de noviembre de 2026

**Proyecto / rama Git:** gestor-tareas-edi / main

**Entorno (Expo SDK, Android, dispositivo):** Expo SDK 57, Jest 29; verificación automatizada en Windows. La prueba manual en dispositivo queda pendiente.

## Resumen ejecutivo
Se investigan cuatro defectos del gestor: actualización visual del estado, finalización de la carga ante un error, normalización de la búsqueda y validación de títulos. La línea base tuvo 6 de 9 pruebas aprobadas. Hasta esta etapa se corrigieron 2 de los 4 defectos.

## Incidencia 1
- **Título de incidencia:** El estado de la tarea se actualiza recién después de otro cambio de pantalla.
- **Pasos para reproducir:** Cargar las tareas, marcar `Validar login` y observar la tarjeta y la cantidad de completadas. Luego abrir los filtros `Completadas` y `Pendientes`, desmarcar la tarea y volver a revisar ambos filtros.
- **Esperado / observado:** Se esperaba que el tilde, el texto de estado, el contador y los filtros cambiaran en el mismo evento. Antes de la corrección la prueba encontró 2 tarjetas completadas después de marcar la tercera; el cambio se veía recién cuando otra interacción provocaba un render.
- **Herramienta usada (DevTools / consola / test):** Jest y el inspector de consultas de React Native Testing Library.
- **Hipótesis y evidencia:** React no renderizaba porque recibía la misma referencia del arreglo. La prueba falló con `Expected length: 3` y `Received length: 2`. Evidencia: [incidencia 1](evidencias/incidencia-1-actualizacion-estado.md).
- **Archivo y función involucrada:** `app/index.tsx`, función `toggleTask`.
- **Causa raíz:** Se modificaba directamente la propiedad `completed` de una tarea y se llamaba a `setTasks` con el mismo arreglo.
- **Corrección aplicada:** Se reemplazó la mutación por `map`, creando un arreglo nuevo y una copia de la tarea cuyo estado cambia.
- **Prueba de regresión:** `TaskManagerScreen.test.tsx` marca y desmarca `Validar login`, comprueba el cambio inmediato de estado y valida su ubicación en `Completadas` y `Pendientes`. Resultado: 1 de 1 prueba aprobada.
- **Estado:** Corregido. Verificación manual en dispositivo pendiente.

## Incidencia 2
- **Título de incidencia:** El indicador `Consultando tareas…` permanece visible después de un error del servicio.
- **Pasos para reproducir:** Cargar el listado, presionar `Simular error API`, esperar la respuesta simulada y observar el mensaje y el indicador. Después presionar `Recargar datos` y esperar una carga exitosa.
- **Esperado / observado:** Se esperaba que la carga terminara al resolverse o rechazarse la consulta. Antes de la corrección aparecía el mensaje de error, pero el indicador seguía visible y la lista permanecía oculta.
- **Herramienta usada (DevTools / consola / test):** Jest, inspector de React Native Testing Library y registro contextualizado de consola.
- **Hipótesis y evidencia:** `setLoading(false)` se ejecutaba únicamente dentro del bloque de éxito. El test encontró `Consultando tareas…` después del rechazo. El registro `[taskService] No se cargaron las tareas` confirmó el error simulado `HTTP 503`. Evidencia: [incidencia 2](evidencias/incidencia-2-error-servicio.md).
- **Archivo y función involucrada:** `app/index.tsx`, función `loadTasks`.
- **Causa raíz:** El bloque `catch` informaba el error, pero no restablecía el estado `loading`.
- **Corrección aplicada:** Se trasladó `setLoading(false)` a un bloque `finally`, compartido por los caminos de éxito y error.
- **Prueba de regresión:** `TaskManagerScreen.test.tsx` simula el error, comprueba el mensaje y el fin de la carga, inspecciona el registro contextualizado y recarga los datos hasta recuperar `Validar login`. Resultado: 1 de 1 prueba ejecutada aprobada.
- **Estado:** Corregido. Verificación manual en dispositivo pendiente.

## Incidencia 3
Copiar los mismos campos de la incidencia 1.

## Incidencia 4
Copiar los mismos campos de la incidencia 1.

## Otras incidencias (opcional)

## Pruebas
| Prueba | Antes | Después | Evidencia |
|---|---|---|---|
| Búsqueda | | | |
| Validación | | | |
| Actualización de estado | El número de tarjetas completadas siguió en 2 después de marcar una tercera. | El cambio al marcar y desmarcar es inmediato y respeta los filtros. | [Prueba de la incidencia 1](evidencias/incidencia-1-actualizacion-estado.md) |
| Error de servicio | El mensaje apareció, pero `Consultando tareas…` siguió visible. | La carga termina ante el error y `Recargar datos` recupera el listado. | [Prueba y registro de la incidencia 2](evidencias/incidencia-2-error-servicio.md) |

## Conclusión y control de cambios
- **Commit final (hash):**
- **Mensaje del commit:**
- **Qué aprendí y cómo lo aplicaría a mi app final:**
