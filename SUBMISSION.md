# Submission Note

Branch: `typescript-rewrite`

**What's here:** the Task Manager API, rewritten in TypeScript. 112 tests, 98.72%
statement coverage. Ten bugs documented in [BUGS.md](./BUGS.md), **all ten fixed**,
and `PATCH /tasks/:id/assign` added. Coverage output in
[COVERAGE.md](./COVERAGE.md).

The full reasoning for every bug and design decision lives in BUGS.md. This is the
short version.

## Setup

Unchanged from the brief:

```bash
cd task-api
npm install
npm start        # runs on port 3000
npm test
npm run coverage
```

Two scripts were added: `npm run check-types` (`tsc --noEmit`) and `npm run check`
(Biome lint + format). `npm run build` bundles to `dist/` via tsdown if you want a
production artifact, but `npm start` runs the TypeScript directly through `tsx`, so
it works straight after `npm install` with no build step.

## The TypeScript rewrite

The assignment shipped as four JavaScript files. I rewrote it in TypeScript using
the layout I use on my own projects, because "reads unfamiliar code and ships
something new with confidence" is easier to demonstrate in a codebase that is
actually structured.

```
task-api/src/
  app.ts                            cors -> json -> /health -> router
  env.ts                            Zod-validated, typed process.env
  schema/task.ts                    the task vocabulary + Task, TaskStatus, CreateTaskInput
  services/taskService.ts           the in-memory store
  utils/validators.ts               request validation
  utils/pagination.ts               one page out of a filtered list
  middleware/validationMiddleware.ts  validateBody(validator)
  controller/taskController.ts      handlers
  routes/taskRoutes.ts              wiring
```

**Validation moved to the edge.** `validateBody(validator)` runs in the route, so a
handler only ever sees a body that already passed. Controllers no longer re-check
shape.

**No catch-all error middleware.** Each controller answers for its own failures.
That is a deliberate choice, and it is also the BUG-07 fix: `express.json()` throws
a `SyntaxError` carrying status 400, and the old catch-all rewrote every failure to
500.

**Typed environment.** `env.ts` validates `process.env` once at startup and is the
only module that reads it, apart from `PORT` in `app.ts`. A malformed variable fails
immediately instead of surfacing as `undefined` mid-request.

**Strict TypeScript**, including `verbatimModuleSyntax`, `noUncheckedIndexedAccess`
and `noUnusedLocals`, with `@/*` path aliases. Express 4 to 5, and `uuid` dropped in
favour of `node:crypto`'s `randomUUID` — one less dependency for the same output.

**The stack stayed honest to the brief.** Still an in-memory store, still no
database, still Jest and Supertest, still `/tasks` returning bare task objects in
the documented nine-key shape. Nothing in `ASSIGNMENT.md` stopped being true,
including the setup commands.

**All ten bugs are fixed.** Every `it.failing` marker is a plain `it`, passing with
its assertions unchanged. Three fixes fell out of the restructure rather than being
written: trimming the title once in the store retires BUG-09, dropping the catch-all
retires BUG-07, and making filtering and paging separate composable steps retires
BUG-06. Each fix carries a `BUG-0n` comment, so `grep -rn "BUG-" task-api/src` lists
all ten.

The original JavaScript is preserved in git history at commit `00e6324` —
`git show 00e6324:task-api/src/services/taskService.js` — so the before/after is a
`git diff` away. BUGS.md quotes every "before" snippet inline regardless.

**What I would flag to a reviewer.** Two of the questions at the bottom of this
note are now answered by the code rather than by me: `?status=` is an exact match,
and `PUT /tasks/:id` stamps `completedAt` when it sets `status: 'done'` rather than
reserving completion for `PATCH /:id/complete`. Both are still worth confirming —
I picked the option I would defend, not the only defensible one.

## What surprised me

`completeTask` hardcoded `priority: 'medium'`, so finishing a task silently
downgraded how urgent it was. Every other bug I found is the code getting
something *wrong*; this one was the code doing something extra that nobody asked
for. I removed the line, but it is the one fix I would still raise in review
rather than assume — deliberate-looking code deserves a question.

The wider surprise: seven of the ten bugs return wrong data with a `200` and
nothing in the logs. Reading the code alone would not have caught most of them —
you have to run the arithmetic against a known fixture.

## What I'd test next

- **Concurrency on the in-memory store.** Every mutation is read-modify-write
  with no locking, so two overlapping `PUT`s lose one. Fine under the current
  single-process assumption; worth knowing before this sits behind a load
  balancer.
- **The list response contract.** `GET /tasks` returns a bare array, so a
  paginated response carries no `total` or `page`. A client cannot build a pager
  from it. A design gap rather than a bug, and I left the contract alone because
  `ASSIGNMENT.md` documents it — but it is the first thing I would change next.
- **The assign endpoint's gaps.** No user store to validate a name against, no
  unassign path, and no record of who assigned or when.

## Questions before shipping

1. Is `?status=` meant to be an exact match or a search? I fixed BUG-02 as exact.
   If prefix search was intended, the fix is different and the parameter wants a
   clearer name.
2. Should `PUT /tasks/:id` be able to set `status: 'done'` at all, or should
   completion only happen through `PATCH /:id/complete`? BUG-05 had two valid
   fixes; I took the one that stamps `completedAt` on the transition, so both
   routes produce the same record. Restricting `PUT` instead is equally
   defensible.
3. Is `assignee` free text, or should it reference a real user? I validated shape
   only — non-empty string — because there is no user store to check against.
4. Should reassignment be audited? It currently overwrites silently, which is
   right for a task tracker and wrong for anything with accountability
   requirements.

## Frontend

A React client for the API lives in `web/`. It is additive: nothing under `task-api/`
changed except `CORS_ORIGIN` in `.env.example`, which now points at the client's dev
server. The backend deliverables above are unchanged.

```bash
cd task-api && cp .env.example .env && npm start   # API on :3000, CORS open to :5173
cd web && npm install && npm run dev                # client on :5173
cd web && npm test                                  # 162 tests, Vitest + MSW
```

**What it does:** the read path. Stat tiles with an overdue warning, a status filter and
paging held in the URL so a reload or a shared link restores the view, a task list with
first-load skeletons, three distinct empty states and a load-error state, light and dark
themes, a keyboard-navigable filter, screen-reader names on every card, and live-region
announcements for list changes. The three write actions on screen — New task, Add sample
tasks, and the complete checkbox — are deliberately inert. The write path, the detail
sheet, and offline handling are specified in `web/DESIGN.md` but not built.

**Stack:** Vite, React, TypeScript, Tailwind v4, TanStack Query, React Router.

**One design note worth knowing:** the pager is Previous / Next with no page count. The
API returns bare arrays with no `total`, so the client fetches page N+1 alongside page N
and enables Next only if that lookahead came back non-empty — exact, at the cost of one
extra request, rather than a guessed "of N".
