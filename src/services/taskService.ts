import type { CreateTaskInput, Task, TaskFilters, TaskStatus } from '../types/task';

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://backend-proyecto.n7softwares.com/api/v1'
).replace(/\/+$/, '');

const statusValues: Record<TaskStatus, 'all' | 'pending' | 'completed'> = {
  todas: 'all',
  pendientes: 'pending',
  completadas: 'completed',
};

type ApiErrorBody = {
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await response.text();
  let data: unknown;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const body = typeof data === 'object' && data !== null ? data as ApiErrorBody : null;
    const message = body?.message || body?.error || `La API respondió con estado ${response.status}.`;
    throw new ApiError(response.status, message);
  }

  return data as T;
}

function buildListPath(filters: TaskFilters): string {
  const params = new URLSearchParams();
  const search = filters.search?.trim();

  if (search) {
    params.set('search', search);
  }

  params.set('status', statusValues[filters.status || 'todas']);
  return `/tasks?${params.toString()}`;
}

export const tasksService = {
  list(filters: TaskFilters = {}, signal?: AbortSignal): Promise<Task[]> {
    return request<Task[]>(buildListPath(filters), { signal });
  },

  get(id: number, signal?: AbortSignal): Promise<Task> {
    return request<Task>(`/tasks/${id}`, { signal });
  },

  create(input: CreateTaskInput): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  setCompleted(id: number, completed: boolean): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  remove(id: number): Promise<void> {
    return request<void>(`/tasks/${id}`, { method: 'DELETE' });
  },
};
