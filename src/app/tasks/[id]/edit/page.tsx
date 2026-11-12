import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

import { TaskForm } from "@/components/TaskForm";
import { createCaller } from "@/server/routers/_app";

export const dynamic = "force-dynamic";

type EditTaskPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;

  try {
    const task = await createCaller().task.getById({ id });

    return (
      <section className="form-page" aria-labelledby="form-title">
        <div className="form-heading">
          <h1 id="form-title">Edit task</h1>
          <p>Update the details or move the task to another column.</p>
        </div>
        <TaskForm mode="edit" initialTask={task} />
      </section>
    );
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
