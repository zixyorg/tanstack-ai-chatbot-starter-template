import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@tanstack-ai-chatbot-starter-template/api/routers/index";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();
