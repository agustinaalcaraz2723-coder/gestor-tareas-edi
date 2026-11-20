# Incidencia 1: actualización de estado

## Antes de la corrección

Comando:

```text
npx jest __tests__/TaskManagerScreen.test.tsx --runInBand
```

Resultado relevante:

```text
FAIL __tests__/TaskManagerScreen.test.tsx
Expected length: 3
Received length: 2
TaskManagerScreen > actualiza una tarea al marcarla y desmarcarla y respeta los filtros
Test Suites: 1 failed, 1 total
Tests: 1 failed, 1 total
```

La prueba marcó `Validar login` y la cantidad de tarjetas con estado `Completada` permaneció en 2. El estado interno se había mutado, pero React no recibió una referencia nueva para renderizar el cambio.

## Después de la corrección

```text
PASS __tests__/TaskManagerScreen.test.tsx
TaskManagerScreen
  actualiza una tarea al marcarla y desmarcarla y respeta los filtros
Test Suites: 1 passed, 1 total
Tests: 1 passed, 1 total
```

La misma prueba comprobó el cambio inmediato al marcar y desmarcar, el contador derivado del estado y la presencia de la tarea en los filtros `Completadas` y `Pendientes`.
