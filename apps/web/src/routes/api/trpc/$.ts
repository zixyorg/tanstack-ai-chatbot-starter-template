import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@tanstack-ai-chatbot-starter-template/api/routers/index";
import { createContext } from "@tanstack-ai-chatbot-starter-template/api/context";
import { createFileRoute } from "@tanstack/react-router";
import { getSession } from "@/lib/auth";

function handler({ request }: { request: Request }) {
	return fetchRequestHandler({
		req: request,
		router: appRouter,
		createContext: async (opts) => {
			const session = await getSession(request);
			return createContext({ req: request, session });
		},
		endpoint: "/api/trpc",
	});
}

export const Route = createFileRoute("/api/trpc/$")({
	server: {
		handlers: {
			GET: handler,
			POST: handler,
		},
	},
});
