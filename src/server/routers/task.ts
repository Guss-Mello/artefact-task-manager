import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { taskStore } from "@/server/store/task-store";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

const taskFieldsSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Title must have at most 120 characters."),
  descricao: z
    .string()
    .trim()
    .max(500, "Description must have at most 500 characters.")
    .optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
});

const idSchema = z.object({
  id: z.uuid("Invalid task id."),
});

function notFoundError(): TRPCError {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Task not found.",
  });
}

export const taskRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          cursor: z.number().int().min(0).optional(),
          limit: z.number().int().min(1).max(20).default(8),
        })
        .optional(),
    )
    .query(({ input }) => taskStore.list(input?.cursor, input?.limit)),

  getById: publicProcedure.input(idSchema).query(({ input }) => {
    const task = taskStore.findById(input.id);
    if (!task) throw notFoundError();
    return task;
  }),

  create: publicProcedure.input(taskFieldsSchema).mutation(({ input }) => {
    return taskStore.create(input);
  }),

  update: publicProcedure
    .input(taskFieldsSchema.extend({ id: z.uuid("Invalid task id.") }))
    .mutation(({ input }) => {
      const task = taskStore.update(input);
      if (!task) throw notFoundError();
      return task;
    }),

  delete: publicProcedure.input(idSchema).mutation(({ input }) => {
    if (!taskStore.delete(input.id)) throw notFoundError();
    return { id: input.id };
  }),
});
