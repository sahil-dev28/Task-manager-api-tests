const { v4: uuidv4 } = require('uuid');

let tasks = [];

const getAll = () => [...tasks];

const findById = (id) => tasks.find((t) => t.id === id);

const getByStatus = (status) => tasks.filter((t) => t.status.includes(status));

const getPaginated = (page, limit) => {
  const offset = page * limit;
  return tasks.slice(offset, offset + limit);
};

const getStats = () => {
  const now = new Date();
  const counts = { todo: 0, in_progress: 0, done: 0 };
  let overdue = 0;

  tasks.forEach((t) => {
    if (counts[t.status] !== undefined) counts[t.status]++;
    if (t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now) {
      overdue++;
    }
  });

  return { ...counts, overdue };
};

const create = ({ title, description = '', status = 'todo', priority = 'medium', dueDate = null }) => {
  const task = {
    id: uuidv4(),
    title,
    description,
    status,
    priority,
    dueDate,
    // Set only through assign(); `create` never reads one off the body, the same
    // way it never accepts a completedAt.
    assignee: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
};

// The fields a client is allowed to write. Everything else on a task is
// server-owned: `id` and `createdAt` are identity and audit data, and
// `completedAt` is derived from the status transition, not supplied with it.
// Keeping the list here rather than in the route means the guarantee holds for
// every caller, including any future one that skips validation.
const WRITABLE_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];

const update = (id, fields) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const patch = {};
  for (const key of WRITABLE_FIELDS) {
    // `!== undefined` rather than a truthy check, so `{ dueDate: null }` still
    // clears a due date instead of being silently dropped.
    if (fields[key] !== undefined) patch[key] = fields[key];
  }

  const updated = { ...tasks[index], ...patch };
  tasks[index] = updated;
  return updated;
};

const remove = (id) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;

  tasks.splice(index, 1);
  return true;
};

const completeTask = (id) => {
  const task = findById(id);
  if (!task) return null;

  const updated = {
    ...task,
    priority: 'medium',
    status: 'done',
    completedAt: new Date().toISOString(),
  };

  const index = tasks.findIndex((t) => t.id === id);
  tasks[index] = updated;
  return updated;
};

// Assignment is an operation with its own endpoint, not a general field edit, so
// `assignee` stays off WRITABLE_FIELDS and this is the only way to set one. That
// keeps normalisation in one place: the store never holds a padded name.
const assign = (id, assignee) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated = { ...tasks[index], assignee: assignee.trim() };
  tasks[index] = updated;
  return updated;
};

const _reset = () => {
  tasks = [];
};

module.exports = {
  getAll,
  findById,
  getByStatus,
  getPaginated,
  getStats,
  create,
  update,
  remove,
  completeTask,
  assign,
  _reset,
};
