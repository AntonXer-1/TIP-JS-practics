import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  addTask,
  getPendingTasks,
  getTaskStats,
  getTaskTitles,
  removeTask,
  renameTask,
  setTaskCompleted,
} from "./task-service.js";

function printStats(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  if (total === 0) {
    console.log(`${label}: Задач пока нет`);
  } else {
    console.log(`${label}: всего ${total}, выполнено ${completed}, осталось ${pending}, прогресс ${progress.toFixed(1)}%`);
  }
}

function runScenario(title, originalTasks, steps) {
  console.log(`\n${title}`);
  const originalSnapshot = JSON.stringify(originalTasks);
  let currentTasks = originalTasks;

  console.table(currentTasks);
  console.log("Названия:", getTaskTitles(currentTasks).join(", "));
  console.log("Невыполненные задачи (id):", getPendingTasks(currentTasks).map(({ id }) => id).join(", "));
  printStats("Исходный набор", currentTasks);

  for (const [label, operation] of steps) {
    const before = JSON.stringify(currentTasks);
    const result = operation(currentTasks);
    if (result.ok) {
      currentTasks = result.tasks;
    } else {
      console.log(`Отказ: ${result.error}`);
      console.log("Список после отказа совпадает с предыдущим:", JSON.stringify(currentTasks) === before);
    }
    printStats(label, currentTasks);
  }

  console.table(currentTasks);
  console.log("Итоговые id:", currentTasks.map(({ id }) => id).join(", "));
  console.log("Исходный набор сохранился:", JSON.stringify(originalTasks) === originalSnapshot);
}

runScenario("Общий сценарий", demoTasks, [
  ["Добавление id 20", (tasks) => addTask(tasks, 20, "Добавить проверку", "high")],
  ["Выполнение id 4", (tasks) => setTaskCompleted(tasks, 4, true)],
  ["Переименование id 10", (tasks) => renameTask(tasks, 10, "Подготовить инструкцию запуска")],
  ["Удаление id 7", (tasks) => removeTask(tasks, 7)],
  ["Повторное добавление id 20", (tasks) => addTask(tasks, 20, "Дубликат")],
]);

runScenario(`Индивидуальный вариант ${variantNumber}`, variantTasks, [
  ["Добавление id 80", (tasks) => addTask(tasks, 80, "Проверить готовность проекта", "high")],
  ["Выполнение id 11", (tasks) => setTaskCompleted(tasks, 11, true)],
  ["Переименование id 23", (tasks) => renameTask(tasks, 23, "Согласовать требования к проекту")],
  ["Удаление id 37", (tasks) => removeTask(tasks, 37)],
  ["Повторное добавление id 80", (tasks) => addTask(tasks, 80, "Дубликат", "high")],
]);
