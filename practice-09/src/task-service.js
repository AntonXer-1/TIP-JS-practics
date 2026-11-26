export function selectTasks(tasks, filters) {
  const query = filters.q.toLocaleLowerCase('ru-RU');

  return tasks.filter(task => {
    if (filters.completed !== null && task.completed !== filters.completed) {
      return false;
    }
    if (filters.priority !== null && task.priority !== filters.priority) {
      return false;
    }
    if (filters.categoryId !== null && task.categoryId !== filters.categoryId) {
      return false;
    }
    return task.title.toLocaleLowerCase('ru-RU').includes(query);
  });
}

export function findTask(tasks, id) {
  return tasks.find(task => task.id === id) ?? null;
}
