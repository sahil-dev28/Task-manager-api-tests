import { API_BASE_URL } from "./client";

/** GET /health returns plain text "OK", not JSON, so it bypasses `request`. */
export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { signal });
    return response.ok;
  } catch {
    return false;
  }
}
