# Test Coverage

Coverage for the suite in `task-api/tests/`, run against the TypeScript rewrite
described in [SUBMISSION.md](./SUBMISSION.md).

```bash
cd task-api
npm install
npm run coverage
```

Environment: node v26.4.0, typescript 6.0.3, jest 30.5.2, ts-jest 29.4.14,
supertest 7.3.0, express 5.2.1.

## Summary

```
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   98.72 |    96.39 |   94.87 |   98.48 |                   
 src                      |   89.28 |       75 |      60 |   89.28 |                   
  app.ts                  |   82.35 |       75 |   33.33 |   82.35 | 34-35,43          
  env.ts                  |     100 |       75 |     100 |     100 | 34                
 src/controller           |     100 |    95.45 |     100 |     100 |                   
  taskController.ts       |     100 |    95.45 |     100 |     100 | 63                
 src/middleware           |     100 |       75 |     100 |     100 |                   
  validationMiddleware.ts |     100 |       75 |     100 |     100 | 17                
 src/routes               |     100 |      100 |     100 |     100 |                   
  taskRoutes.ts           |     100 |      100 |     100 |     100 |                   
 src/schema               |     100 |      100 |     100 |     100 |                   
  task.ts                 |     100 |      100 |     100 |     100 |                   
 src/services             |     100 |      100 |     100 |     100 |                   
  taskService.ts          |     100 |      100 |     100 |     100 |                   
 src/utils                |     100 |      100 |     100 |     100 |                   
  pagination.ts           |     100 |      100 |     100 |     100 |                   
  validators.ts           |     100 |      100 |     100 |     100 |                   
--------------------------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       112 passed, 112 total
Snapshots:   0 total
Time:        4.933 s
Ran all test suites.
```

98.72% statements against the brief's 80% bar. The business logic
(`taskService.ts`), validation (`validators.ts`), paging (`pagination.ts`),
routing (`taskRoutes.ts`), the task vocabulary (`task.ts`) and the typed
environment (`env.ts`) are each at 100% statements.

## What is not covered, and why

**`app.ts:34-35,43` — the server bootstrap.** The `start()` body and the
`NODE_ENV !== "test"` branch that calls it. Supertest imports the exported `app`
and binds its own ephemeral port, so a real listener never starts under test.
Covering it would mean binding a real port for no added confidence.

**`taskController.ts:63`, `validationMiddleware.ts:17`, `env.ts:34` — three
defensive branches.** The first two are `?? {}` fallbacks for a body that is
`undefined`, which `express.json()` makes unreachable here; they are cheap
insurance for a future route mounted without the JSON parser. The third is the
message-formatting branch for a Zod issue with an empty path, which the current
schema cannot produce.

Everything else is exercised, including all seven controller `catch` blocks. This
layout has no catch-all error middleware — each controller answers for its own
failures — so those paths are proved by spying on the store and forcing it to
throw, in the `controller error handling` block of the integration suite.

## Suite shape

112 tests across three files: unit tests on the store (`taskService.test.ts`),
unit tests on the typed environment (`env.test.ts`), and HTTP tests through
Supertest (`tasks.test.ts`).

The Day 1 suite was 68 tests; Day 2 took it to 90. The remaining growth is not new
surface — it is the same behaviour with every bug fixed:

- **11 `it.failing` markers became plain `it`.** Those were the nine bugs still
  open at the end of Day 2. `it.failing` is green only while its assertion fails,
  so flipping each marker is what proves the fix.
- **8 error-handling tests** for the per-controller `catch` blocks above.
- **6 tests for `env.ts`**, which did not exist before: defaults, empty string
  treated as unset, and the startup throw on a malformed variable. That throw is
  the entire reason to validate an environment, so it is worth pinning.
- **6 added edge cases**: a `/health` check, title trimming at the store level, a
  full-ISO `dueDate` accepted, the second page of a *filtered* list (the BUG-06 fix
  composes filtering and paging, so both pages are worth pinning), priority
  preserved through `PATCH /complete`, and `completedAt` left alone when an
  already-done task is updated.

One previously-passing test changed rather than moved. `adds the task to the store`
asserted `toBe` between `findById()` and `getAll()[0]` — object *identity*. The
BUG-08 fix hands out copies, which makes identity impossible by design, so the
assertion is now `toEqual`. It had been asserting the implementation detail that
BUG-08 exists to remove.

## Regenerating

`task-api/coverage/` is gitignored, so the text summary above is the committed
artifact.

```bash
cd task-api
npm run coverage
open coverage/lcov-report/index.html
```
