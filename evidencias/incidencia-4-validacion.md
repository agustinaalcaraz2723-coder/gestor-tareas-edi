# Incidencia 4: validación de títulos con espacios

## Antes de la corrección

Comando:

```text
npx jest __tests__/taskValidation.test.ts __tests__/TaskManagerScreen.test.tsx --runInBand -t "espacios"
```

Resultados relevantes:

```text
FAIL __tests__/taskValidation.test.ts
isValidTaskTitle > rechaza un título compuesto solo de espacios
Expected: false
Received: true

FAIL __tests__/TaskManagerScreen.test.tsx
TaskManagerScreen > rechaza una tarea cuyo título contiene solo espacios
Unable to find: Ingresá un nombre válido para continuar.
Estado inspeccionado: TAREAS 6 y Tarea agregada.

Test Suites: 2 failed, 2 total
Tests: 2 failed, 5 skipped, 7 total
```

La inspección de la pantalla confirmó que el formulario agregó una sexta tarjeta con un título de tres espacios.

## Después de la corrección

Comando:

```text
npx jest __tests__/taskValidation.test.ts __tests__/TaskManagerScreen.test.tsx --runInBand
```

Resultado:

```text
PASS __tests__/TaskManagerScreen.test.tsx
PASS __tests__/taskValidation.test.ts
Test Suites: 2 passed, 2 total
Tests: 7 passed, 7 total
```

La prueba unitaria rechazó el título de tres espacios y aceptó `  Preparar la entrega  `. La prueba de pantalla mantuvo las 5 tareas y mostró `Ingresá un nombre válido para continuar.`.
