# Incidencia 3: normalización y actualización de la búsqueda

## Antes de la corrección

Comando:

```text
npx jest __tests__/taskFilters.test.ts __tests__/TaskManagerScreen.test.tsx --runInBand -t "busca|ignora|actualiza los resultados"
```

Resultados relevantes:

```text
FAIL __tests__/taskFilters.test.ts
filterTasks > busca sin distinguir entre minúsculas y mayúsculas
Expected length: 1
Received length: 0

filterTasks > ignora espacios antes y después de la búsqueda
Expected length: 1
Received length: 0

FAIL __tests__/TaskManagerScreen.test.tsx
TaskManagerScreen > actualiza los resultados mientras cambia la búsqueda
Expected: null
Received: elemento Text con "Corregir navegación"

Test Suites: 2 failed, 2 total
Tests: 3 failed, 4 skipped, 7 total
```

`VALIDAR` y `  login  ` no encontraron `Validar login`. Además, al escribir `login`, el inspector de la pantalla todavía encontró `Corregir navegación`, lo que confirmó que la lista memorizada no se recalculaba con cada cambio de consulta.

## Después de la corrección

Comando:

```text
npx jest __tests__/taskFilters.test.ts __tests__/TaskManagerScreen.test.tsx --runInBand
```

Resultado:

```text
PASS __tests__/TaskManagerScreen.test.tsx
PASS __tests__/taskFilters.test.ts
Test Suites: 2 passed, 2 total
Tests: 7 passed, 7 total
```

Se comprobaron las búsquedas sin distinción de mayúsculas, con espacios externos y la actualización mientras se escribe. También pasaron los filtros `Pendientes` y `Completadas`.
