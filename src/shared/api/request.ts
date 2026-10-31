export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
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
    throw new Error(data.error ?? "Não foi possível concluir o pedido.");
  }

  return data as T;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível concluir o pedido.";
}
