# Incidencia 2: finalización de la carga ante un error

## Antes de la corrección

Comando:

```text
npx jest __tests__/TaskManagerScreen.test.tsx --runInBand -t "finaliza la carga"
```

Resultado relevante:

```text
FAIL __tests__/TaskManagerScreen.test.tsx
Expected: null
Received: elemento Text con "Consultando tareas…"
Test Suites: 1 failed, 1 total
Tests: 1 failed, 1 skipped, 2 total
```

La simulación produjo el error esperado, pero el indicador de carga siguió renderizado. El inspector de la prueba encontró el elemento `Consultando tareas…` después de que la promesa fue rechazada.

El registro contextualizado también fue inspeccionado y coincidió con:

```text
[taskService] No se cargaron las tareas
Error: HTTP 503: servidor temporalmente indisponible (simulado)
```

## Después de la corrección

```text
PASS __tests__/TaskManagerScreen.test.tsx
TaskManagerScreen
  finaliza la carga después de un error y permite recuperar el listado
Test Suites: 1 passed, 1 total
Tests: 1 passed, 1 skipped, 2 total
```

La prueba verificó que el mensaje de error aparezca, que `Consultando tareas…` desaparezca y que `Recargar datos` quite el error y vuelva a mostrar `Validar login`.
