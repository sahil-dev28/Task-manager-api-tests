import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/server";

import { ApiError, NetworkError, request } from "./client";

const url = "http://localhost:3000/thing";

describe("request", () => {
  it("returns parsed JSON on 200", async () => {
    server.use(http.get(url, () => HttpResponse.json({ ok: true })));
    await expect(request<{ ok: boolean }>("/thing")).resolves.toEqual({ ok: true });
  });

  it("returns undefined for 204 with no body", async () => {
    server.use(http.delete(url, () => new HttpResponse(null, { status: 204 })));
    await expect(request<void>("/thing", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("throws ApiError carrying the status and the API error string", async () => {
    server.use(http.get(url, () => HttpResponse.json({ error: "Title is required" }, { status: 400 })));
    await expect(request("/thing")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Title is required",
    });
  });

  it("uses a fallback message when the error body is not JSON", async () => {
    server.use(http.get(url, () => new HttpResponse("<html>502</html>", { status: 502 })));
    await expect(request("/thing")).rejects.toMatchObject({
      status: 502,
      message: "Something went wrong",
    });
  });

  it("throws NetworkError when the request cannot reach the server", async () => {
    server.use(http.get(url, () => HttpResponse.error()));
    await expect(request("/thing")).rejects.toBeInstanceOf(NetworkError);
  });

  it("rethrows an external abort as AbortError, not NetworkError", async () => {
    server.use(http.get(url, async () => { await new Promise((r) => setTimeout(r, 50)); return HttpResponse.json({}); }));
    const controller = new AbortController();
    const promise = request("/thing", { signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toHaveProperty("name", "AbortError");
  });

  it("is an ApiError for 404 so the caller can take the G404 path", async () => {
    server.use(http.get(url, () => HttpResponse.json({ error: "Task not found" }, { status: 404 })));
    const err = await request("/thing").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
  });
});
