import { initTRPC } from "@trpc/server";

export type TRPCContext = Record<string, never>;

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
