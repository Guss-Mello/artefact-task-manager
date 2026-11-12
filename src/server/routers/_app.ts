import { taskRouter } from "@/server/routers/task";
import { createTRPCRouter } from "@/server/trpc";

export const appRouter = createTRPCRouter({
  task: taskRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = () => appRouter.createCaller({});
