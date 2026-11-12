import { randomUUID } from "node:crypto";

import type { Task, TaskPage, TaskStatus } from "@/types/task";

type CreateTaskInput = {
  titulo: string;
  descricao?: string;
  status: TaskStatus;
};

type UpdateTaskInput = CreateTaskInput & {
  id: string;
};

class TaskStore {
  private tasks: Task[] = [];

  private normalize(task: Task): Task {
    return { ...task, status: task.status ?? "pending" };
  }

  list(cursor = 0, limit = 8): TaskPage {
    const items = this.tasks.slice(cursor, cursor + limit);
    const nextCursor = cursor + items.length;

    return {
      items: items.map((task) => this.normalize(task)),
      nextCursor: nextCursor < this.tasks.length ? nextCursor : undefined,
    };
  }

  findById(id: string): Task | undefined {
    const task = this.tasks.find((item) => item.id === id);
    return task ? this.normalize(task) : undefined;
  }

  create(input: CreateTaskInput): Task {
    const task: Task = {
      id: randomUUID(),
      titulo: input.titulo,
      descricao: input.descricao || undefined,
      dataCriacao: new Date().toISOString(),
      status: input.status,
    };

    this.tasks.unshift(task);
    return { ...task };
  }

  update(input: UpdateTaskInput): Task | undefined {
    const taskIndex = this.tasks.findIndex((task) => task.id === input.id);
    if (taskIndex === -1) return undefined;

    const updatedTask: Task = {
      ...this.tasks[taskIndex],
      titulo: input.titulo,
      descricao: input.descricao || undefined,
      status: input.status,
    };

    this.tasks[taskIndex] = updatedTask;
    return { ...updatedTask };
  }

  delete(id: string): boolean {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return this.tasks.length < initialLength;
  }

  clear(): void {
    this.tasks = [];
  }
}

// Keep the in-memory store stable across development hot reloads.
const globalForTaskStore = globalThis as typeof globalThis & {
  taskStore?: TaskStore;
};

export const taskStore = globalForTaskStore.taskStore ?? new TaskStore();

if (process.env.NODE_ENV !== "production") {
  globalForTaskStore.taskStore = taskStore;
}
