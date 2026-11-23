function isValidId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

function normalizeTitle(title) {
  if (typeof title !== "string") {
    return null;
  }
  const cleaned = title.trim();
  return cleaned.length >= 1 && cleaned.length <= 100 ? cleaned : null;
}

export function createTask(id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "Идентификатор должен быть положительным безопасным целым числом." };
  }
  const cleanedTitle = normalizeTitle(title);
  if (cleanedTitle === null) {
    return { ok: false, error: "Название должно содержать от 1 до 100 символов после обрезки пробелов." };
  }
  if (!["low", "medium", "high"].includes(priority)) {
    return { ok: false, error: "Допустимые приоритеты: low, medium и high." };
  }
  return { ok: true, task: { id, title: cleanedTitle, completed: false, priority } };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : completed / total * 100;
  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const result = createTask(id, title, priority);
  if (!result.ok) {
    return result;
  }
  if (findTaskById(tasks, id)) {
    return { ok: false, error: `Задача с id ${id} уже существует.` };
  }
  return { ok: true, tasks: [...tasks, result.task] };
}

function checkExistingTask(tasks, id) {
  if (!isValidId(id)) {
    return "Идентификатор должен быть положительным безопасным целым числом.";
  }
  if (!findTaskById(tasks, id)) {
    return `Задача с id ${id} не найдена.`;
  }
  return null;
}

export function setTaskCompleted(tasks, id, completed) {
  const error = checkExistingTask(tasks, id);
  if (error) {
    return { ok: false, error };
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "Признак выполнения должен быть true или false." };
  }
  return {
    ok: true,
    tasks: tasks.map((task) => task.id === id ? { ...task, completed } : task),
  };
}

export function renameTask(tasks, id, title) {
  const error = checkExistingTask(tasks, id);
  if (error) {
    return { ok: false, error };
  }
  const cleanedTitle = normalizeTitle(title);
  if (cleanedTitle === null) {
    return { ok: false, error: "Название должно содержать от 1 до 100 символов после обрезки пробелов." };
  }
  return {
    ok: true,
    tasks: tasks.map((task) => task.id === id ? { ...task, title: cleanedTitle } : task),
  };
}

export function removeTask(tasks, id) {
  const error = checkExistingTask(tasks, id);
  if (error) {
    return { ok: false, error };
  }
  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}
