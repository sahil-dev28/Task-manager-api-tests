const request = require('supertest');
const app = require('../../src/app');
const service = require('../../src/services/taskService');

const PAST = '2020-01-01T00:00:00.000Z';
const FUTURE = '2999-01-01T00:00:00.000Z';
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Same fixture as the unit suite: 3 todo, 1 in_progress, 1 done.
// T2 and T5 are past due; T5 is done, so only T2 is overdue.
const seed = () => ({
  t1: service.create({ title: 'T1', status: 'todo', priority: 'high', dueDate: FUTURE }),
  t2: service.create({ title: 'T2', status: 'todo', priority: 'low', dueDate: PAST }),
  t3: service.create({ title: 'T3', status: 'in_progress', priority: 'medium' }),
  t4: service.create({ title: 'T4' }),
  t5: service.create({ title: 'T5', status: 'done', priority: 'high', dueDate: PAST }),
});

const titles = (res) => res.body.map((t) => t.title);

beforeEach(() => {
  service._reset();
});

describe('GET /tasks', () => {
  it('returns 200 and an empty array when there are no tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns every task in insertion order', async () => {
    seed();
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(titles(res)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5']);
  });

  it('returns the full documented task shape', async () => {
    seed();
    const res = await request(app).get('/tasks');
    expect(Object.keys(res.body[0]).sort()).toEqual(
      ['completedAt', 'createdAt', 'description', 'dueDate', 'id', 'priority', 'status', 'title'].sort()
    );
  });
});

describe('GET /tasks?status=', () => {
  it('returns only the tasks with the requested status', async () => {
    seed();
    const res = await request(app).get('/tasks?status=todo');
    expect(res.status).toBe(200);
    expect(titles(res)).toEqual(['T1', 'T2', 'T4']);
  });

  it('returns an empty array when no task has that status', async () => {
    seed();
    const res = await request(app).get('/tasks?status=archived');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // BUG: status and pagination are mutually exclusive branches in the route,
  // so page and limit are silently dropped whenever status is present.
  it.failing('applies pagination to a filtered list', async () => {
    seed();
    const res = await request(app).get('/tasks?status=todo&page=1&limit=1');
    expect(titles(res)).toEqual(['T1']);
  });
});

describe('GET /tasks?page=&limit=', () => {
  // BUG: the offset is page * limit instead of (page - 1) * limit, so the first
  // page of a paginated list is unreachable over HTTP.
  it.failing('returns the first page for page 1', async () => {
    seed();
    const res = await request(app).get('/tasks?page=1&limit=2');
    expect(titles(res)).toEqual(['T1', 'T2']);
  });

  it('falls back to page 1 and limit 10 when either is not a number', async () => {
    seed();
    const garbage = await request(app).get('/tasks?page=abc&limit=xyz');
    const explicit = await request(app).get('/tasks?page=1&limit=10');
    expect(garbage.status).toBe(200);
    expect(titles(garbage)).toEqual(titles(explicit));
  });

  it('returns an empty array for a page past the end of the list', async () => {
    seed();
    const res = await request(app).get('/tasks?page=99&limit=10');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /tasks/stats', () => {
  it('returns zeroed counts when there are no tasks', async () => {
    const res = await request(app).get('/tasks/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ todo: 0, in_progress: 0, done: 0, overdue: 0 });
  });

  it('counts tasks by status and reports overdue ones', async () => {
    seed();
    const res = await request(app).get('/tasks/stats');
    expect(res.body).toEqual({ todo: 3, in_progress: 1, done: 1, overdue: 1 });
  });
});

describe('POST /tasks', () => {
  it('returns 201 with the created task and default field values', async () => {
    const res = await request(app).post('/tasks').send({ title: 'write tests' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'write tests',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      completedAt: null,
    });
    expect(res.body.id).toMatch(UUID);
    expect(res.body.createdAt).toMatch(ISO);
  });

  it('keeps every field the client supplied', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'full',
      description: 'details',
      status: 'in_progress',
      priority: 'high',
      dueDate: FUTURE,
    });
    expect(res.body).toMatchObject({
      title: 'full',
      description: 'details',
      status: 'in_progress',
      priority: 'high',
      dueDate: FUTURE,
    });
  });

  it('persists the task so it comes back from GET /tasks', async () => {
    const created = await request(app).post('/tasks').send({ title: 'stored' });
    const list = await request(app).get('/tasks');
    expect(list.body).toHaveLength(1);
    expect(list.body[0].id).toBe(created.body.id);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/tasks').send({ description: 'no title' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('title is required and must be a non-empty string');
  });

  it('returns 400 for a whitespace-only title', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for a non-string title', async () => {
    const res = await request(app).post('/tasks').send({ title: 42 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an unknown status', async () => {
    const res = await request(app).post('/tasks').send({ title: 'x', status: 'archived' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('status must be one of: todo, in_progress, done');
  });

  it('returns 400 for an unknown priority', async () => {
    const res = await request(app).post('/tasks').send({ title: 'x', priority: 'urgent' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('priority must be one of: low, medium, high');
  });

  it('returns 400 for an unparseable dueDate', async () => {
    const res = await request(app).post('/tasks').send({ title: 'x', dueDate: 'not-a-date' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('dueDate must be a valid ISO date string');
  });

  // BUG: the validator trims the title only to test it, then the service stores
  // the raw string, so padding survives into the response and the store.
  it.failing('trims surrounding whitespace from the title', async () => {
    const res = await request(app).post('/tasks').send({ title: '  padded  ' });
    expect(res.body.title).toBe('padded');
  });

  // BUG: the error message promises an ISO date string but the check is
  // Date.parse, which happily accepts loose human formats.
  it.failing('rejects a dueDate that is not an ISO string', async () => {
    const res = await request(app).post('/tasks').send({ title: 'x', dueDate: 'January 1, 2020' });
    expect(res.status).toBe(400);
  });

  // BUG: express.json throws a SyntaxError carrying status 400, but the error
  // handler ignores err.status and answers 500 for every failure.
  it.failing('returns 400 for a malformed JSON body', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title": ');
    expect(res.status).toBe(400);
  });
});

describe('PUT /tasks/:id', () => {
  it('applies a partial update and leaves the other fields alone', async () => {
    const { t1 } = seed();
    const res = await request(app).put(`/tasks/${t1.id}`).send({ title: 'renamed' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: 'renamed', status: 'todo', priority: 'high' });
  });

  it('persists the update', async () => {
    const { t1 } = seed();
    await request(app).put(`/tasks/${t1.id}`).send({ status: 'in_progress' });
    const list = await request(app).get('/tasks?status=in_progress');
    expect(titles(list)).toContain('T1');
  });

  it('returns 404 for an id that does not exist', async () => {
    seed();
    const res = await request(app).put('/tasks/no-such-id').send({ title: 'renamed' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });

  it('returns 400 for an empty title', async () => {
    const { t1 } = seed();
    const res = await request(app).put(`/tasks/${t1.id}`).send({ title: '  ' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for a non-string title', async () => {
    const { t1 } = seed();
    const res = await request(app).put(`/tasks/${t1.id}`).send({ title: 42 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an unknown status', async () => {
    const { t1 } = seed();
    const res = await request(app).put(`/tasks/${t1.id}`).send({ status: 'archived' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an unknown priority', async () => {
    const { t1 } = seed();
    const res = await request(app).put(`/tasks/${t1.id}`).send({ priority: 'urgent' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an unparseable dueDate', async () => {
    const { t1 } = seed();
    const res = await request(app).put(`/tasks/${t1.id}`).send({ dueDate: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  // BUG: completing a task through PUT leaves completedAt null, so the same
  // state reached two different ways produces two different records.
  it.failing('stamps completedAt when the status is set to done', async () => {
    const { t1 } = seed();
    const res = await request(app).put(`/tasks/${t1.id}`).send({ status: 'done' });
    expect(res.body.completedAt).toMatch(ISO);
  });
});

describe('DELETE /tasks/:id', () => {
  it('returns 204 with an empty body and removes the task', async () => {
    const { t3 } = seed();
    const res = await request(app).delete(`/tasks/${t3.id}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    const list = await request(app).get('/tasks');
    expect(titles(list)).toEqual(['T1', 'T2', 'T4', 'T5']);
  });

  it('returns 404 for an id that does not exist', async () => {
    seed();
    const res = await request(app).delete('/tasks/no-such-id');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });
});

describe('PATCH /tasks/:id/complete', () => {
  it('marks the task done and stamps completedAt', async () => {
    const { t3 } = seed();
    const res = await request(app).patch(`/tasks/${t3.id}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.completedAt).toMatch(ISO);
  });

  it('returns 404 for an id that does not exist', async () => {
    seed();
    const res = await request(app).patch('/tasks/no-such-id/complete');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });
});
