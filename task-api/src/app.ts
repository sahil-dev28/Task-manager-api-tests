import cors from "cors";
import express from "express";
import { env } from "@/env";

import { taskRouter } from "@/routes/taskRoutes";

const app = express();

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	}),
);

app.use(express.json());

app.get("/health", (_req, res) => {
	res.status(200).send("OK");
});

app.use("/tasks", taskRouter);

// No catch-all error handler here. Each controller sends its own error
// response.
//
// That is also the BUG-07 fix. express.json throws a SyntaxError with status
// 400 for bad JSON, and the old catch-all ignored err.status and sent 500 for
// everything. Express's default handler uses the status, so bad JSON gives 400.

const port = Number(process.env.PORT) || 3000;

const start = (): void => {
	app.listen(port, () => {
		console.log(`Task API running on port ${port}`);
	});
};

// The tests import this file with supertest. Listening on a port during a test
// run would leave the server open, so only start it outside tests.
if (env.NODE_ENV !== "test") {
	start();
}

export default app;
