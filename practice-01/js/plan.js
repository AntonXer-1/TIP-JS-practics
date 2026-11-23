"use strict";

const totalTasks = 12;
const completedTasks = 5;
const dailyLimit = 3;

if (!Number.isInteger(totalTasks) || totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: общее количество задач должно быть целым числом от 0 до 1000.");
} else if (!Number.isInteger(completedTasks) || completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: число выполненных задач должно быть целым и лежать между 0 и общим числом задач.");
} else if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: дневная норма должна быть целым числом от 1 до 1000.");
} else {
  let remainingTasks = totalTasks - completedTasks;
  let day = 0;

  if (remainingTasks === 0) {
    console.log("Оставшихся задач нет.");
  } else {
    console.log(`Осталось задач: ${remainingTasks}`);
  }

  while (remainingTasks > 0) {
    day += 1;
    const doneToday = Math.min(dailyLimit, remainingTasks);
    remainingTasks -= doneToday;
    console.log(`День ${day}: выполнено ${doneToday}, осталось ${remainingTasks}`);
  }

  console.log(`Потребуется дней: ${day}`);
}
