# Taskflow

A small task management application built for the Artefact Software Engineer written case. It uses Next.js 15, TypeScript, tRPC, TanStack Query, Zod, and an in-memory data store.

## Features

- Create, edit, and delete tasks.
- Organize tasks in a three-column Kanban board.
- Server-render the initial task list.
- Validate inputs on both the client and server.
- Load tasks incrementally with infinite scroll.
- Display clear loading, success, empty, and error states.

## Running locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## How it works

The project uses the Next.js App Router. The task list is loaded through a tRPC caller in a Server Component, so the initial HTML already contains the first page of tasks. Client Components add form handling, mutations, feedback, and infinite scrolling.

The tRPC API is available at `/api/trpc`. Zod validates all inputs, and missing tasks return a typed `NOT_FOUND` error.

Tasks are stored in a process-local array. A `globalThis` singleton keeps the store stable during development hot reloads. TanStack Query manages client requests, cache updates, and incremental loading.

## Tests

The router tests cover task creation, validation, updates, deletion, missing-task errors, and cursor pagination.

## Limitation

The case requires in-memory storage, so tasks are reset whenever the server restarts and are not shared between multiple server instances.

