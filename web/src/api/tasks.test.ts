import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { makeTask } from "@/test/fixtures";
import { server } from "@/test/server";

import { assignTask, completeTask, createTask, deleteTask, getStats, listTasks, updateTask } from "./tasks";

const base = "http://localhost:3000";

describe("listTasks", () => {
  it("omits every parameter when none are given", async () => {
    let seen = "";
    server.use(http.get(`${base}/tasks`, ({ request }) => {
      seen = new URL(request.url).search;
      return HttpResponse.json([]);
    }));
    await listTasks({});
    expect(seen).toBe("");
  });

  it("sends status, page and limit when given", async () => {
    let seen: URLSearchParams | null = null;
    server.use(http.get(`${base}/tasks`, ({ request }) => {
      seen = new URL(request.url).searchParams;
      return HttpResponse.json([]);
    }));
    await listTasks({ status: "in_progress", page: 2, limit: 10 });
    expect(seen!.get("status")).toBe("in_progress");
    expect(seen!.get("page")).toBe("2");
    expect(seen!.get("limit")).toBe("10");
  });

  it("omits status when it is null, which is the All filter", async () => {
    let seen: URLSearchParams | null = null;
    server.use(http.get(`${base}/tasks`, ({ request }) => {
      seen = new URL(request.url).searchParams;
      return HttpResponse.json([]);
    }));
    await listTasks({ status: null, page: 1, limit: 10 });
    expect(seen!.has("status")).toBe(false);
  });

  it("returns the bare array the API sends", async () => {
    const tasks = [makeTask(), makeTask()];
    server.use(http.get(`${base}/tasks`, () => HttpResponse.json(tasks)));
    await expect(listTasks({ page: 1, limit: 10 })).resolves.toEqual(tasks);
  });
});

describe("mutations", () => {
  it("createTask posts the input and returns the created task", async () => {
    const created = makeTask({ title: "Ship it" });
    let body: unknown;
    server.use(http.post(`${base}/tasks`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(created, { status: 201 });
    }));
    await expect(createTask({ title: "Ship it" })).resolves.toEqual(created);
    expect(body).toEqual({ title: "Ship it" });
  });

  it("updateTask puts to /tasks/:id", async () => {
    const task = makeTask({ priority: "high" });
    server.use(http.put(`${base}/tasks/abc`, () => HttpResponse.json(task)));
    await expect(updateTask("abc", { priority: "high" })).resolves.toEqual(task);
  });

  it("completeTask patches /tasks/:id/complete with no body", async () => {
    const task = makeTask({ status: "done" });
    server.use(http.patch(`${base}/tasks/abc/complete`, () => HttpResponse.json(task)));
    await expect(completeTask("abc")).resolves.toEqual(task);
  });

  it("assignTask patches /tasks/:id/assign with the assignee", async () => {
    const task = makeTask({ assignee: "Priya Sharma" });
    let body: unknown;
    server.use(http.patch(`${base}/tasks/abc/assign`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(task);
    }));
    await expect(assignTask("abc", "Priya Sharma")).resolves.toEqual(task);
    expect(body).toEqual({ assignee: "Priya Sharma" });
  });

  it("deleteTask resolves with nothing on 204", async () => {
    server.use(http.delete(`${base}/tasks/abc`, () => new HttpResponse(null, { status: 204 })));
    await expect(deleteTask("abc")).resolves.toBeUndefined();
  });
});

describe("getStats", () => {
  it("returns the four counts", async () => {
    const stats = { todo: 7, in_progress: 3, done: 12, overdue: 2 };
    server.use(http.get(`${base}/tasks/stats`, () => HttpResponse.json(stats)));
    await expect(getStats()).resolves.toEqual(stats);
  });
});
