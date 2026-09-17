export function parseApiErrorMessage(body: string, fallback: string): string {
  if (!body.trim()) {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(body);
    if (!parsed || typeof parsed !== "object") {
      return fallback;
    }

    const message = (parsed as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.length > 0 &&
      message.every((item) => typeof item === "string")
    ) {
      return message.join(" ");
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export function errorMessage(
  error: unknown,
  fallback = "Something went wrong",
) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function throwIfNotOk(response: Response, fallback: string) {
  if (response.ok) {
    return;
  }

  throw new Error(parseApiErrorMessage(await response.text(), fallback));
}
