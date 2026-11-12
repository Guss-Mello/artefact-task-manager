"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { trpc } from "@/trpc/client";
import type { Task, TaskPage, TaskStatus } from "@/types/task";

const PAGE_SIZE = 12;

const columns: Array<{
  status: TaskStatus;
  title: string;
}> = [
  { status: "pending", title: "Pending" },
  { status: "in_progress", title: "In progress" },
  { status: "completed", title: "Completed" },
];

type TaskListProps = {
  initialPage: TaskPage;
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function TaskCard({
  task,
  isDeleting,
  onDelete,
}: {
  task: Task;
  isDeleting: boolean;
  onDelete: (task: Task) => void;
}) {
  return (
    <article className={`task-card status-${task.status}`}>
      <div className="task-card-topline">
        <span>Task</span>
        <time dateTime={task.dataCriacao}>{formatDate(task.dataCriacao)}</time>
      </div>
      <h3>{task.titulo}</h3>
      {task.descricao && <p className="task-description">{task.descricao}</p>}
      <div className="task-card-footer">
        <Link className="card-action" href={`/tasks/${task.id}/edit`}>
          Edit
        </Link>
        <button
          className="card-action danger"
          disabled={isDeleting}
          onClick={() => onDelete(task)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export function TaskList({ initialPage }: TaskListProps) {
  const [feedback, setFeedback] = useState<string>();
  const [taskToDelete, setTaskToDelete] = useState<Task>();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();
  const tasksQuery = trpc.task.list.useInfiniteQuery(
    { limit: PAGE_SIZE },
    {
      initialData: {
        pages: [initialPage],
        pageParams: [undefined],
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = tasksQuery;
  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: async () => {
      setFeedback("Task deleted.");
      setTaskToDelete(undefined);
      await utils.task.list.invalidate();
    },
    onError: (error) => setFeedback(error.message),
  });

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;

    // Load the next page when the sentinel approaches the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "160px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!taskToDelete) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleteTask.isPending) {
        setTaskToDelete(undefined);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [deleteTask.isPending, taskToDelete]);

  const tasks = tasksQuery.data?.pages.flatMap((page) => page.items) ?? [];

  function handleDelete(task: Task) {
    setFeedback(undefined);
    setTaskToDelete(task);
  }

  return (
    <section aria-labelledby="task-list-title">
      <div className="board-heading">
        <div>
          <h1 id="task-list-title">Task board</h1>
          <p>
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} loaded
          </p>
        </div>
        <Link className="button button-primary" href="/tasks/new">
          <span aria-hidden="true">＋</span> New task
        </Link>
      </div>

      {feedback && (
        <p className="feedback" role="status">
          {feedback}
        </p>
      )}

      {tasksQuery.isError ? (
        <div className="error-panel" role="alert">
          <p>{tasksQuery.error.message}</p>
          <button className="button button-secondary" onClick={() => tasksQuery.refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <div className="kanban-board">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.status);

            return (
              <section className={`kanban-column column-${column.status}`} key={column.status}>
                <header className="column-header">
                  <div>
                    <span className="status-dot" aria-hidden="true" />
                    <h2>{column.title}</h2>
                  </div>
                  <span className="task-count" aria-label={`${columnTasks.length} tasks`}>
                    {columnTasks.length}
                  </span>
                </header>

                <div className="column-tasks">
                  {columnTasks.length === 0 ? (
                    <p className="column-empty">No tasks here.</p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isDeleting={deleteTask.isPending}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div
        className={tasksQuery.isFetchingNextPage ? "load-more loading" : "load-more"}
        ref={loadMoreRef}
      >
        {tasksQuery.isFetchingNextPage && <span>Loading more tasks…</span>}
      </div>

      {taskToDelete && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleteTask.isPending) {
              setTaskToDelete(undefined);
            }
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            <h2 id="delete-modal-title">Delete task?</h2>
            <p id="delete-modal-description">
              <strong>{taskToDelete.titulo}</strong> will be permanently removed.
            </p>
            {deleteTask.isError && (
              <p className="modal-error" role="alert">
                {deleteTask.error.message}
              </p>
            )}
            <div className="modal-actions">
              <button
                className="button button-secondary"
                type="button"
                disabled={deleteTask.isPending}
                onClick={() => setTaskToDelete(undefined)}
              >
                Cancel
              </button>
              <button
                className="button button-danger"
                type="button"
                disabled={deleteTask.isPending}
                onClick={() => deleteTask.mutate({ id: taskToDelete.id })}
                autoFocus
              >
                {deleteTask.isPending ? "Deleting…" : "Delete task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
