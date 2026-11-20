# Verificación final

## Suite completa

Comando:

```text
npm test
```

Resultado:

```text
PASS __tests__/TaskCard.test.tsx
PASS __tests__/TaskManagerScreen.test.tsx
PASS __tests__/taskFilters.test.ts
PASS __tests__/taskValidation.test.ts
Test Suites: 4 passed, 4 total
Tests: 13 passed, 13 total
Snapshots: 0 total
```

## TypeScript

Comando:

```text
npm run typecheck
```

Resultado: `tsc --noEmit` finalizó sin errores.

## Diff

Comando:

```text
git diff --check
```

Resultado: finalizó sin errores ni salida.

## Prueba manual pendiente

El proyecto no incluye `react-native-web` y no había un dispositivo Expo disponible en el entorno de verificación. No se agregaron dependencias porque no son necesarias para las correcciones.

Pasos pendientes en un dispositivo o tablero Expo disponible:

1. Marcar y desmarcar `Validar login`; comprobar el tilde, los contadores y los filtros `Pendientes` y `Completadas`.
2. Presionar `Simular error API`; comprobar el mensaje y que termine la carga. Presionar `Recargar datos` y comprobar que reaparezca el listado.
3. Escribir `VALIDAR` y `  login  `; comprobar que la lista cambie mientras se escribe.
4. Intentar agregar un título de tres espacios; comprobar el mensaje de validación y que el total permanezca en 5.

Estos cuatro flujos sí fueron ejecutados sobre el componente de pantalla con React Native Testing Library y forman parte de las 13 pruebas aprobadas.
