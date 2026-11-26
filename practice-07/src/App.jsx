import { useRef, useState } from 'react';
import { tasks as initialTasks, categories } from './data.js';
import { createInitialFilters } from './variant.js';
import { addTask, getTaskStats, removeTask, selectTasks, toggleTask, updateTask } from './domain/task-service.js';
import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';

export default function App() {
  const [tasks, setTasks] = useState(() => initialTasks.map(task => ({ ...task })));
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);
  const nextId = useRef(Math.max(0, ...initialTasks.map(task => task.id)) + 1);

  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = tasks.find(task => task.id === editingId) ?? null;

  function saveTask(value) {
    if (editingId === null) {
      const id = nextId.current;
      nextId.current += 1;
      setTasks(current => addTask(current, value, id));
      return true;
    }
    if (!editingTask) {
      return false;
    }

    setTasks(current => updateTask(current, editingId, value));
    setEditingId(null);
    return true;
  }

  function deleteTask(id) {
    setTasks(current => removeTask(current, id));
    if (editingId === id) {
      setEditingId(null);
    }
  }

  return (
    <main>
      <h1>Задачи на React</h1>
      <TaskStats stats={stats} />
      <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
      <TaskList
        tasks={visibleTasks}
        categories={categories}
        onToggle={id => setTasks(current => toggleTask(current, id))}
        onEdit={setEditingId}
        onDelete={deleteTask}
      />
      <TaskForm
        key={editingId ?? 'new'}
        categories={categories}
        initialTask={editingTask}
        onSave={saveTask}
        onCancel={() => setEditingId(null)}
      />
    </main>
  );
}
