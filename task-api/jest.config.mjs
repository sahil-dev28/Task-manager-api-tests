/**
 * This config is .mjs and not .ts on purpose: a TypeScript Jest config needs
 * ts-node installed just to read it, which is not worth an extra dependency.
 * The tests themselves are TypeScript and are type-checked by
 * `npm run check-types`.
 */
/** @type {import('jest').Config} */
export default {
	testEnvironment: "node",
	// The local watchman binary is broken (missing libfmt). Jest's own file
	// crawler is fine for a suite this size and works on any machine.
	watchman: false,
	roots: ["<rootDir>/tests"],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			// diagnostics off because type-checking is `npm run check-types`, which
			// runs tsc with "bundler" resolution. See tsconfig.jest.json for why.
			{ tsconfig: "<rootDir>/tsconfig.jest.json", diagnostics: false },
		],
	},
	moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
	collectCoverageFrom: ["src/**/*.ts"],
	coverageDirectory: "coverage",
};
