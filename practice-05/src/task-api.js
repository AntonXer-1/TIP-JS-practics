import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function normalizeFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("Фильтры должны быть объектом.");
  }
  const query = {};
  for (const [name, value] of Object.entries(filters)) {
    if (!ALLOWED_FILTERS.has(name)) throw new TypeError(`Неизвестный фильтр: ${name}.`);
    if (value === undefined) continue;
    if (name === "completed" && typeof value === "boolean") query.completed = value;
    else if (name === "priority" && ALLOWED_PRIORITIES.has(value)) query.priority = value;
    else if (name === "categoryId" && isPositiveSafeInteger(value)) query.categoryId = value;
    else if (name === "q" && typeof value === "string" && value.trim().length <= 100) {
      if (value.trim()) query.q = value.trim();
    } else throw new TypeError(`Некорректный фильтр: ${name}.`);
  }
  return query;
}

function isCollection(data, validate) {
  return Array.isArray(data) && data.every(validate)
    && new Set(data.map(({ id }) => id)).size === data.length;
}

function taskPath(id) {
  if (!isPositiveSafeInteger(id)) throw new TypeError("Некорректный идентификатор задачи.");
  return `/tasks/${id}`;
}

export function createTaskApi(client) {
  if (typeof client?.requestJson !== "function") throw new TypeError("Нужен HTTP-клиент.");

  async function getTasks(filters = {}) {
    const query = normalizeFilters(filters);
    const response = await client.requestJson("/tasks", { query });
    if (!isCollection(response?.data, isTask)
      || response.meta?.total !== response.data.length
      || !response.meta.filters || typeof response.meta.filters !== "object"
      || Array.isArray(response.meta.filters)) {
      throw invalidResponse("Некорректный список задач или метаданные.");
    }
    return { tasks: response.data, meta: response.meta };
  }

  async function getTaskById(id) {
    const response = await client.requestJson(taskPath(id));
    if (!isTask(response?.data) || response.data.id !== id) {
      throw invalidResponse("Некорректная задача в ответе.");
    }
    return response.data;
  }

  async function getCategories() {
    const response = await client.requestJson("/categories");
    if (!isCollection(response?.data, isCategory)
      || response.meta?.total !== response.data.length) {
      throw invalidResponse("Некорректный список категорий.");
    }
    return response.data;
  }

  async function loadInitialData(filters = {}) {
    const [result, categories] = await Promise.all([getTasks(filters), getCategories()]);
    return { ...result, categories };
  }

  return { getTasks, getTaskById, getCategories, loadInitialData };
}
