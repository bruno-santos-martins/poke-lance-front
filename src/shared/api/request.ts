const configuredUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export const API_BASE_URL = configuredUrl ?? "";

export const SOCKET_URL: string =
  configuredUrl ?? (typeof window !== "undefined" ? window.location.origin : "");

export const AUTH_TOKEN_KEY = "auction-token";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
