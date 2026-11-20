# Informe de incidencias · Gestor de tareas

**Estudiante:** Agustina Alcaraz

**Fecha:** 19 de noviembre de 2026

**Proyecto / rama Git:** gestor-tareas-edi / main

**Entorno (Expo SDK, Android, dispositivo):** Expo SDK 57, Jest 29; verificación automatizada en Windows. La prueba manual en dispositivo queda pendiente porque el proyecto no incluye `react-native-web` y no había un dispositivo Expo disponible.

## Resumen ejecutivo
Se investigaron y corrigieron cuatro defectos del gestor: actualización visual del estado, finalización de la carga ante un error, normalización de la búsqueda y validación de títulos. La línea base tuvo 6 de 9 pruebas aprobadas.

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
- **Título de incidencia:** La búsqueda no ignora mayúsculas ni espacios externos y no actualiza los resultados mientras se escribe.
- **Pasos para reproducir:** Cargar las tareas y buscar `VALIDAR`, `  login  ` y `login`. Observar el listado después de cada cambio y repetir con los filtros `Pendientes` y `Completadas`.
- **Esperado / observado:** Se esperaba encontrar `Validar login` sin importar las mayúsculas o los espacios externos y actualizar la lista con cada cambio. Antes de la corrección las dos consultas normalizadas devolvían 0 resultados y el tablero conservaba tareas que no coincidían con `login`.
- **Herramienta usada (DevTools / consola / test):** Jest e inspector de consultas de React Native Testing Library.
- **Hipótesis y evidencia:** La comparación usaba `includes` con los valores originales y `useMemo` no dependía de `query`. Fallaron las dos pruebas unitarias y el inspector todavía encontró `Corregir navegación` tras escribir `login`. Evidencia: [incidencia 3](evidencias/incidencia-3-busqueda.md).
- **Archivo y función involucrada:** `src/utils/taskFilters.ts`, función `filterTasks`; `app/index.tsx`, cálculo `visibleTasks`.
- **Causa raíz:** Ni la consulta ni el título se normalizaban, y el valor memorizado solo se recalculaba cuando cambiaban `tasks` o `status`.
- **Corrección aplicada:** Se aplicaron `trim` y conversión a minúsculas a la consulta, se normalizó el título antes de compararlo y se agregó `query` a las dependencias de `useMemo`.
- **Prueba de regresión:** Las 4 pruebas de `taskFilters` y las 3 pruebas de pantalla pasaron. Incluyen mayúsculas, espacios, filtros por estado y actualización mientras se escribe.
- **Estado:** Corregido. Verificación manual en dispositivo pendiente.

## Incidencia 4
- **Título de incidencia:** El formulario acepta un título compuesto solo por espacios.
- **Pasos para reproducir:** Cargar las tareas, ingresar tres espacios en `NUEVA TAREA`, presionar `Agregar` y observar el mensaje y la cantidad de tarjetas.
- **Esperado / observado:** Se esperaba el mensaje `Ingresá un nombre válido para continuar.` y conservar 5 tareas. Antes de la corrección apareció `Tarea agregada.` y el inspector mostró 6 tareas, incluida una tarjeta sin texto visible.
- **Herramienta usada (DevTools / consola / test):** Jest e inspector de React Native Testing Library.
- **Hipótesis y evidencia:** La función solo comprobaba la longitud original. Tres espacios tenían longitud 3 y se consideraban válidos. La prueba unitaria recibió `true` y la prueba de pantalla inspeccionó `TAREAS 6`. Evidencia: [incidencia 4](evidencias/incidencia-4-validacion.md).
- **Archivo y función involucrada:** `src/utils/taskValidation.ts`, función `isValidTaskTitle`; flujo `addTask` de `app/index.tsx` verificado sin cambios adicionales.
- **Causa raíz:** La validación no eliminaba los espacios externos antes de comprobar si había contenido.
- **Corrección aplicada:** Se aplicó `trim` antes de evaluar la longitud del título.
- **Prueba de regresión:** Las 3 pruebas de `taskValidation` y las 4 pruebas de pantalla pasaron. Se rechazaron el texto vacío y los tres espacios, se aceptó un título con palabras y el formulario mantuvo las 5 tareas ante la entrada inválida.
- **Estado:** Corregido. Verificación manual en dispositivo pendiente.

## Otras incidencias (opcional)

No se detectaron otras incidencias dentro del alcance. No se agregaron dependencias ni se modificaron el SDK o el servicio simulado.

## Pruebas
| Prueba | Antes | Después | Evidencia |
|---|---|---|---|
| Búsqueda | `VALIDAR` y `  login  ` devolvieron 0 resultados; la lista no cambió al escribir. | Las consultas se normalizan, la lista cambia al escribir y se conservan los filtros por estado. | [Pruebas de la incidencia 3](evidencias/incidencia-3-busqueda.md) |
| Validación | Tres espacios devolvieron `true` y el formulario agregó una sexta tarea sin título visible. | Tres espacios se rechazan, un título con palabras se acepta y la lista conserva 5 tareas. | [Pruebas de la incidencia 4](evidencias/incidencia-4-validacion.md) |
| Actualización de estado | El número de tarjetas completadas siguió en 2 después de marcar una tercera. | El cambio al marcar y desmarcar es inmediato y respeta los filtros. | [Prueba de la incidencia 1](evidencias/incidencia-1-actualizacion-estado.md) |
| Error de servicio | El mensaje apareció, pero `Consultando tareas…` siguió visible. | La carga termina ante el error y `Recargar datos` recupera el listado. | [Prueba y registro de la incidencia 2](evidencias/incidencia-2-error-servicio.md) |

La verificación final aprobó 13 de 13 pruebas, `npm run typecheck` y `git diff --check`. La salida completa y los pasos manuales pendientes están en [verificación final](evidencias/verificacion-final.md).

## Conclusión y control de cambios
- **Commit final (hash):** `12dadac26b1b0875a9c48b4ed0ec8a2766792269`
- **Mensaje del commit:** `fix: rechazar títulos formados solo por espacios`
- **Qué aprendí y cómo lo aplicaría a mi app final:** Los estados de React deben actualizarse sin mutaciones, los indicadores de carga deben cerrarse en todos los caminos asíncronos y los datos ingresados por una persona deben normalizarse antes de compararlos o validarlos. En una app final acompañaría cada corrección con una prueba de regresión del componente y una prueba de la función involucrada.
