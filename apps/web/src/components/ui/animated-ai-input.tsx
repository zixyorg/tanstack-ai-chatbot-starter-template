"use client";

import type { ReactNode } from "react";
import {
	ArrowRight,
	Bot,
	Check,
	ChevronDown,
	Paperclip,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AI_PROVIDERS, getAvailableModels, DEFAULT_MODEL } from "@/lib/models";

interface UseAutoResizeTextareaProps {
	minHeight: number;
	maxHeight?: number;
}

function useAutoResizeTextarea({
	minHeight,
	maxHeight,
}: UseAutoResizeTextareaProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const adjustHeight = useCallback(
		(reset?: boolean) => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			if (reset) {
				textarea.style.height = `${minHeight}px`;
				return;
			}

			textarea.style.height = `${minHeight}px`;

			const newHeight = Math.max(
				minHeight,
				Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY),
			);

			textarea.style.height = `${newHeight}px`;
		},
		[minHeight, maxHeight],
	);

	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = `${minHeight}px`;
		}
	}, [minHeight]);

	useEffect(() => {
		const handleResize = () => adjustHeight();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [adjustHeight]);

	return { textareaRef, adjustHeight };
}

const OPENAI_ICON = (
	<>
		<svg
			aria-label="OpenAI Icon"
			className="h-4 w-4 dark:hidden block"
			height="20"
			viewBox="0 0 256 260"
			width="20"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>OpenAI Icon Light</title>
			<path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
		</svg>
		<svg
			aria-label="OpenAI Icon"
			className="hidden h-4 w-4 dark:block"
			fill="#fff"
			height="20"
			viewBox="0 0 256 260"
			width="20"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>OpenAI Icon Dark</title>
			<path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
		</svg>
	</>
);

export function AI_Prompt() {
	const [value, setValue] = useState("");
	const { textareaRef, adjustHeight } = useAutoResizeTextarea({
		minHeight: 72,
		maxHeight: 300,
	});
	const AI_MODELS = getAvailableModels();
	const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
	const selectedModelRef = useRef(selectedModel);

	useEffect(() => {
		selectedModelRef.current = selectedModel;
	}, [selectedModel]);

	const { messages, sendMessage, isLoading } = useChat({
		connection: fetchServerSentEvents("/api/chat", () => ({
			body: {
				model: selectedModelRef.current,
			},
		})),
		onError: (error) => {
			console.error("[Chat] Error:", error);
			const errorMessage = error?.message || String(error);
			if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
				console.warn("[Chat] Rate limit or quota exceeded. Try using Gemini Flash model (available on free tier) or wait a few minutes.");
			}
		},
	});

	const GEMINI_ICON = (
		<svg
			className="h-4 w-4"
			height="1em"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Gemini</title>
			<defs>
				<linearGradient
					id="lobe-icons-gemini-fill"
					x1="0%"
					x2="68.73%"
					y1="100%"
					y2="30.395%"
				>
					<stop offset="0%" stopColor="#1C7DFF" />
					<stop offset="52.021%" stopColor="#1C69FF" />
					<stop offset="100%" stopColor="#F0DCD6" />
				</linearGradient>
			</defs>
			<path
				d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
				fill="url(#lobe-icons-gemini-fill)"
				fillRule="nonzero"
			/>
		</svg>
	);

	const ANTHROPIC_ICON = (
		<>
			<svg
				className="block h-4 w-4 dark:hidden"
				fill="#000"
				fillRule="evenodd"
				viewBox="0 0 24 24"
				width="1em"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>Anthropic Icon Light</title>
				<path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
			</svg>
			<svg
				className="hidden h-4 w-4 dark:block"
				fill="#fff"
				fillRule="evenodd"
				viewBox="0 0 24 24"
				width="1em"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>Anthropic Icon Dark</title>
				<path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
			</svg>
		</>
	);

	const PROVIDER_ICONS: Record<string, ReactNode> = {
		openai: OPENAI_ICON,
		anthropic: ANTHROPIC_ICON,
		gemini: GEMINI_ICON,
	};

	const MODEL_ICONS: Record<string, ReactNode> = Object.fromEntries(
		AI_PROVIDERS.flatMap((provider) =>
			provider.models.map((model) => [
				model.name,
				PROVIDER_ICONS[provider.id] ?? <Bot className="h-4 w-4 opacity-50" />,
			]),
		),
	);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey && value.trim() && !isLoading) {
			e.preventDefault();
			sendMessage(value);
			setValue("");
			adjustHeight(true);
		}
	};

	const handleSend = () => {
		if (!value.trim() || isLoading) return;
		sendMessage(value);
		setValue("");
		adjustHeight(true);
	};

	return (
		<div className="mx-auto w-full max-w-2xl">
			{messages.length > 0 && (
				<div className="mb-4 space-y-4 overflow-y-auto max-h-[400px]">
					{messages.map((message) => (
						<div
							key={message.id}
							className={cn(
								"rounded-lg p-4",
								message.role === "assistant"
									? "bg-white/5 text-white"
									: "bg-white/10 text-white",
							)}
						>
							<div className="font-semibold mb-2 text-sm opacity-70">
								{message.role === "assistant" ? "Assistant" : "You"}
							</div>
							<div className="space-y-2">
								{message.parts.map((part, idx) => {
									if (part.type === "thinking") {
										return (
											<div
												key={idx}
												className="text-sm text-white/50 italic"
											>
												💭 Thinking: {part.content}
											</div>
										);
									}
									if (part.type === "text") {
										return (
											<div key={idx} className="text-white">
												{part.content}
											</div>
										);
									}
									return null;
								})}
							</div>
						</div>
					))}
				</div>
			)}
			<div className="rounded-2xl border border-white/20 bg-white/5 p-3 dark:border-white/15 dark:bg-white/5">
				<div className="relative">
					<div className="relative flex flex-col">
						<div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
							<Textarea
								id="ai-input-15"
								value={value}
								placeholder="What can I do for you?"
								className={cn(
									"min-h-[72px] w-full resize-none rounded-xl rounded-b-none border-none bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0",
								)}
								ref={textareaRef}
								onKeyDown={handleKeyDown}
								onChange={(e) => {
									setValue(e.target.value);
									adjustHeight();
								}}
								disabled={isLoading}
							/>
						</div>

						<div className="flex h-14 items-center rounded-b-xl bg-white/5">
							<div className="absolute bottom-3 left-3 right-3 flex w-[calc(100%-24px)] items-center justify-between">
								<div className="flex items-center gap-2">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="flex h-8 items-center gap-1 rounded-md pl-1 pr-2 text-xs dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
											>
												<AnimatePresence mode="wait">
													<motion.div
														key={selectedModel}
														initial={{
															opacity: 0,
															y: -5,
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														exit={{
															opacity: 0,
															y: 5,
														}}
														transition={{
															duration: 0.15,
														}}
														className="flex items-center gap-1"
													>
														{MODEL_ICONS[selectedModel]}
														{selectedModel}
														<ChevronDown className="h-3 w-3 opacity-50" />
													</motion.div>
												</AnimatePresence>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											className={cn(
												"min-w-[10rem]",
												"border-black/10 dark:border-white/10",
												"bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800",
											)}
										>
											{AI_MODELS.map((model) => (
												<DropdownMenuItem
													key={model}
													onSelect={() => setSelectedModel(model)}
													className="flex items-center justify-between gap-2"
												>
													<div className="flex items-center gap-2">
														{MODEL_ICONS[model] ?? (
															<Bot className="h-4 w-4 opacity-50" />
														)}
														<span>{model}</span>
													</div>
													{selectedModel === model && (
														<Check className="h-4 w-4 text-blue-500" />
													)}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
									<div className="mx-0.5 h-4 w-px bg-black/10 dark:bg-white/10" />
									<label
										className={cn(
											"cursor-pointer rounded-lg bg-black/5 p-2 text-black/40 transition-colors hover:bg-black/10 hover:text-black dark:bg-white/5 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0",
										)}
										aria-label="Attach file"
									>
										<input type="file" className="hidden" />
										<Paperclip className="h-4 w-4 transition-colors" />
									</label>
								</div>
								<button
									type="button"
									className={cn(
										"rounded-lg bg-black/5 p-2 dark:bg-white/5",
										"hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0",
									)}
									aria-label="Send message"
									disabled={!value.trim() || isLoading}
									onClick={handleSend}
								>
									<ArrowRight
										className={cn(
											"h-4 w-4 transition-opacity duration-200 dark:text-white",
											value.trim() && !isLoading ? "opacity-100" : "opacity-30",
										)}
									/>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

