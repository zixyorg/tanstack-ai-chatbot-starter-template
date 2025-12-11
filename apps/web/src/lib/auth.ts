import { db, schema } from "@tanstack-ai-chatbot-starter-template/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
	anonymous,
	emailOTP,
	jwt,
	magicLink,
	organization,
} from "better-auth/plugins";

// Get environment variables
const getEnvVar = (key: string): string | undefined => {
	return process.env[key] || (import.meta as any).env?.[key];
};

let authInstance: ReturnType<typeof betterAuth> | null = null;

function getAuth() {
	if (authInstance) return authInstance;

	try {
		const plugins: any[] = [
			organization(),
			jwt(),
			magicLink({
				sendMagicLink: async ({ email, token, url }) => {
					console.log("Magic link:", { email, token, url });
					// TODO: Implement email sending (e.g., using Resend, SendGrid, etc.)
					// For now, just log it
				},
			}),
			emailOTP({
				sendVerificationOTP: async ({ email, otp, type }) => {
					console.log("Email OTP:", { email, otp, type });
					// TODO: Implement email sending
				},
			}),
			anonymous({
				onLinkAccount: async ({ anonymousUser, newUser }) => {
					// TODO: Migrate anonymous user data to authenticated user
					console.log("Linking account:", {
						anonymousUserId: anonymousUser.user.id,
						newUserId: newUser.user.id,
					});
				},
			}),
		];

		// Try to add reactStartCookies if available
		try {
			// Dynamic import for react-start plugin
			const reactStartModule = require("better-auth/react-start");
			if (reactStartModule?.reactStartCookies) {
				plugins.unshift(reactStartModule.reactStartCookies());
			}
		} catch {
			// reactStartCookies not available, continue without it
		}

		authInstance = betterAuth({
			database: drizzleAdapter(db, {
				provider: "pg",
				schema,
			}),
			trustedOrigins: [
				"http://localhost:3000",
				"http://localhost:5173",
				process.env.VITE_PUBLIC_API_URL || "",
			].filter(Boolean),
			session: {
				expiresIn: 60 * 60 * 24 * 365, // 1 year
				updateAge: 60 * 60 * 24, // 1 day
			},
			socialProviders: {
				google: {
					clientId: getEnvVar("GOOGLE_CLIENT_ID") || "",
					clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET") || "",
				},
				github: {
					clientId: getEnvVar("GITHUB_CLIENT_ID") || "",
					clientSecret: getEnvVar("GITHUB_CLIENT_SECRET") || "",
				},
			},
			plugins,
		});
		return authInstance;
	} catch (error) {
		console.error("Error initializing BetterAuth:", error);
		throw error;
	}
}

// Lazy getter - only initializes when accessed
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
	get(_target, prop) {
		const authInstance = getAuth();
		const value = (authInstance as any)[prop];
		return typeof value === "function" ? value.bind(authInstance) : value;
	},
});

// Helper function to get session from request
export async function getSession(request: Request) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});
		return session;
	} catch (error) {
		console.error("Error getting session:", error);
		return null;
	}
}

// Helper function to create anonymous session if no session exists
export async function getOrCreateSession(request: Request) {
	let session = await getSession(request);

	if (!session) {
		try {
			// Try to create anonymous session if anonymous plugin is available
			const authInstance = getAuth();
			if ((authInstance.api as any).signInAnonymous) {
				await (authInstance.api as any).signInAnonymous({
					headers: request.headers,
					returnHeaders: true,
				});

				// Get the session again after creating anonymous user
				session = await getSession(request);
			}
		} catch (error) {
			console.error("Error creating anonymous session:", error);
		}
	}

	return session;
}
