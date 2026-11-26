import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TaskCard } from '../src/components/TaskCard';
import { StatusTabs } from '../src/components/StatusTabs';
import { ApiError, tasksService } from '../src/services/taskService';
import type { Task, TaskFilters, TaskStatus } from '../src/types/task';
import { getTaskTitleError } from '../src/utils/taskValidation';

function getOperationError(caught: unknown): string {
  if (caught instanceof ApiError) {
    if (caught.status === 404) {
      return 'La tarea ya no existe. Se actualizará la lista.';
    }

    return caught.message;
  }

  return 'No se pudo completar la operación. Revisá la conexión e intentá otra vez.';
}

export default function TaskManagerScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todas');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const filters = useRef<TaskFilters>({ status: 'todas' });
  const requestSequence = useRef(0);
  const activeController = useRef<AbortController | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeScreen = useRef(false);
  const creating = useRef(false);
  const activeMutations = useRef(new Set<number>());

  const loadTasks = useCallback(async (nextFilters: TaskFilters, controller: AbortController) => {
    const currentRequest = ++requestSequence.current;
    activeController.current = controller;
    setLoading(true);
    setError(null);

    try {
      const records = await tasksService.list(nextFilters, controller.signal);

      if (!controller.signal.aborted && currentRequest === requestSequence.current) {
        setTasks(records);
      }
    } catch {
      if (controller.signal.aborted) {
        return;
      }

      if (currentRequest === requestSequence.current) {
        setError('No pudimos cargar las tareas. Revisá la conexión e intentá otra vez.');
      }
    } finally {
      if (currentRequest === requestSequence.current) {
        setLoading(false);
      }
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    if (!activeScreen.current) {
      return;
    }

    if (searchTimer.current !== null) {
      clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
    activeController.current?.abort();
    const controller = new AbortController();
    await loadTasks(filters.current, controller);
  }, [loadTasks]);

  useEffect(() => {
    activeScreen.current = true;
    void refreshTasks();

    return () => {
      activeScreen.current = false;
      requestSequence.current += 1;
      activeController.current?.abort();
      if (searchTimer.current !== null) {
        clearTimeout(searchTimer.current);
      }
    };
  }, [refreshTasks]);

  function changeFilters(nextQuery: string, nextStatus: TaskStatus, delay: number) {
    setQuery(nextQuery);
    setStatus(nextStatus);
    filters.current = { search: nextQuery, status: nextStatus };
    requestSequence.current += 1;
    activeController.current?.abort();
    setLoading(true);
    setError(null);

    if (searchTimer.current !== null) {
      clearTimeout(searchTimer.current);
    }

    if (delay > 0) {
      searchTimer.current = setTimeout(() => void refreshTasks(), delay);
    } else {
      void refreshTasks();
    }
  }

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;

  async function addTask() {
    const validationError = getTaskTitleError(newTitle);

    if (validationError) {
      setFeedback(validationError);
      return;
    }

    if (creating.current) {
      return;
    }

    creating.current = true;
    setSaving(true);
    setFeedback('');

    try {
      await tasksService.create({ title: newTitle.trim() });
      setNewTitle('');
      setFeedback('Tarea agregada.');
      Keyboard.dismiss();
      await refreshTasks();
    } catch (caught) {
      setFeedback(getOperationError(caught));
    } finally {
      creating.current = false;
      setSaving(false);
    }
  }

  async function mutateTask(id: number, operation: () => Promise<void>) {
    if (activeMutations.current.has(id)) {
      return;
    }

    activeMutations.current.add(id);
    setBusy((current) => new Set(current).add(id));
    setFeedback('');

    try {
      await operation();
      await refreshTasks();
    } catch (caught) {
      setFeedback(getOperationError(caught));

      if (caught instanceof ApiError && caught.status === 404) {
        await refreshTasks();
      }
    } finally {
      activeMutations.current.delete(id);
      setBusy((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  function toggleTask(task: Task) {
    return mutateTask(task.id, async () => {
      const updated = await tasksService.setCompleted(task.id, !task.completed);
      setTasks((current) => current.map((item) => item.id === task.id ? updated : item));
      setFeedback(updated.completed ? 'Tarea completada.' : 'Tarea marcada como pendiente.');
    });
  }

  function deleteTask(id: number) {
    return mutateTask(id, async () => {
      await tasksService.remove(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      setFeedback('Tarea eliminada.');
    });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TaskCard
            busy={busy.has(item.id)}
            task={item}
            onToggle={() => void toggleTask(item)}
            onDelete={() => void deleteTask(item.id)}
          />
        )}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <View style={styles.titleRow}>
              <View style={styles.titleCopy}>
                <Text accessibilityRole="header" style={styles.heading}>Gestor de tareas</Text>
                <Text style={styles.subtitle}>Organizá pendientes y seguí el trabajo compartido.</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => router.push('/guia')} style={styles.refreshButton}>
                <Text style={styles.refreshText}>Guía</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Resultados</Text>
                <Text style={styles.statNumber}>{total}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Pendientes</Text>
                <Text style={styles.statNumber}>{total - completed}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Completadas</Text>
                <Text style={styles.statNumber}>{completed}</Text>
              </View>
            </View>

            <View style={styles.formPanel}>
              <Text style={styles.sectionTitle}>Nueva tarea</Text>
              <View style={styles.addRow}>
                <TextInput
                  testID="new-task-input"
                  accessibilityLabel="Título de la nueva tarea"
                  placeholder="Ej: Preparar la exposición"
                  placeholderTextColor="#667780"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  editable={!saving}
                  returnKeyType="done"
                  onSubmitEditing={() => void addTask()}
                  style={styles.addInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: saving }}
                  testID="add-task-button"
                  disabled={saving}
                  style={({ pressed }) => [styles.addButton, pressed && styles.pressed, saving && styles.disabled]}
                  onPress={() => void addTask()}
                >
                  {saving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.addButtonText}>Agregar</Text>}
                </Pressable>
              </View>
              {feedback ? <Text accessibilityRole="alert" style={styles.feedback}>{feedback}</Text> : null}
            </View>

            <View style={styles.listHeadingRow}>
              <Text style={styles.sectionTitle}>Tareas</Text>
              <Pressable accessibilityRole="button" onPress={() => void refreshTasks()} style={styles.refreshButton}>
                <Text style={styles.refreshText}>Recargar</Text>
              </Pressable>
            </View>
            <TextInput
              testID="search-input"
              accessibilityLabel="Buscar tareas"
              placeholder="Buscar por título o descripción"
              placeholderTextColor="#667780"
              value={query}
              onChangeText={(text) => changeFilters(text, filters.current.status ?? 'todas', 275)}
              style={styles.searchInput}
            />
            <StatusTabs current={status} onChange={(next) => changeFilters(query, next, 0)} />

            {loading && tasks.length > 0 ? (
              <View style={styles.refreshStatus}>
                <ActivityIndicator color="#0E756F" size="small" />
                <Text style={styles.loadingLabel}>Actualizando tareas</Text>
              </View>
            ) : null}

            {error ? (
              <View accessibilityRole="alert" style={styles.errorPanel}>
                <Text style={styles.error}>{error}</Text>
                <Pressable accessibilityRole="button" onPress={() => void refreshTasks()} style={styles.errorButton}>
                  <Text style={styles.errorButtonText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : null}

            {loading && tasks.length === 0 ? (
              <View style={styles.loading}>
                <ActivityIndicator color="#0E756F" size="large" />
                <Text style={styles.loadingLabel}>Consultando tareas</Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={!loading && !error ? <Text style={styles.empty}>No hay tareas para mostrar con estos filtros.</Text> : undefined}
        ListFooterComponent={<Text style={styles.footer}>EDI · Agustina Alcaraz · 2026</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F4F7' },
  listContainer: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 48, flexGrow: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  titleCopy: { flex: 1 },
  heading: { fontSize: 26, fontWeight: '700', color: '#15313A', letterSpacing: -0.5 },
  subtitle: { color: '#52666F', fontSize: 14, marginTop: 7, lineHeight: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E3E8ED', marginTop: 20, marginBottom: 16, paddingVertical: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#EDF0F2' },
  statLabel: { color: '#5B6D76', fontSize: 12 },
  statNumber: { color: '#15313A', fontSize: 24, fontWeight: '600', marginTop: 5, fontVariant: ['tabular-nums'] },
  formPanel: { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E3E8ED', padding: 16, marginBottom: 22 },
  sectionTitle: { color: '#15313A', fontSize: 16, fontWeight: '600' },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  addInput: { flex: 1, minWidth: 0, minHeight: 44, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C7D0D6', borderRadius: 8, paddingHorizontal: 12, color: '#15313A', fontSize: 14 },
  addButton: { minHeight: 44, minWidth: 86, backgroundColor: '#0E756F', borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 13 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  feedback: { color: '#29444C', fontSize: 13, marginTop: 10, lineHeight: 19 },
  listHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  refreshButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  refreshText: { color: '#0B615D', fontSize: 13, fontWeight: '600' },
  searchInput: { minHeight: 44, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C7D0D6', borderRadius: 8, paddingHorizontal: 12, color: '#15313A', fontSize: 14, marginBottom: 6 },
  errorPanel: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4BABA', borderRadius: 8, padding: 14, marginBottom: 12 },
  error: { color: '#7F2731', lineHeight: 20, fontSize: 13 },
  errorButton: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  errorButtonText: { color: '#8F2934', fontWeight: '700', fontSize: 13 },
  loading: { alignItems: 'center', paddingVertical: 28, gap: 10 },
  loadingLabel: { color: '#52666F', fontSize: 13 },
  refreshStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  empty: { marginVertical: 28, textAlign: 'center', color: '#52666F', lineHeight: 20, fontSize: 14 },
  footer: { textAlign: 'center', color: '#667780', fontSize: 12, paddingTop: 24 },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.55 },
});
