import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";

import { createCaller } from "@/server/routers/_app";
import { taskStore } from "@/server/store/task-store";

describe("task router", () => {
  beforeEach(() => taskStore.clear());

  it("creates and lists a task", async () => {
    const caller = createCaller();
    const created = await caller.task.create({
      titulo: "Write the case",
      descricao: "Document the implementation decisions.",
    });
    const page = await caller.task.list({ limit: 8 });

    expect(created.id).toBeTypeOf("string");
    expect(created.dataCriacao).toBeTypeOf("string");
    expect(created.status).toBe("pending");
    expect(page.items).toEqual([created]);
  });

  it("rejects an empty title", async () => {
    const caller = createCaller();

    await expect(caller.task.create({ titulo: "   " })).rejects.toBeInstanceOf(
      TRPCError,
    );
  });

  it("updates an existing task without changing its creation date", async () => {
    const caller = createCaller();
    const created = await caller.task.create({ titulo: "Initial title" });
    const updated = await caller.task.update({
      id: created.id,
      titulo: "Updated title",
      descricao: "New description",
      status: "completed",
    });

    expect(updated).toMatchObject({
      id: created.id,
      titulo: "Updated title",
      descricao: "New description",
      dataCriacao: created.dataCriacao,
      status: "completed",
    });
  });

  it("deletes an existing task", async () => {
    const caller = createCaller();
    const created = await caller.task.create({ titulo: "Delete me" });

    await caller.task.delete({ id: created.id });

    expect((await caller.task.list()).items).toHaveLength(0);
  });

  it("returns a meaningful error for a missing task", async () => {
    const caller = createCaller();
    const missingId = "00000000-0000-4000-8000-000000000000";

    await expect(
      caller.task.update({ id: missingId, titulo: "Missing" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND", message: "Task not found." });
  });

  it("paginates the list with a cursor", async () => {
    const caller = createCaller();
    for (let index = 1; index <= 3; index += 1) {
      await caller.task.create({ titulo: `Task ${index}` });
    }

    const firstPage = await caller.task.list({ limit: 2 });
    const secondPage = await caller.task.list({
      cursor: firstPage.nextCursor,
      limit: 2,
    });

    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.nextCursor).toBe(2);
    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.nextCursor).toBeUndefined();
  });
});
