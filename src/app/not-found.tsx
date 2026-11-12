import Link from "next/link";

export default function NotFound() {
  return (
    <section className="empty-state" aria-labelledby="not-found-title">
      <div className="empty-icon" aria-hidden="true">
        ?
      </div>
      <h1 id="not-found-title">Task not found</h1>
      <p>The task may have been deleted or the address may be incorrect.</p>
      <Link className="button button-primary" href="/">
        Back to tasks
      </Link>
    </section>
  );
}
