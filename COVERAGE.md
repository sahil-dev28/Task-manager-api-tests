# Test Coverage

Day 1 deliverable — coverage output for the test suite in `task-api/tests/`.
Updated after the Day 2 Part B fix (BUG-03) and the Part C `PATCH /tasks/:id/assign`
endpoint; see `BUGS.md`.

```bash
cd task-api
npm run coverage
```

Environment: Node v26.4.0, Jest 29.7.0, Supertest 6.3.4.

## Summary

```
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files        |   98.75 |    98.88 |   96.77 |   98.62 |
 src             |   86.66 |    83.33 |   66.66 |   85.71 |
  app.js         |   86.66 |    83.33 |   66.66 |   85.71 | 17-18
 src/routes      |     100 |      100 |     100 |     100 |
  tasks.js       |     100 |      100 |     100 |     100 |
 src/services    |     100 |      100 |     100 |     100 |
  taskService.js |     100 |      100 |     100 |     100 |
 src/utils       |     100 |      100 |     100 |     100 |
  validators.js  |     100 |      100 |     100 |     100 |
-----------------|---------|----------|---------|---------|-------------------

Test Suites: 2 passed, 2 total
Tests:       90 passed, 90 total
Snapshots:   0 total
Time:        0.928 s
```

98.75% statements, comfortably past the 80% bar in the brief. Business logic
(`taskService.js`), routing (`tasks.js`) and validation (`validators.js`) are
each at 100% across statements, branches, functions and lines.

## Two things worth explaining

**The only uncovered lines are the server bootstrap.** `app.js:17-18` is the
`app.listen()` call, guarded behind `if (require.main === module)`. Supertest
binds an ephemeral port itself and imports the exported `app` directly, so that
branch never runs under test — correctly so. Starting a real listener in a test
run buys no confidence and costs a flaky port. Nothing else in `src/` is
unexercised.

**"90 passed" does not mean "no bugs found."** 11 of those 90 are written with
Jest's `it.failing()` — 5 in `tests/unit/taskService.test.js`, 6 in
`tests/integration/tasks.test.js`. `it.failing` inverts the result: the test is
green only while the assertion inside it *fails*. Each one pins a real defect in
`src/`, asserting the behavior the code *should* have. They are the bug evidence,
not passing happy paths.

The practical consequence: when a bug gets fixed, its `it.failing` test turns
red, and flipping the marker back to `it` is what proves the fix. That is exactly
what happened to BUG-03 in Part B — its marker at
`tests/unit/taskService.test.js:188` is now a plain `it`, passing with its
assertions unchanged, which is why the unit count dropped from 6 to 5. See
`BUGS.md` for the defect write-ups.

The suite grew from 68 to 90 across Day 2. Part B added four tests: three unit
(`completedAt` non-writable, unknown keys dropped, `dueDate: null` still clears)
and one integration proving the fix at the HTTP boundary. Part C added eighteen
for `PATCH /tasks/:id/assign` — six unit on `assign()`, eleven integration
covering the happy path, reassignment, 404 and the four rejected bodies, and one
pinning that `PUT /tasks/:id` *cannot* set an assignee.

## Regenerating

The HTML report lands in `task-api/coverage/`, which `.gitignore` excludes, so
the text summary above is the committed artifact. To regenerate and browse it:

```bash
cd task-api
npm run coverage
open coverage/lcov-report/index.html
```
