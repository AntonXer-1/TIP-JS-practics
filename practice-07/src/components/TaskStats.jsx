export default function TaskStats({ stats }) {
  return (
    <section aria-label="Статистика">
      Всего: {stats.total} · Выполнено: {stats.completed} · В работе: {stats.active}
    </section>
  );
}
