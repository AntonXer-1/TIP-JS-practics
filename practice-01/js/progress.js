"use strict";

const totalTasks = 12;
const completedTasks = 5;

if (!Number.isInteger(totalTasks) || totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: общее количество задач должно быть целым числом от 0 до 1000.");
} else if (!Number.isInteger(completedTasks) || completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: число выполненных задач должно быть целым и лежать между 0 и общим числом задач.");
} else if (totalTasks === 0) {
  console.log("Задач пока нет");
} else {
  const remainingTasks = totalTasks - completedTasks;
  const progress = completedTasks / totalTasks * 100;
  let status = "В работе";

  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${progress.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}
