import express, { Router } from 'express';
import { ApiError } from './errors.js';
import { parseFilters, parsePositiveId, validateTaskDraft } from './validation.js';

function listTasks(req, res, store) {
  const { searchParams } = new URL(req.originalUrl, 'http://localhost');
  const filters = parseFilters(searchParams);
  const data = store.listTasks(filters);
  res.status(200).json({ data, meta: { total: data.length, filters } });
}

function createTask(req, res, store) {
  const value = validateTaskDraft(req.body, store.listCategories());
  const task = store.addTask(value);
  res.location(`/api/tasks/${task.id}`).status(201).json({ data: task });
}

export function createRouter(store) {
  const router = Router({ caseSensitive: true });
  router.get('/health', (req, res) => res.json({ data: { status: 'ok' } }));

  router.get('/categories', (req, res) => {
    const data = store.listCategories();
    res.json({ data, meta: { total: data.length } });
  });

  router.get('/tasks', (req, res) => listTasks(req, res, store));
  router.post('/tasks', express.json({ limit: '16kb' }), (req, res) => createTask(req, res, store));

  router.get('/tasks/:id', (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (id === null) {
      throw new ApiError(400, 'INVALID_ID', 'Некорректный id задачи.');
    }

    const task = store.getTask(id);
    if (!task) {
      throw new ApiError(404, 'TASK_NOT_FOUND', 'Задача не найдена.', { id });
    }
    res.json({ data: task });
  });

  for (const path of ['/health', '/categories', '/tasks', '/tasks/:id']) {
    router.all(path, (req, res) => {
      const allow = path === '/tasks' ? 'GET, HEAD, POST, OPTIONS' : 'GET, HEAD, OPTIONS';
      res.set('Allow', allow);
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Метод не поддерживается.');
    });
  }

  return router;
}
