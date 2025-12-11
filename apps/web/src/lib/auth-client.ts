import {
	anonymousClient,
	emailOTPClient,
	magicLinkClient,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getEnvVar = (key: string): string => {
	return (import.meta as any).env?.[key] || process.env[key] || "";
};

export const authClient = createAuthClient({
	baseURL: getEnvVar("VITE_PUBLIC_API_URL") || "http://localhost:3000",
	plugins: [
		magicLinkClient(),
		anonymousClient(),
		organizationClient(),
		emailOTPClient(),
	],
});

