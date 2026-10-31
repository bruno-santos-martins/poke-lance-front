function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL;
  if (configuredUrl) {
    if (import.meta.env.DEV && typeof window !== "undefined") {
      const apiUrl = new URL(configuredUrl);
      const localHosts = new Set(["localhost", "127.0.0.1"]);
      if (localHosts.has(window.location.hostname) && localHosts.has(apiUrl.hostname)) {
        apiUrl.hostname = window.location.hostname;
        return apiUrl.toString().replace(/\/$/, "");
      }
    }
    return configuredUrl;
  }

  if (import.meta.env.DEV && typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }

  return "http://localhost:4000";
}

export const API_BASE_URL = getApiBaseUrl();

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
