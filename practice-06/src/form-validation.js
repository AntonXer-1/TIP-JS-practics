export function validateTaskDraft(draft, categories) {
  const errors = {};
  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  if (title.length < 1 || title.length > 100) {
    errors.title = "Введите название длиной от 1 до 100 символов.";
  }
  const priority = draft?.priority;
  if (!["low", "medium", "high"].includes(priority)) errors.priority = "Выберите приоритет.";
  const rawCategory = draft?.categoryId;
  const categoryId = typeof rawCategory === "string" || typeof rawCategory === "number"
    ? Number(rawCategory) : NaN;
  if (!Number.isSafeInteger(categoryId) || categoryId < 1
    || !categories.some(({ id }) => id === categoryId)) errors.categoryId = "Выберите категорию.";
  if (Object.keys(errors).length) return { valid: false, errors };
  return { valid: true, value: { title, priority, categoryId }, errors };
}
