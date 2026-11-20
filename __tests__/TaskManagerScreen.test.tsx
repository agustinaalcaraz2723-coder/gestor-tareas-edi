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
});
