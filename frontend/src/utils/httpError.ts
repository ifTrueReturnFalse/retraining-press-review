/**
 * Extracts a human-readable error message from a backend response body,
 * regardless of whether it follows FastAPI's default HTTPException shape
 * ({ detail: string }) or our custom ApiResponse shape ({ message: string }).
 * Falls back to a generic message if neither is present or well-formed.
 *
 * @param data The parsed JSON body of a failed response.
 * @param fallback Generic message used if no usable field is found.
 */
export function extractErrorMessage(data: unknown, fallback: string): string {
  const body = data as { detail?: unknown; message?: unknown };

  if (typeof body?.detail === "string" && body.detail.trim().length > 0) {
    return body.detail;
  }
  if (typeof body?.message === "string" && body.message.trim().length > 0) {
    return body.message;
  }
  return fallback;
}
