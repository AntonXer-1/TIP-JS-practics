# Практическая работа № 5

Асинхронный JSON-клиент учебного API задач. Вариант 1.

Из папки `practice-05` запустить `npm start` или `node api/server.mjs`. Сервер слушает http://127.0.0.1:5505/api. Во втором терминале из той же папки запустить `npm run client` или `node src/main.js`. Для другого адреса у консольного клиента предусмотрена переменная `API_URL`.

`api-client.js` формирует URL, проверяет статус и формат ответа, различает HTTP-ошибку, ошибку сети, неверный ответ, тайм-аут и внешнюю отмену. `task-api.js` проверяет фильтры и формат записей. Задачи и категории в `loadInitialData` запрашиваются параллельно.

| Запрос | Результат |
|---|---|
| `GET /api/tasks?completed=false` (вариант 1) | id `[4, 7, 13, 19, 22, 28, 34]`, всего 7 |
| `GET /api/tasks?completed=false&priority=high` | id `[4, 13, 34]`, всего 3 |
| `GET /api/tasks/999` | `kind: "http"`, `status: 404` |

Проверки в Node.js v24.22.3 — `node checks/api-server.checks.js` (18/18), `node checks/api-client.checks.js` (26/26), `node checks/integration.checks.js` (13/13).
