export type TaskStatus = 'todas' | 'pendientes' | 'completadas';

export type TaskFilters = {
  search?: string;
  status?: TaskStatus;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  completed: boolean;
};
