// env.ts validates process.env when it is imported, so each test sets the
// environment first and then re-imports the module.
const load = async () => {
	jest.resetModules();
	return import("@/env");
};

const ORIGINAL = { ...process.env };

afterEach(() => {
	process.env = { ...ORIGINAL };
	jest.resetModules();
});

describe("env", () => {
	it("falls back to the default origin when CORS_ORIGIN is unset", async () => {
		delete process.env.CORS_ORIGIN;
		const { env } = await load();
		expect(env.CORS_ORIGIN).toBe("http://localhost:3000");
	});

	it("treats an empty string the same as unset", async () => {
		process.env.CORS_ORIGIN = "";
		const { env } = await load();
		expect(env.CORS_ORIGIN).toBe("http://localhost:3000");
	});

	it("keeps a supplied origin", async () => {
		process.env.CORS_ORIGIN = "https://tasks.example.com";
		const { env } = await load();
		expect(env.CORS_ORIGIN).toBe("https://tasks.example.com");
	});

	// This is the point of validating the env: a bad variable fails at startup
	// instead of showing up as undefined inside a request.
	it("throws when CORS_ORIGIN is not a URL", async () => {
		process.env.CORS_ORIGIN = "not-a-url";
		await expect(load()).rejects.toThrow(/Invalid environment: CORS_ORIGIN/);
	});

	it("throws when NODE_ENV is outside the known set", async () => {
		process.env.NODE_ENV = "staging";
		await expect(load()).rejects.toThrow(/Invalid environment: NODE_ENV/);
	});

	it("defaults NODE_ENV to development when unset", async () => {
		delete process.env.NODE_ENV;
		const { env } = await load();
		expect(env.NODE_ENV).toBe("development");
	});
});
