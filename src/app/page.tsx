import { TaskList } from "@/components/TaskList";
import { createCaller } from "@/server/routers/_app";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Call tRPC directly during SSR to avoid an internal HTTP request.
  const initialPage = await createCaller().task.list({ limit: 12 });

  return <TaskList initialPage={initialPage} />;
}
