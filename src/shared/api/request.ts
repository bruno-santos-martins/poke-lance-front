// When VITE_API_URL is set, requests go to that host (e.g. a remote backend during dev).
// Otherwise, relative paths are used — Vite proxies them in dev, backend serves frontend in prod.
const configuredUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export const API_BASE_URL = configuredUrl ?? "";

// Socket.io endpoint: explicit host when configured, otherwise current page origin (same-origin).
export const SOCKET_URL: string =
  configuredUrl ?? (typeof window !== "undefined" ? window.location.origin : "");

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  let data: { error?: string; [key: string]: unknown };
  try {
    data = await response.json() as { error?: string; [key: string]: unknown };
  } catch {
    throw new Error("O servidor devolveu uma resposta inválida.");
  }

  if (!response.ok) {
    throw new ApiError(data.error ?? "Não foi possível concluir o pedido.", response.status);
  }

  return data as T;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível concluir o pedido.";
}
