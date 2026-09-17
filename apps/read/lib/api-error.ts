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

export async function readResponseError(response: Response, fallback: string) {
  return parseApiErrorMessage(await response.text(), fallback);
}
