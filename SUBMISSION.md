# Submission Note

Branch: `day-2-bug-report-fix-and-assign-endpoint`

**What's here:** 90 tests (68 from Day 1, 22 added on Day 2), 98.75% statement
coverage. Ten bugs documented in [BUGS.md](./BUGS.md), one of them fixed, and
`PATCH /tasks/:id/assign` added. Coverage output in [COVERAGE.md](./COVERAGE.md).

The full reasoning for every bug and design decision lives in BUGS.md. This is
the short version.

## What surprised me

`completeTask` hardcodes `priority: 'medium'`, so finishing a task silently
downgrades how urgent it was. Every other bug I found is the code getting
something *wrong*; this one is the code doing something extra that nobody asked
for. That's why I'd ask about it before deleting the line rather than just
fixing it.

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
  from it. A design gap rather than a bug, but the first thing I'd change
  alongside fixing pagination.
- **The assign endpoint's gaps.** No user store to validate a name against, no
  unassign path, and no record of who assigned or when.

## Questions before shipping

1. Is `?status=` meant to be an exact match or a search? My proposed fix for
   BUG-02 assumes exact. If prefix search was intended, the fix is different and
   the parameter wants a clearer name.
2. Should `PUT /tasks/:id` be able to set `status: 'done'` at all, or should
   completion only happen through `PATCH /:id/complete`? BUG-05 has two valid
   fixes and this decides which.
3. Is `assignee` free text, or should it reference a real user? I validated shape
   only — non-empty string — because there is no user store to check against.
4. Should reassignment be audited? It currently overwrites silently, which is
   right for a task tracker and wrong for anything with accountability
   requirements.
