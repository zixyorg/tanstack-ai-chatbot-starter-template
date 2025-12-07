import { createFileRoute } from "@tanstack/react-router";
import { chat, toStreamResponse } from "@tanstack/ai";
import { openai } from "@tanstack/ai-openai";

const MODEL_MAP: Record<string, "o3-mini" | "gpt-4o-mini" | "gpt-4o"> = {
	"o3-mini": "o3-mini",
	"Gemini 2.5 Flash": "gpt-4o-mini",
	"Claude 3.5 Sonnet": "gpt-4o-mini",
	"GPT-4-1 Mini": "gpt-4o-mini",
	"GPT-4-1": "gpt-4o",
} as const;

async function handler({ request }: { request: Request }) {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	try {
		const body = await request.json();
		const { messages, data, conversationId } = body;
		const selectedModel = data?.model;

		if (!process.env.OPENAI_API_KEY) {
			return new Response(
				JSON.stringify({
					error: "OPENAI_API_KEY not configured",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		if (!messages || !Array.isArray(messages)) {
			return new Response(
				JSON.stringify({
					error: "messages array is required",
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const modelId: "o3-mini" | "gpt-4o-mini" | "gpt-4o" = selectedModel
			? MODEL_MAP[selectedModel] || "gpt-4o-mini"
			: "gpt-4o-mini";

		const adapter = openai();

		const stream = chat({
			adapter,
			messages,
			model: modelId,
			conversationId,
		});

		return toStreamResponse(stream);
	} catch (error: any) {
		return new Response(
			JSON.stringify({
				error: error.message || "An error occurred",
			}),
			{
				status: error.message?.includes("parse") ? 400 : 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: handler,
		},
	},
});

