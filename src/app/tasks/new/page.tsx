import { TaskForm } from "@/components/TaskForm";

export default function NewTaskPage() {
  return (
    <section className="form-page" aria-labelledby="form-title">
      <div className="form-heading">
        <h1 id="form-title">New task</h1>
        <p>Add the task details and choose its current status.</p>
      </div>
      <TaskForm mode="create" />
    </section>
  );
}
