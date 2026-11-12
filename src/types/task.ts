export type TaskStatus = "pending" | "in_progress" | "completed";

export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: string;
  status: TaskStatus;
};

export type TaskPage = {
  items: Task[];
  nextCursor?: number;
};
