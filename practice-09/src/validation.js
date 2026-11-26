import { ApiError } from './errors.js';

const priorities = ['low', 'medium', 'high'];

export function parsePositiveId(raw) {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) {
    return null;
  }
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

function invalidQuery(name) {
  return new ApiError(400, 'INVALID_QUERY', `Некорректный параметр ${name}.`);
}

export function parseFilters(searchParams) {
  const filters = { completed: null, priority: null, categoryId: null, q: '' };
  const seen = new Set();

  for (const [name, raw] of searchParams) {
    if (!Object.hasOwn(filters, name) || seen.has(name)) {
      throw invalidQuery(name);
    }
    seen.add(name);

    switch (name) {
      case 'completed':
        if (raw !== 'true' && raw !== 'false') {
          throw invalidQuery(name);
        }
        filters.completed = raw === 'true';
        break;
      case 'priority':
        if (!priorities.includes(raw)) {
          throw invalidQuery(name);
        }
        filters.priority = raw;
        break;
      case 'categoryId':
        filters.categoryId = parsePositiveId(raw);
        if (filters.categoryId === null) {
          throw invalidQuery(name);
        }
        break;
      case 'q':
        filters.q = raw.trim();
        if (filters.q.length > 100) {
          throw invalidQuery(name);
        }
        break;
    }
  }

  return filters;
}

export function validateTaskDraft(draft, categories) {
  const title = typeof draft?.title === 'string' ? draft.title.trim() : '';
  const priority = draft?.priority;
  const categoryId = draft?.categoryId;
  const errors = {};

  if (!title || title.length > 100) {
    errors.title = 'Введите название от 1 до 100 символов.';
  }
  if (!priorities.includes(priority)) {
    errors.priority = 'Выберите приоритет: low, medium или high.';
  }
  if (!Number.isSafeInteger(categoryId) || !categories.some(category => category.id === categoryId)) {
    errors.categoryId = 'Укажите id существующей категории.';
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, 'INVALID_TASK', 'Проверьте поля задачи.', errors);
  }
  return { title, priority, categoryId };
}
