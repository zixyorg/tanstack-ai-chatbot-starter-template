import { createFileRoute } from "@tanstack/react-router";
import { chat, toStreamResponse } from "@tanstack/ai";
import { openai } from "@tanstack/ai-openai";
import { anthropic } from "@tanstack/ai-anthropic";
import { gemini } from "@tanstack/ai-gemini";
import { getModelConfig } from "@/lib/models";

async function handler({ request }: { request: Request }) {
	if (request.method === "OPTIONS") {
		return new Response(null, {
			status: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		});
	}

	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	try {
		const body = await request.json();
		const { messages, data, conversationId, model } = body;
		const selectedModel = model || data?.model;
		

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


		const apiKey = process.env[modelConfig.apiKeyEnv] || (import.meta as any).env?.[modelConfig.apiKeyEnv];
		
		if (!apiKey) {
			return new Response(
				JSON.stringify({
					error: `${modelConfig.apiKeyEnv} not configured. Make sure your .env file is in apps/web/.env and contains ${modelConfig.apiKeyEnv}=your-key`,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		let stream;
		try {
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

			const wrappedStream = (async function* () {
				try {
					for await (const chunk of stream) {
						yield chunk;
					}
				} catch (streamError: any) {
					console.error(`[Chat API] Stream error:`, streamError);
					yield {
						type: "error" as const,
						id: conversationId || "unknown",
						model: modelConfig.modelId,
						timestamp: Date.now(),
						error: {
							message: streamError.message || "Stream error occurred",
							code: streamError.code || "stream_error",
						},
					};
				}
			})();

			const response = toStreamResponse(wrappedStream);
			response.headers.set("Access-Control-Allow-Origin", "*");
			response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
			response.headers.set("Access-Control-Allow-Headers", "Content-Type");
			return response;
		} catch (adapterError: any) {
			console.error(`[Chat API] Error creating adapter or stream:`, adapterError);
			return new Response(
				JSON.stringify({
					error: `Failed to create ${modelConfig.provider} adapter: ${adapterError.message}`,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	} catch (error: any) {
		const isClientError = error.message?.includes("parse") || error.message?.includes("not found");
		return new Response(
			JSON.stringify({
				error: error.message || "An error occurred",
			}),
			{
				status: isClientError ? 400 : 500,
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

