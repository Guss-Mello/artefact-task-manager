import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { appRouter } from "@/server/routers/_app";

function handler(request: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => ({}),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`tRPC error on ${path ?? "unknown path"}:`, error);
          }
        : undefined,
  });
}

export { handler as GET, handler as POST };
