type Session = {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image: string | null;
		createdAt: Date;
		updatedAt: Date;
		isAnonymous?: boolean | null;
	};
	session: {
		id: string;
		expiresAt: Date;
		token: string;
		ipAddress: string | null;
		userAgent: string | null;
		userId: string;
		createdAt: Date;
		updatedAt: Date;
	};
} | null;

export async function createContext({
	req,
	session,
}: {
	req: Request;
	session?: Session;
}) {
	return {
		session: session ?? null,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
