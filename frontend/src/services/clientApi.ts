/**
 * A wrapper around the native fetch API for client-side requests to Next.js Route Handlers.
 * It automatically prefixes the endpoint with `/api` and handles JSON parsing and error management.
 *
 * @template T - The expected return type of the API response.
 * @param endpoint - The internal API route path (e.g., "/chat").
 * @param options - Standard fetch options (method, body, headers, etc.).
 * @returns A promise resolving to the parsed JSON response.
 * @throws Error if the internal request fails, using the message returned by the API if available.
 */
export async function clientFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Prefix the endpoint with /api to target Next.js Route Handlers
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // Extract custom error message from the response body or fallback to default
    throw new Error(data.message || "La requête interne a échoué");
  }

  return data;
}
