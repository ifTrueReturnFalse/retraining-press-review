import { cookies } from "next/headers";

/**
 * A wrapper around the native fetch API for server-side requests.
 * Automatically injects the authentication token from cookies and handles base URL configuration.
 *
 * @template T - The expected return type of the API response.
 * @param endpoint - The API endpoint path (e.g., "/conversations").
 * @param options - Standard fetch options (method, body, headers, etc.).
 * @returns A promise resolving to the parsed JSON response.
 * @throws Error if the user is not authenticated or if the backend request fails.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    throw new Error("Non authentifié");
  }

  // Merge default headers with provided options, ensuring Authorization is set
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "La requête sur l'API backend a échoué");
  }

  return data;
}
