import { fireEvent, render } from '@testing-library/react-native';
import { TaskCard } from '../src/components/TaskCard';

describe('TaskCard', () => {
  it('permite completar una tarea', async () => {
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    const { getByTestId } = await render(
      <TaskCard
        task={{ id: 1, title: 'Probar navegación', description: 'Abrir un detalle.', createdAt: '2026-11-25T00:00:00Z', completed: false }}
        onToggle={onToggle}
        onDelete={onDelete}
      />,
    );
    await fireEvent.press(getByTestId('toggle-1'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
  it('muestra el detalle al expandir una tarjeta', async () => {
    const { getByTestId } = await render(
      <TaskCard
        task={{ id: 2, title: 'Auditar tareas', description: 'Revisar evidencia.', createdAt: '2026-11-25T00:00:00Z', completed: false }}
        onToggle={() => undefined}
        onDelete={() => undefined}
      />,
    );
    await fireEvent.press(getByTestId('expand-2'));
    expect(getByTestId('details-2')).toBeTruthy();
  });
});
