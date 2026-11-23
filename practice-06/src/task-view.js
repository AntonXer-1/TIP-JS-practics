const priorityLabels = { low: "Низкий", medium: "Средний", high: "Высокий" };

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function actionButton(action, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.append(textElement("span", "action-label", label));
  return button;
}

export function createTaskElement(task, category) {
  const card = document.createElement("li");
  card.className = "task-card";
  card.classList.toggle("is-completed", task.completed);
  card.dataset.taskId = task.id;

  const actions = document.createElement("div");
  actions.className = "task-actions";
  const toggle = actionButton("toggle", "Выполнена");
  toggle.setAttribute("aria-pressed", String(task.completed));
  actions.append(toggle, actionButton("edit", "Изменить"), actionButton("delete", "Удалить"));
  card.append(
    textElement("h3", "task-title", task.title),
    textElement("p", "task-status", task.completed ? "Выполнена" : "В работе"),
    textElement("p", "task-priority", priorityLabels[task.priority]),
    textElement("p", "task-category", category?.name ?? "Без категории"),
    actions,
  );
  return card;
}

export function renderTaskList(listElement, tasks, categories) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  listElement.replaceChildren(...tasks.map((task) =>
    createTaskElement(task, categoryById.get(task.categoryId))));
}
