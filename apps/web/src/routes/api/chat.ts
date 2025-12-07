import { createFileRoute } from "@tanstack/react-router";
import { chat, toStreamResponse } from "@tanstack/ai";
import { openai } from "@tanstack/ai-openai";
import { anthropic } from "@tanstack/ai-anthropic";
import { gemini } from "@tanstack/ai-gemini";
import { getModelConfig } from "@/lib/models";

async function handler({ request }: { request: Request }) {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	try {
		const body = await request.json();
		const { messages, data, conversationId } = body;
		const selectedModel = data?.model;

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

		const modelConfig = getModelConfig(selectedModel);

		const apiKey = process.env[modelConfig.apiKeyEnv];
		if (!apiKey) {
			return new Response(
				JSON.stringify({
					error: `${modelConfig.apiKeyEnv} not configured`,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		let stream;
		switch (modelConfig.provider) {
			case "openai": {
				const adapter = openai({ apiKey } as Parameters<typeof openai>[0]);
				stream = chat({
					adapter,
					messages,
					model: modelConfig.modelId as any,
					conversationId,
				});
				break;
			}
			case "anthropic": {
				const adapter = anthropic({ apiKey });
				stream = chat({
					adapter,
					messages,
					model: modelConfig.modelId as any,
					conversationId,
				});
				break;
			}
			case "gemini": {
				const adapter = gemini({ apiKey } as Parameters<typeof gemini>[0]);
				stream = chat({
					adapter,
					messages,
					model: modelConfig.modelId as any,
					conversationId,
				});
				break;
			}
			default:
				return new Response(
					JSON.stringify({
						error: "Unsupported provider",
					}),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				);
		}

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

