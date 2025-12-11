import { createFileRoute } from "@tanstack/react-router";

async function handler({ request }: { request: Request }) {
	try {
		const { auth } = await import("@/lib/auth");
		return auth.handler(request);
	} catch (error) {
		console.error("Error initializing auth:", error);
		return new Response(
			JSON.stringify({
				error: "Authentication service unavailable",
				message: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: handler,
			POST: handler,
		},
	},
});

