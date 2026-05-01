import fastifySession from "@fastify/session";
import prisma from "../lib/prisma.js";

export const PORT = process.env.PORT || 3000;

const cookieSecret =
	process.env.COOKIE_PASSWORD || "replace_this_with_a_very_long_cookie_secret_123";

export const COOKIE_PASSWORD =
	cookieSecret.length >= 32 ? cookieSecret : cookieSecret.padEnd(32, "_");

export const sessionStore = new fastifySession.MemoryStore();

sessionStore.on("error", (error) => {
	console.log("Session store error", error);
});

export const authenticate = async (email, password) => {
	if (!email || !password) {
		return null;
	}

	const user = await prisma.admin.findUnique({
		where: { email },
		select: { email: true, password: true },
	});

	if (!user || user.password !== password) {
		return null;
	}

	return { email: user.email };
};

