const statuses = [
  ['', 'Все'],
  ['false', 'В работе'],
  ['true', 'Завершенные'],
];

export default function TaskFilters({ filters, categories, onChange }) {
  function change(event) {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  }

  return (
    <section aria-label="Фильтры">
      <h2>Фильтры</h2>
      <div className="status-filters" aria-label="Статус">
        {statuses.map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filters.completed === value}
            onClick={() => onChange({ ...filters, completed: value })}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="filter-fields">
        <label>
          Поиск
          <input name="q" value={filters.q} maxLength={100} onChange={change} />
        </label>
        <label>
          Приоритет
          <select name="priority" value={filters.priority} onChange={change}>
            <option value="">Все</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </label>
        <label>
          Категория
          <select name="categoryId" value={filters.categoryId} onChange={change}>
            <option value="">Все</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
      </div>
      <button type="button" onClick={() => onChange({ q: '', completed: '', priority: '', categoryId: '' })}>
        Сбросить фильтры
      </button>
    </section>
  );
}
