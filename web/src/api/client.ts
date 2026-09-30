export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/** DESIGN §6: every request has an 8s timeout; a timeout counts as a network failure. */
export const REQUEST_TIMEOUT_MS = 8000;

/** The server answered, and said no. Carries the status so callers can branch on 404. */
export class ApiError extends Error {
  readonly name = "ApiError";
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** No HTTP response at all — a rejected fetch or our own timeout. Drives DESIGN 6.6. */
export class NetworkError extends Error {
  readonly name = "NetworkError";
  constructor(message = "Could not reach the server") {
    super(message);
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body?.error === "string" && body.error) return body.error;
  } catch {
    /* falls through */
  }
  return "Something went wrong";
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);

  // The caller's signal (React Query's) and our timeout both have to be able to abort.
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeout.signal])
    : timeout.signal;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, signal });
  } catch (error) {
    // An abort we did not cause belongs to the caller — let it through untouched.
    if (init.signal?.aborted) throw error;
    throw new NetworkError();
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) throw new ApiError(response.status, await errorMessage(response));
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export const jsonBody = (data: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
