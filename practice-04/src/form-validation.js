export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const rawId = draft?.id;
  const id = editingId ?? (typeof rawId === "string" || typeof rawId === "number"
    ? Number(rawId) : NaN);
  const exists = tasks.some((task) => task.id === id);
  if (!Number.isSafeInteger(id) || id < 1) {
    errors.id = "Введите положительный целый идентификатор.";
  } else if (editingId === null && exists) {
    errors.id = "Задача с таким идентификатором уже существует.";
  } else if (editingId !== null && !exists) {
    errors.id = "Редактируемая задача не найдена.";
  }

  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  if (title.length < 1 || title.length > 100) {
    errors.title = "Введите название длиной от 1 до 100 символов.";
  }
  const priority = draft?.priority;
  if (!["low", "medium", "high"].includes(priority)) {
    errors.priority = "Выберите допустимый приоритет.";
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { id, title, priority } };
}
