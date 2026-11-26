import { act, fireEvent, render } from '@testing-library/react-native';
import TaskManagerScreen from '../app/index';
import { tasksService } from '../src/services/taskService';

jest.setTimeout(30000);

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../src/services/taskService', () => ({
  ...jest.requireActual('../src/services/taskService'),
  tasksService: { list: jest.fn(), create: jest.fn(), setCompleted: jest.fn(), remove: jest.fn() },
}));

const task = {
  id: 1, title: 'Revisar entrega', description: '', createdAt: '2026-11-25T12:00:00Z', completed: false,
};
const list = jest.mocked(tasksService.list);
const create = jest.mocked(tasksService.create);
const setCompleted = jest.mocked(tasksService.setCompleted);
const remove = jest.mocked(tasksService.remove);

describe('TaskManagerScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    list.mockResolvedValue([task]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  async function renderLoadedScreen() {
    const screen = await render(<TaskManagerScreen />);
    await act(async () => {
      jest.advanceTimersByTime(275);
    });
    return screen;
  }

  it('completa la tarea con el servidor y actualiza las tarjetas', async () => {
    const screen = await renderLoadedScreen();
    const completed = { ...task, completed: true };
    setCompleted.mockResolvedValueOnce(completed);
    list.mockResolvedValueOnce([completed]);

    await fireEvent.press(screen.getByTestId('toggle-1'));

    expect(setCompleted).toHaveBeenCalledWith(1, true);
    expect(screen.getByText('Completada')).toBeTruthy();
  });

  it('finaliza la carga después de un error y permite recuperar el listado', async () => {
    list.mockRejectedValueOnce(new Error('HTTP 503'));
    const screen = await renderLoadedScreen();
    const message = 'No pudimos cargar las tareas. Revisá la conexión e intentá otra vez.';
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.queryByText('Consultando tareas')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(screen.queryByText(message)).toBeNull();
    expect(screen.getByText(task.title)).toBeTruthy();
  });

  it('envía al servidor la última búsqueda y el filtro seleccionado', async () => {
    const screen = await renderLoadedScreen();
    await fireEvent.changeText(screen.getByTestId('search-input'), 're');
    await fireEvent.changeText(screen.getByTestId('search-input'), 'Revisar');
    expect(list).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(275);
    });

    expect(list).toHaveBeenCalledTimes(2);
    expect(list).toHaveBeenLastCalledWith({ search: 'Revisar', status: 'todas' }, expect.anything());

    await fireEvent.press(screen.getByRole('button', { name: 'Pendientes' }));
    expect(list).toHaveBeenCalledTimes(3);
    expect(list).toHaveBeenLastCalledWith({ search: 'Revisar', status: 'pendientes' }, expect.anything());
  });

  it('rechaza un título compuesto solo por espacios', async () => {
    const screen = await renderLoadedScreen();
    await fireEvent.changeText(screen.getByTestId('new-task-input'), '   ');
    await fireEvent.press(screen.getByTestId('add-task-button'));
    expect(screen.getByText('Ingresá un título de 1 a 200 bytes.')).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });

  it('envía únicamente el título al crear una tarea', async () => {
    const screen = await renderLoadedScreen();
    create.mockResolvedValueOnce(task);
    await fireEvent.changeText(screen.getByTestId('new-task-input'), ' Revisar entrega ');
    await fireEvent.press(screen.getByTestId('add-task-button'));
    expect(create).toHaveBeenCalledWith({ title: task.title });
    expect(screen.getByText('Tarea agregada.')).toBeTruthy();
  });

  it('elimina la tarjeta después de la respuesta exitosa', async () => {
    const screen = await renderLoadedScreen();
    remove.mockResolvedValueOnce(undefined);
    list.mockResolvedValueOnce([]);
    await fireEvent.press(screen.getByTestId('expand-1'));
    await fireEvent.press(screen.getByText('Eliminar tarea'));
    expect(remove).toHaveBeenCalledWith(1);
    expect(screen.queryByText(task.title)).toBeNull();
  });
});
