import { categories as seedCategories, tasks as seedTasks } from './data.js';
import { selectTasks, findTask } from './task-service.js';

// Для каждого приложения собственные копии данных, без открытия порта.
export function createStore() {
  const tasks = seedTasks.map(task => ({ ...task }));
  const categories = seedCategories.map(category => ({ ...category }));
  let nextId = Math.max(0, ...tasks.map(task => task.id)) + 1;

  function addTask({ title, priority, categoryId }) {
    const task = { id: nextId, title, completed: false, priority, categoryId };
    tasks.push(task);
    nextId += 1;
    return { ...task };
  }

  return {
    addTask,
    listTasks: filters => selectTasks(tasks, filters),
    getTask: id => findTask(tasks, id),
    listCategories: () => categories.map(category => ({ ...category })),
  };
}
