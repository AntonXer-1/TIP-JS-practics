import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (typeof api?.loadInitialData !== "function" || typeof api?.getTasks !== "function"
    || typeof view?.setListState !== "function" || typeof view?.setTasks !== "function") {
    throw new TypeError("Нужны API и представление приложения.");
  }
  let tasks = [];
  let categories = null;
  let filters = {};
  let editingId = null;
  let activeRequest = null;
  let loadNumber = 0;
  let mutating = false;

  async function loadCurrentTasks() {
    activeRequest?.abort();
    const request = new AbortController();
    activeRequest = request;
    const number = ++loadNumber;
    const options = { signal: request.signal };
    view.setListState("loading");

    try {
      const result = categories === null
        ? await api.loadInitialData(filters, options)
        : await api.getTasks(filters, options);
      if (number !== loadNumber) return;
      if (categories === null) {
        categories = result.categories;
        view.setCategories(categories);
      }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      view.setListState(tasks.length ? "ready" : "empty");
      if (mutating) view.setMutationPending(true);
    } catch (error) {
      if (number === loadNumber && error.kind !== "aborted") {
        view.setListState("error", messageForError(error));
      }
    } finally {
      if (number === loadNumber) activeRequest = null;
    }
  }

  function applyFilters(nextFilters = {}) {
    filters = { ...nextFilters };
    return loadCurrentTasks();
  }

  function cancelEdit() {
    editingId = null;
    view.showFormErrors();
    view.setFormTask(null);
  }

  function beginEdit(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    editingId = id;
    view.showFormErrors();
    view.setFormTask(task);
  }

  async function mutate(operation, message) {
    if (mutating) return;
    mutating = true;
    view.setMutationPending(true);
    try {
      await operation();
      view.notify(message, "success");
      await loadCurrentTasks();
    } catch (error) {
      view.notify(messageForError(error), "error");
    } finally {
      mutating = false;
      view.setMutationPending(false);
    }
  }

  function submit(draft) {
    const result = validateDraft(draft, categories ?? []);
    view.showFormErrors(result.errors);
    if (!result.valid) return;
    const id = editingId;
    return mutate(async () => {
      if (id === null) await api.createTask(result.value);
      else await api.updateTask(id, result.value);
      cancelEdit();
    }, id === null ? "Задача добавлена." : "Задача изменена.");
  }

  function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    return mutate(
      () => api.setTaskCompleted(id, !task.completed),
      "Статус задачи обновлён.",
    );
  }

  function deleteTask(id) {
    return mutate(async () => {
      await api.deleteTask(id);
      if (editingId === id) cancelEdit();
    }, "Задача удалена.");
  }

  function resetData() {
    return mutate(async () => {
      await api.resetDemoData();
      cancelEdit();
    }, "Исходные данные восстановлены.");
  }

  function destroy() {
    loadNumber += 1;
    activeRequest?.abort();
    activeRequest = null;
  }

  return {
    start: applyFilters, applyFilters, refresh: loadCurrentTasks,
    submit, beginEdit, cancelEdit, toggleTask, deleteTask, resetData, destroy,
  };
}
