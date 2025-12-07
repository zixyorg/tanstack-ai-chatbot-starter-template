export type Provider = "openai" | "anthropic" | "gemini";

export interface ModelConfig {
	provider: Provider;
	modelId: string;
	apiKeyEnv: string;
}

const PROVIDER_API_KEY_MAP: Record<Provider, string> = {
	openai: "OPENAI_API_KEY",
	anthropic: "ANTHROPIC_API_KEY",
	gemini: "GEMINI_API_KEY",
} as const;

export const AI_PROVIDERS = [
	{
		id: "openai",
		name: "OpenAI",
		models: [
			{ id: "o3-mini", name: "o3-mini" },
			{ id: "gpt-4o-mini", name: "GPT-4o Mini" },
			{ id: "gpt-4o", name: "GPT-4o" },
			{ id: "gpt-4-turbo", name: "GPT-4 Turbo" },
			{ id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
		],
	},
	{
		id: "anthropic",
		name: "Anthropic",
		models: [
			{ id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5" },
			{ id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet" },
			{ id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku" },
		],
	},
	{
		id: "gemini",
		name: "Google",
		models: [
			{ id: "gemini-pro", name: "Gemini Pro" },
			{ id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash" },
		],
	},
] as const;

export const MODEL_MAP: Record<string, ModelConfig> = Object.fromEntries(
	AI_PROVIDERS.flatMap((provider) =>
		provider.models.map((model) => [
			model.name,
			{
				provider: provider.id as Provider,
				modelId: model.id,
				apiKeyEnv: PROVIDER_API_KEY_MAP[provider.id as Provider],
			},
		]),
	),
) as Record<string, ModelConfig>;

export const DEFAULT_MODEL = "GPT-4o Mini";

export function getModelConfig(modelName?: string): ModelConfig {
	if (!modelName) {
		return MODEL_MAP[DEFAULT_MODEL];
	}
	const normalizedName = modelName.trim();
	const config = MODEL_MAP[normalizedName];
	if (!config) {
		throw new Error(`Model "${modelName}" not found. Available models: ${Object.keys(MODEL_MAP).join(", ")}`);
	}
	return config;
}

export function getAvailableModels(): string[] {
	return Object.keys(MODEL_MAP);
}

