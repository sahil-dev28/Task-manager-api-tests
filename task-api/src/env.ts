import "dotenv/config";
import { z } from "zod";

/**
 * The only file that reads process.env, apart from PORT in app.ts. Everything
 * else imports this typed `env`, so a missing or wrong variable fails once at
 * startup instead of showing up as undefined inside a request.
 */
const envSchema = z.object({
	CORS_ORIGIN: z.url().default("http://localhost:3000"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
});

export type Env = z.infer<typeof envSchema>;

// A variable that is unset and one set to "" mean the same thing here, so drop
// the empty ones and let the defaults apply instead of failing the format check.
const present = Object.fromEntries(
	Object.entries(process.env).filter(([, value]) => value !== ""),
);

const parsed = envSchema.safeParse(present);

if (!parsed.success) {
	const details = parsed.error.issues
		.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
		.join("; ");
	throw new Error(`Invalid environment: ${details}`);
}

export const env: Env = parsed.data;
