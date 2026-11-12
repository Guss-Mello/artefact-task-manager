"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { trpc } from "@/trpc/client";
import type { Task, TaskStatus } from "@/types/task";

type TaskFormProps =
  | { mode: "create"; initialTask?: never }
  | { mode: "edit"; initialTask: Task };

export function TaskForm({ mode, initialTask }: TaskFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [titulo, setTitulo] = useState(initialTask?.titulo ?? "");
  const [descricao, setDescricao] = useState(initialTask?.descricao ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "pending");
  const [fieldError, setFieldError] = useState<string>();
  const [feedback, setFeedback] = useState<string>();

  const createTask = trpc.task.create.useMutation();
  const updateTask = trpc.task.update.useMutation();
  const isPending = createTask.isPending || updateTask.isPending;

  async function finishSuccessfully(message: string) {
    setFeedback(message);
    await utils.task.list.invalidate();
    router.push("/");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(undefined);
    setFeedback(undefined);

    const cleanTitle = titulo.trim();
    const cleanDescription = descricao.trim();
    if (!cleanTitle) {
      setFieldError("Title is required.");
      return;
    }

    if (mode === "create") {
      createTask.mutate(
        {
          titulo: cleanTitle,
          descricao: cleanDescription || undefined,
          status,
        },
        {
          onSuccess: async () => {
            await finishSuccessfully("Task created successfully.");
          },
          onError: (error) => setFeedback(error.message),
        },
      );
      return;
    }

    updateTask.mutate(
      {
        id: initialTask.id,
        titulo: cleanTitle,
        descricao: cleanDescription || undefined,
        status,
      },
      {
        onSuccess: async () => {
          await finishSuccessfully("Task updated successfully.");
        },
        onError: (error) => setFeedback(error.message),
      },
    );
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="titulo">Title</label>
        <input
          id="titulo"
          name="titulo"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          maxLength={120}
          aria-describedby={fieldError ? "title-error" : "title-help"}
          aria-invalid={Boolean(fieldError)}
          autoFocus
        />
        {fieldError ? (
          <p className="field-error" id="title-error">
            {fieldError}
          </p>
        ) : (
          <p className="field-help" id="title-help">
            Required, up to 120 characters.
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="form-field">
        <div className="label-row">
          <label htmlFor="descricao">Description</label>
          <span>{descricao.length}/500</span>
        </div>
        <textarea
          id="descricao"
          name="descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          maxLength={500}
          rows={6}
          placeholder="Add context, acceptance criteria, or useful notes."
        />
      </div>

      {feedback && (
        <p className={feedback.includes("successfully") ? "feedback" : "feedback error"} role="status">
          {feedback}
        </p>
      )}

      <div className="form-actions">
        <Link className="button button-secondary" href="/">
          Cancel
        </Link>
        <button className="button button-primary" type="submit" disabled={isPending}>
          {isPending ? "Saving…" : mode === "create" ? "Create task" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
