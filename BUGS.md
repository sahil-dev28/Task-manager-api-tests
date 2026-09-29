# Bug Report

Day 2, Part A — defects found while writing the Day 1 test suite.

Ten distinct bugs, each pinned by a test in `task-api/tests/`. The tests use
Jest's `it.failing()`, which inverts the result: the test is green only while the
assertion inside it *fails*. That keeps the suite green today while documenting
exactly what each function *should* do. Fixing a bug turns its test red, and
flipping the marker from `it.failing` back to `it` is what proves the fix.

**[BUG-03](#bug-03--update-lets-a-client-overwrite-id-and-createdat) is fixed** —
that is Part B of the assignment, written up in place below. The other nine stand,
pinned by 11 remaining `it.failing` markers (5 unit, 6 integration). BUG-01 is
pinned three times — twice at the service level, once over HTTP — because it is
visible at both layers.

## Summary

| ID | Severity | Location | One line |
|----|----------|----------|----------|
| [BUG-01](#bug-01--pagination-offset-is-off-by-one-page) | High | `taskService.js:11-14` | `page=1` silently skips the first page |
| [BUG-02](#bug-02--status-filter-matches-substrings) | High | `taskService.js:9` | `?status=o` returns every task |
| [BUG-03](#bug-03--update-lets-a-client-overwrite-id-and-createdat) | High ✅ **fixed** | `taskService.js:46-53` | `PUT` can rewrite `id`, orphaning the task |
| [BUG-04](#bug-04--completing-a-task-resets-its-priority-to-medium) | Medium | `taskService.js:63-77` | `PATCH /complete` downgrades `high` to `medium` |
| [BUG-05](#bug-05--put-status-done-never-stamps-completedat) | Medium | `routes/tasks.js:40-52` | Same state, two different records |
| [BUG-06](#bug-06--status-and-pagination-are-mutually-exclusive) | Medium | `routes/tasks.js:11-28` | `page`/`limit` dropped when `status` is present |
| [BUG-07](#bug-07--malformed-json-returns-500-instead-of-400) | Medium | `app.js:9-12` | Client error reported as a server error |
| [BUG-08](#bug-08--getall-hands-out-the-live-task-objects) | Low | `taskService.js:5` | Shallow copy; callers can mutate the store |
| [BUG-09](#bug-09--title-is-trimmed-for-validation-but-stored-raw) | Low | `validators.js:5` + `taskService.js:31` | `"  x  "` validates as `"x"`, stores as `"  x  "` |
| [BUG-10](#bug-10--duedate-accepts-any-format-dateparse-understands) | Low | `validators.js:14, 30` | Error message promises ISO, check does not enforce it |

Plus one [documentation discrepancy](#not-a-code-bug--readme-documents-the-wrong-status-vocabulary) worth resolving before shipping.

---

## BUG-01 — Pagination offset is off by one page

**Severity:** High · **Where:** `task-api/src/services/taskService.js:11-14`

```js
const getPaginated = (page, limit) => {
  const offset = page * limit;        // should be (page - 1) * limit
  return tasks.slice(offset, offset + limit);
};
```

**Expected:** `getPaginated(1, 2)` returns the first two tasks. `GET /tasks?page=1&limit=2` returns the first page.

**Actual:** The offset is computed from a 1-based page number as if it were
0-based, so every request lands one page too far in. With the five-task fixture
(`T1`–`T5`):

| Call | Returns | Should return |
|------|---------|---------------|
| `getPaginated(1, 2)` | `['T3', 'T4']` | `['T1', 'T2']` |
| `getPaginated(2, 2)` | `['T5']` | `['T3', 'T4']` |
| `getPaginated(3, 2)` | `[]` | `['T5']` |

`T1` and `T2` are unreachable through the paginated endpoint at any page number
— page 0 would reach them, but the route coerces `parseInt('0') || 1` to `1`, so
a client cannot even ask for it. Silent data loss, not an error.

**Why it happens:** Page numbers in the API surface are 1-based (the assignment
documents `?page=1`), but `page * limit` is the formula for a 0-based index.
The mismatch never surfaced because there were no tests.

**How I found it:** Writing the happy-path unit test for `getPaginated`. I
expected `getPaginated(1, 2)` to give me the fixture's first two tasks and got
the third and fourth. Confirmed end-to-end with Supertest — `GET
/tasks?page=1&limit=2` has the same skew, so it is not a route-layer
compensation.

**Fix:**

```js
const offset = (page - 1) * limit;
```

Worth guarding `page < 1` too, so `?page=0` clamps to the first page rather than
producing a negative offset (`slice(-2, 0)` returns `[]`, another silent empty).

**Tests:** `tests/unit/taskService.test.js:81`, `:86`; `tests/integration/tasks.test.js:76`

---

## BUG-02 — Status filter matches substrings

**Severity:** High · **Where:** `task-api/src/services/taskService.js:9`

```js
const getByStatus = (status) => tasks.filter((t) => t.status.includes(status));
```

**Expected:** `getByStatus('todo')` returns only tasks whose status *is* `todo`.
An unknown status returns `[]`.

**Actual:** `String.prototype.includes` does a substring test, so any fragment
shared by a status matches it. The letter `o` appears in `todo`, `in_progress`
*and* `done`:

```
getByStatus('o')    -> ['T1','T2','T3','T4','T5']   (all five)
getByStatus('')     -> ['T1','T2','T3','T4','T5']   (all five)
getByStatus('don')  -> ['T5']
```

Over HTTP, `GET /tasks?status=o` returns the whole collection with a 200. The
exact-status cases happen to work — `'todo'.includes('todo')` is `true` — which
is why the bug hides behind the happy path.

**Why it happens:** `includes` on a string is a substring check; the intent was
equality. Easy to write if you are thinking of `Array.prototype.includes`, which
*is* an equality check, and the two share a name.

**Consequence beyond wrong results:** `?status=` is an unvalidated passthrough,
so a client can probe the collection with fragments. Not a security hole here
(everything is public), but it makes the filter's contract meaningless.

**How I found it:** I wrote the "returns an empty array when no task has that
status" edge case with `'archived'` and it passed. Then I asked what a
*partially* matching string would do, tried `'o'`, and got everything back.

**Fix:**

```js
const getByStatus = (status) => tasks.filter((t) => t.status === status);
```

Separately worth deciding whether an unknown status should be a `400` from the
route rather than a silent empty `200` — see "What I'd do next".

**Test:** `tests/unit/taskService.test.js:72`

---

## BUG-03 — `update` lets a client overwrite `id` and `createdAt`

**Severity:** High · **Where:** `task-api/src/services/taskService.js:46-53` · **Status:** fixed (Part B)

```js
const updated = { ...tasks[index], ...fields };
```

**Expected:** `PUT /tasks/:id` updates the mutable fields. Identity (`id`) and
audit data (`createdAt`) are server-owned and not client-writable.

**Actual:** `fields` is the raw request body, spread over the stored task with no
whitelist. Anything the client sends wins. Sending
`{ "id": "stolen", "createdAt": "2020-01-01T00:00:00.000Z", "bogus": "x" }`:

```json
{
  "id": "stolen",
  "title": "T1",
  "description": "",
  "status": "todo",
  "priority": "high",
  "dueDate": "2999-01-01T00:00:00.000Z",
  "completedAt": null,
  "createdAt": "2020-01-01T00:00:00.000Z",
  "bogus": "x"
}
```

The task is still in the store but `findById(originalId)` now returns
`undefined`. The client that just updated it cannot read it back, delete it, or
complete it — it is orphaned, and in a real store it would leak. Two updates
sending the same `id` would also collapse two tasks onto one key.

**Why it happens:** The validator (`validateUpdateTask`) checks the *shape* of
the fields it knows about but never rejects unknown ones, and the service
assumes it has been handed a safe object. Neither layer owns the question of
which fields are writable, so nobody enforces it.

**How I found it:** Writing the partial-update unit test, I noticed `update`
takes `fields` straight from `req.body` with no filtering, and asked what
happens if the body contains an `id`. Sent one, then tried to read the task back
by its original id and got `undefined`.

**This bug has a name.** It is *mass assignment* (CWE-915; OWASP API6:2019, folded
into API3:2023 Broken Object Property Level Authorization). It is the reason Rails
ships strong parameters — added after a mass-assignment hole on GitHub was used in
March 2012 to push a key into the `rails/rails` repo. Worth naming, because the
general lesson is more useful than the specific patch: **never spread a request
body onto a stored record.** Every mature framework has a primitive for this —
Rails `permit`, Google's `OUTPUT_ONLY` field behaviour, pydantic/zod strict schemas
— and they all amount to an allowlist.

---

### Fix (shipped — Part B)

`src/services/taskService.js`. `update` stops trusting its `fields` argument:

```js
const WRITABLE_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];

const update = (id, fields) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const patch = {};
  for (const key of WRITABLE_FIELDS) {
    if (fields[key] !== undefined) patch[key] = fields[key];
  }

  const updated = { ...tasks[index], ...patch };
  tasks[index] = updated;
  return updated;
};
```

Three decisions worth stating:

**The list lives in the service, not the route.** A check in `routes/tasks.js`
would protect the one caller that exists today. In the service it protects every
caller — including a future route, a bulk import, or a seed script that skips
validation entirely. It also sits next to the data it guards, so the next person
adding a field to `create` sees the list they need to update.

**`completedAt` is on the non-writable list, alongside `id` and `createdAt`.**
Those two are obvious — identity and audit data. `completedAt` is less obvious
and more interesting: it is *derived* state. The invariant is "`completedAt` is
non-null if and only if `status === 'done'`", and only the server can hold that.
A client able to write it directly can produce `{status: 'todo', completedAt:
'2020-01-01'}` — a task completed but not done, which nothing downstream can
interpret. The honest counter-case is backfilling imported history; that belongs
on a separate admin path, not on the public `PUT`.

**`!== undefined`, not a truthy check.** `if (fields[key])` would read more
cleanly and would silently make `{"dueDate": null}` impossible — clearing a due
date is a legitimate edit. There is a regression test pinning this specifically,
because it is exactly the kind of line a later "simplification" removes.

**Rejected alternative:** returning `400` for non-writable fields, the way Stripe
does for unknown parameters. It catches client typos immediately, which is a real
benefit. I did not take it because it breaks the most common client pattern there
is — `GET` a task, change one field, `PUT` the whole object back. That body
contains `id` and `createdAt` by construction, so a strict API would `400` its own
responses. Silently ignoring server-owned fields is what Rails and GitHub both
do, and it is the behaviour that makes the round trip work. The cost is real and
worth naming: a client sending `titel` gets a `200` and no hint. Given more time
I would split the two cases — ignore server-owned fields, `400` on genuinely
unknown keys — which is where Google's API guide lands.

**What this fix deliberately does not do:** BUG-05 is still broken. `PUT
{"status": "done"}` still leaves `completedAt: null`, because `update` applies the
field without deriving the timestamp. Fixing that here would have mixed two
different defects into one change. The allowlist is where that fix will go when
it happens, which is part of why this was the right first fix.

**Tests:** `tests/unit/taskService.test.js:188` (the original `it.failing`, now
passing unchanged — no assertion was rewritten to fit the fix), plus `:195`
(`completedAt`), `:201` (unknown key dropped), `:209` (the `null` regression
guard), and `tests/integration/tasks.test.js:245` proving it at the HTTP boundary.
All four new tests were written red before the fix; `taskService.js` holds 100%
statement, branch, function and line coverage after it.

---

## BUG-04 — Completing a task resets its priority to `medium`

**Severity:** Medium · **Where:** `task-api/src/services/taskService.js:63-77`

```js
const updated = {
  ...task,
  priority: 'medium',      // not asked for, not documented
  status: 'done',
  completedAt: new Date().toISOString(),
};
```

**Expected:** `PATCH /tasks/:id/complete` sets `status` and `completedAt` and
touches nothing else.

**Actual:** Every completed task comes back `priority: 'medium'`. A `high`
priority task silently becomes `medium` the moment it is finished.

**Why it happens:** `priority: 'medium'` is hardcoded in the spread. It reads
like a copy-paste from `create`'s default parameters, where `medium` genuinely
*is* the default for an unspecified priority — but here the task already has a
priority and it is being overwritten.

**Consequence:** It destroys history. "How many high-priority tasks did we ship
last sprint?" is unanswerable after the fact, because completion erases the
evidence. The task itself still looks correct, which makes this the kind of bug
that gets noticed months later in a report that does not add up.

**How I found it:** The happy-path test for `completeTask` asserted `status` and
`completedAt` and passed. Reading the implementation to decide what else to
assert, the hardcoded `priority` stood out as a field nothing in the brief asks
`complete` to change. Asserted the fixture's `high` priority survives; it does
not.

**Fix:** Delete the line.

```js
const updated = {
  ...task,
  status: 'done',
  completedAt: new Date().toISOString(),
};
```

**Test:** `tests/unit/taskService.test.js:255`

---

## BUG-05 — `PUT { status: 'done' }` never stamps `completedAt`

**Severity:** Medium · **Where:** `task-api/src/routes/tasks.js:40-52` (and `taskService.update`)

**Expected:** A task in `status: 'done'` has a `completedAt` timestamp,
regardless of which endpoint put it there.

**Actual:** Two routes can reach `done` and they produce different records:

| Route | `status` | `completedAt` |
|-------|----------|---------------|
| `PATCH /tasks/:id/complete` | `done` | ISO timestamp |
| `PUT /tasks/:id` with `{"status":"done"}` | `done` | `null` |

`PUT` accepts `status: 'done'` — the validator lists it as valid — and `update`
just spreads it in. Nothing derives `completedAt` from the status transition.

**Why it happens:** The completion *rule* lives in `completeTask`, not in the
data model. `update` is a generic field setter and does not know that `status`
carries an invariant with it. Any second path to `done` bypasses the rule by
construction.

**Consequence:** `GET /tasks/stats` counts `done` correctly, but any report
joining on `completedAt` silently undercounts. Worse, it is
*non-deterministic from the client's perspective* — the same intent expressed
two ways gives two different records.

**How I found it:** Writing the `PUT` integration tests, I worked through which
status values the validator accepts and realised `done` is one of them. Sent it,
checked the response, saw `completedAt: null` where `PATCH /complete` gives a
timestamp.

**Fix:** Move the invariant into `update`, so every write path enforces it:

```js
if (patch.status === 'done' && tasks[index].status !== 'done') {
  patch.completedAt = new Date().toISOString();
}
if (patch.status && patch.status !== 'done') {
  patch.completedAt = null;    // reopening clears the stamp
}
```

`completeTask` then becomes `update(id, { status: 'done' })`, and there is one
place where "done implies completedAt" is true.

That reopening clause is a product decision, not just a code one — I would
confirm it before shipping. Clearing the timestamp is the self-consistent
choice; keeping a stale one means `done: false, completedAt: <date>` records
exist, which is exactly the ambiguity this fix is meant to remove.

**Test:** `tests/integration/tasks.test.js:290`

---

## BUG-06 — `status` and pagination are mutually exclusive

**Severity:** Medium · **Where:** `task-api/src/routes/tasks.js:11-28`

```js
if (status) {
  const tasks = taskService.getByStatus(status);
  return res.json(tasks);            // early return — page and limit dropped
}

if (page !== undefined || limit !== undefined) { ... }
```

**Expected:** `GET /tasks?status=todo&page=1&limit=1` returns one `todo` task —
the filter narrows the set, pagination pages through what is left.

**Actual:** The `status` branch returns early, so `page` and `limit` are parsed
out of the query string and then thrown away. The request returns *all three*
`todo` tasks with a 200.

**Why it happens:** The two query features were written as alternative modes
rather than composable ones. The early `return` makes them exclusive, and
because the response is a bare array with no metadata, there is nothing in it to
signal that pagination was ignored.

**Consequence:** Silent, not loud. A client asking for page 1 of 40 filtered
tasks gets all 40 and no indication anything was dropped. The failure mode is a
UI that renders its whole dataset at once, which looks like a frontend bug.

**How I found it:** The README's own sample request combines them —
`curl "http://localhost:3000/tasks?status=pending&page=1&limit=10"` — so I wrote
the integration test for the documented combination. It returned the unpaginated
list.

**Fix:** Compose instead of branch — filter first, then slice:

```js
router.get('/', (req, res) => {
  const { status, page, limit } = req.query;

  let result = status ? taskService.getByStatus(status) : taskService.getAll();

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    result = result.slice(offset, offset + limitNum);
  }

  res.json(result);
});
```

This wants `getPaginated` to take a list rather than read the module-level
`tasks` directly, which is the cleaner shape anyway. See also "What I'd do
next" on returning pagination metadata — a bare array cannot tell a client
whether more pages exist.

**Test:** `tests/integration/tasks.test.js:66`

---

## BUG-07 — Malformed JSON returns 500 instead of 400

**Severity:** Medium · **Where:** `task-api/src/app.js:9-12`

```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
```

**Expected:** `POST /tasks` with a truncated body (`{"title": `) is a client
error — `400`, with a message saying the body could not be parsed.

**Actual:**

```
POST /tasks  Content-Type: application/json  body: {"title":
-> 500 {"error":"Internal server error"}
```

**Why it happens:** `express.json()` throws a `SyntaxError` that already carries
`err.status = 400` and `err.type = 'entity.parse.failed'`. The handler ignores
both and hardcodes `500` for every error that reaches it.

**Consequence:** Two real problems. Clients see a server error and retry — a
truncated body will never succeed, so the retry is pure load. And monitoring
sees 5xx alerts for what is a caller's bad request, so a genuine server incident
is harder to spot in the noise. The `console.error(err.stack)` for every
malformed request is the visible symptom — it is why running the test suite
prints a stack trace even when everything is green.

**How I found it:** Adding a malformed-body edge case to the `POST /tasks`
integration tests. I expected `400` and Supertest reported `500`.

**Fix:** Honour the status the error carries, and default to 500 only when there
isn't one:

```js
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err.stack);
  res.status(status).json({
    error: status === 400 ? 'Invalid request body' : 'Internal server error',
  });
});
```

Keeping the 5xx-only logging also stops client mistakes from filling the server
logs.

**Test:** `tests/integration/tasks.test.js:203`

---

## BUG-08 — `getAll` hands out the live task objects

**Severity:** Low · **Where:** `task-api/src/services/taskService.js:5`

```js
const getAll = () => [...tasks];
```

**Expected:** Callers cannot reach into the store through a read.

**Actual:** The spread copies the *array* but not the objects in it, so every
element is the same reference the store holds:

```js
service.getAll()[0].title = 'hijacked';
service.getAll()[0].title;     // 'hijacked'
```

A read mutates the store. Same for `findById`, which returns the object
directly.

**Why it happens:** `[...tasks]` is a shallow copy — a real and deliberate
defence against `getAll().push(...)` growing the store (that part works), but
it stops one level down.

**Severity note:** Low *today* because every consumer is inside this repo and
none of them mutate what they read, so there is no live symptom. It is listed
because the encapsulation is half-built: the code shows intent to protect the
store and the protection does not hold. It becomes a real bug the first time a
route mutates a task before serialising it, and that bug would be very hard to
trace — a write with no write in it.

**How I found it:** Writing the "returns a new array" test, which passes. The
natural follow-up — does it return *new tasks* — does not.

**Fix:** Either deep-copy on read (`tasks.map((t) => ({ ...t }))`), or
`Object.freeze` each task on write and treat updates as replacements, which the
service already does everywhere except `getAll`'s consumers. I would pick
freezing: it costs nothing per read and turns an accidental mutation into a
loud error instead of a silent write.

**Test:** `tests/unit/taskService.test.js:40`

---

## BUG-09 — Title is trimmed for validation but stored raw

**Severity:** Low · **Where:** `task-api/src/utils/validators.js:5` + `taskService.js:31`

```js
// validators.js — trims to test
if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') { ... }

// taskService.js — stores what arrived
const create = ({ title, ... }) => { const task = { title, ... }; }
```

**Expected:** `POST /tasks` with `{"title": "  padded  "}` stores `"padded"`.

**Actual:** Stores and returns `"  padded  "`. The validator trims only to
decide whether the title is empty, then discards the trimmed value.

**Why it happens:** The validator returns an error string or `null` — it has no
channel for returning a *normalised* body, so the cleanup it performs cannot
reach the service.

**Consequence:** `"task"` and `"task "` are different titles. Sorting, grouping
and any future uniqueness check all see two things where a user sees one.

**How I found it:** The whitespace-only title test (`{"title": "   "}` → 400)
passes, which told me `trim()` is on the validation path. I then checked whether
the trim survives into the stored record. It does not.

**Fix:** Normalise in the service, where the value is actually written:

```js
const create = ({ title, ... }) => {
  const task = { id: uuidv4(), title: title.trim(), ... };
```

Same in `update`'s whitelist from BUG-03. Putting it in the service rather than
the validator means every write path normalises, including any future one that
skips validation.

**Test:** `tests/integration/tasks.test.js:189`

---

## BUG-10 — `dueDate` accepts any format `Date.parse` understands

**Severity:** Low · **Where:** `task-api/src/utils/validators.js:14` and `:30`

```js
if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
  return 'dueDate must be a valid ISO date string';
}
```

**Expected:** The error message says ISO, so the check should enforce ISO 8601.

**Actual:** `Date.parse` accepts implementation-defined formats well beyond ISO:

```
POST /tasks  {"title":"x","dueDate":"January 1, 2020"}
-> 201, dueDate stored verbatim as "January 1, 2020"
```

The value is stored as the raw string, not normalised — so the store now holds a
mix of ISO strings and whatever else callers sent, while the documented task
shape says `"dueDate": "ISO string | null"`.

**Why it happens:** `Date.parse`'s non-ISO behaviour is explicitly
implementation-defined in the spec, so this is also a portability hazard: the
same input can parse on one runtime and not another. The validator conflates
"parseable" with "correctly formatted".

**Consequence:** Mild in isolation — `getStats` calls `new Date(t.dueDate)`,
which parses these back fine. It matters at the boundary: a client that assumes
the documented ISO shape and does `dueDate.slice(0, 10)` gets `"January 1"`.

**How I found it:** The unparseable-date test (`'not-a-date'` → 400) passes, so
I checked what the check actually admits. Tried a human-readable date expecting
a 400 and got a 201.

**Fix:** Validate the format, then store the normalised value:

```js
const parsed = body.dueDate ? new Date(body.dueDate) : null;
if (body.dueDate && (isNaN(parsed) || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(body.dueDate))) {
  return 'dueDate must be a valid ISO date string';
}
```

...and have `create` store `new Date(dueDate).toISOString()` so everything in the
store is one format. Alternatively, relax the *message* to "must be a valid
date" and normalise on write — that is a smaller change and equally honest. The
important half is that the store ends up consistent; which way the message goes
is a product call.

**Test:** `tests/integration/tasks.test.js:196`

---

## Not a code bug — README documents the wrong status vocabulary

Not test-pinned, but it would mislead the next person to touch this code, so
it belongs here.

`README.md`'s task shape and sample request document a different status
vocabulary than the code implements:

| Source | Statuses |
|--------|----------|
| `README.md` | `pending \| in-progress \| completed` |
| `ASSIGNMENT.md` and `src/utils/validators.js` | `todo \| in_progress \| done` |

The README's own sample request — `curl
"http://localhost:3000/tasks?status=pending&page=1&limit=10"` — returns `[]`
against the real API, because no task can ever have status `pending`. Note the
hyphen-vs-underscore difference too (`in-progress` vs `in_progress`), which is
the sort of thing that survives a careless copy-paste into a client.

`validators.js` is the source of truth and agrees with `ASSIGNMENT.md`, so the
README is the stale one. Fix is a README edit.

---

## Notes

**On severity.** I ranked by blast radius when the bug fires, not by how hard it
is to fix. BUG-01 and BUG-02 return wrong data with a 200 and no way for a
client to tell. BUG-03 can make a task permanently unreachable. Those three are
the ones I would not ship. BUG-08 is the one I would most expect a reviewer to
push back on as a non-bug — I have argued the case in its entry and would not
fight hard for it.

**What the bugs have in common.** Seven of the ten are silent — wrong result,
`200 OK`, no error anywhere. That pattern is what made tests the only practical
way to find them: nothing in the running system complains, and reading the code
alone would not tell you that `getPaginated(1, 2)` returns the wrong slice
without working the arithmetic by hand against a known fixture.

**What surprised me.** BUG-04 — `completeTask` hardcoding `priority: 'medium'`
— because it is not a mistake in logic, it is an extra line doing something
nobody asked for. Every other bug here is something the code gets *wrong*; that
one is something it does *in addition*. It is also the one most likely to have
been deliberate at some point, which is why I would ask about it before deleting
it rather than just fixing it.

**What I'd test next, given more time.**

- **Concurrency on the in-memory store.** Every mutation is read-modify-write
  with no locking. Two overlapping `PUT`s on the same task will lose one, and
  `remove`'s `splice` during an in-flight `update` would apply the write to the
  wrong index. Untested and, under the current single-process assumption,
  probably fine — but it is the thing I would want to know about before this
  sits behind a real load balancer.
- **Response contract for lists.** `GET /tasks` returns a bare array, so a
  paginated response carries no `total`, `page` or `hasMore`. A client cannot
  build a pager from it. That is a design gap rather than a bug, but it is the
  first thing I would change alongside fixing BUG-01 and BUG-06.
- **Unknown query parameters and unknown statuses.** `?status=nonsense` returns
  `200 []` today. Whether that should be a `400` is a product decision, and the
  test I write depends on the answer.

**Questions I'd ask before shipping.**

1. Is `?status=` meant to be an exact match or a search? BUG-02's fix assumes
   exact. If someone intended prefix search, the fix is different and the
   parameter should be renamed.
2. Should `PUT` be allowed to set `status: 'done'` at all, or should completion
   only happen through `PATCH /:id/complete`? BUG-05 has two valid fixes and
   this decides which.
3. Is this store ever going to be more than one process? It changes the answer
   on concurrency and on whether `id` needs to be a UUID at all.
