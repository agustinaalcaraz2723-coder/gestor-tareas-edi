import { act, fireEvent, render } from '@testing-library/react-native';
import TaskManagerScreen from '../app/index';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

describe('TaskManagerScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  async function renderLoadedScreen() {
    const screen = render(<TaskManagerScreen />);
    await act(async () => {
      jest.advanceTimersByTime(700);
      await Promise.resolve();
    });
    return screen;
  }

  it('actualiza una tarea al marcarla y desmarcarla y respeta los filtros', async () => {
    const screen = await renderLoadedScreen();

    expect(screen.getAllByText('Completada')).toHaveLength(2);
    fireEvent.press(screen.getByTestId('toggle-t01'));
    expect(screen.getAllByText('Completada')).toHaveLength(3);

    fireEvent.press(screen.getByText('Completadas'));
    expect(screen.getByText('Validar login')).toBeTruthy();
    fireEvent.press(screen.getByTestId('toggle-t01'));
    expect(screen.queryByText('Validar login')).toBeNull();

    fireEvent.press(screen.getByText('Pendientes'));
    expect(screen.getByText('Validar login')).toBeTruthy();
  });

  it('finaliza la carga después de un error y permite recuperar el listado', async () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const screen = await renderLoadedScreen();

    fireEvent.press(screen.getByTestId('simulate-error-button'));
    expect(screen.getByText('Consultando tareas…')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(700);
      await Promise.resolve();
    });

    expect(screen.getByRole('alert').props.children).toBe('No pudimos cargar las tareas. Probá otra vez.');
    expect(screen.queryByText('Consultando tareas…')).toBeNull();
    expect(errorLog).toHaveBeenCalledWith(
      '[taskService] No se cargaron las tareas',
      expect.objectContaining({ message: 'HTTP 503: servidor temporalmente indisponible (simulado)' }),
    );

    fireEvent.press(screen.getByText('↻ Recargar datos'));
    await act(async () => {
      jest.advanceTimersByTime(700);
      await Promise.resolve();
    });

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText('Consultando tareas…')).toBeNull();
    expect(screen.getByText('Validar login')).toBeTruthy();
  });
});
