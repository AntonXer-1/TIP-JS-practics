import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, categories, onToggle, onEdit, onDelete }) {
  return (
    <section aria-label="Список задач">
      <h2>Задачи</h2>
      {tasks.length === 0 ? <p>Список задач пуст</p> : (
        <ul>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              categoryName={categories.find(category => category.id === task.categoryId)?.name}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
      <p>Найдено: {tasks.length}</p>
    </section>
  );
}
