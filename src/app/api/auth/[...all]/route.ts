import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { env } from "@/config/env";

const handlers = toNextJsHandler(auth);

function withDatabase(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    if (!env.DATABASE_URL) {
      return Response.json(
        { message: "Authentication is not configured yet. Set DATABASE_URL and restart the server." },
        { status: 503 },
      );
    }

    return handler(request);
  };
}

export const GET = withDatabase(handlers.GET);
export const POST = withDatabase(handlers.POST);
