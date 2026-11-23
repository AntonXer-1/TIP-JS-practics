export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(baseUrl);
  if (!["http:", "https:"].includes(url.protocol) || url.search || url.hash) {
    throw new TypeError("Некорректный базовый адрес API.");
  }
  if (typeof path !== "string" || !path.replace(/^\/+|\/+$/g, "")
    || path.includes(":") || path.includes("?") || path.includes("#")) {
    throw new TypeError("Ожидается относительный путь API.");
  }
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/${path.replace(/^\/+|\/+$/g, "")}`;
  for (const [name, value] of Object.entries(query)) {
    if (value != null && value !== "") url.searchParams.set(name, value);
  }
  return url.href;
}

function checkTimeout(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 2147483647) {
    throw new TypeError("Тайм-аут должен быть положительным целым числом.");
  }
}

function isJson(response) {
  const type = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  return type === "application/json" || /^application\/.+\+json$/.test(type ?? "");
}

export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  buildUrl(baseUrl, "health");
  checkTimeout(timeoutMs);
  if (typeof fetchFn !== "function") throw new TypeError("Нужна функция fetch.");

  async function requestJson(path, { query, signal, timeoutMs: timeout = timeoutMs } = {}) {
    const url = buildUrl(baseUrl, path, query);
    checkTimeout(timeout);
    const controller = new AbortController();
    const onAbort = () => controller.abort("aborted");
    if (signal?.aborted) onAbort();
    else signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => controller.abort("timeout"), timeout);

    try {
      if (controller.signal.aborted) throw new Error("Запрос отменён.");
      const response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!(response instanceof Response)) {
        throw new ApiError("Ожидался объект Response.", { kind: "invalid-response", url });
      }
      if (!response.ok) {
        const payload = isJson(response) ? await response.json().catch(() => null) : null;
        const error = payload?.error;
        throw new ApiError(error?.message ?? `HTTP ${response.status}`, {
          kind: "http",
          status: response.status,
          code: error?.code ?? null,
          details: error?.details ?? null,
          url,
        });
      }
      if (response.status === 204) return null;
      if (!isJson(response)) {
        throw new ApiError("Сервер вернул ответ без JSON.", { kind: "invalid-response", url });
      }
      try {
        return await response.json();
      } catch (cause) {
        if (controller.signal.aborted) throw cause;
        throw new ApiError("Некорректный JSON в ответе.", { kind: "invalid-response", url, cause });
      }
    } catch (cause) {
      if (controller.signal.aborted) {
        const kind = controller.signal.reason;
        throw new ApiError(kind === "timeout" ? "Время ожидания истекло." : "Запрос отменён.", { kind, url, cause });
      }
      if (cause instanceof ApiError) throw cause;
      throw new ApiError("Не удалось подключиться к API.", { kind: "network", url, cause });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }
  }

  return { requestJson };
}
