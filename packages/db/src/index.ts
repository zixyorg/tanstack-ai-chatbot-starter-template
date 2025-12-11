import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";
import * as authSchema from "./auth-schema";

neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true

const databaseUrl = process.env.DATABASE_URL || "";
if (!databaseUrl) {
	console.warn(
		"⚠️  DATABASE_URL is not set. Database operations will fail. Please set DATABASE_URL in your .env file."
	);
}

const sql = neon(databaseUrl || "postgresql://localhost:5432/temp");
export const db = drizzle(sql);

// Export auth schema
export const schema = {
  ...authSchema,
};

export * from "./auth-schema";
