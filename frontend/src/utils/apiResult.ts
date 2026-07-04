import { toast } from "sonner";

/**
 * Represents the standard structure for an action's result,
 * indicating either success with data or failure with a message.
 *
 * @template T The type of data returned on success.
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

/**
 * Unwraps the result of an `ActionResult` type.
 * If the result indicates success, it returns the contained data.
 * If the result indicates failure, or if the data is null/undefined on success,
 * it throws an error with the provided message or a fallback message.
 *
 * This function is useful for handling the outcome of server actions or API calls
 * where you expect data on success and want to propagate errors clearly.
 *
 * @template T The type of data expected on success.
 * @param {ActionResult<T>} result The action result to unwrap.
 * @param {string} fallbackMessage A message to use if the result is unsuccessful or data is missing.
 * @returns {T} The data contained within the successful result.
 * @throws {Error} If the result is not successful or if the data is missing.
 */
export function unwrapResult<T>(
  result: ActionResult<T>,
  fallbackMessage: string,
): T {
  if (!result.success) {
    throw new Error(result.message || fallbackMessage);
  }

  if (result.data === undefined || result.data === null) {
    throw new Error(fallbackMessage);
  }

  return result.data;
}

/**
 * Displays an error toast notification and logs the error to the console.
 * This utility function provides a consistent way to handle and report errors in the UI.
 *
 * @param {unknown} error The error object or value to be reported.
 * @param {string} fallbackMessage A default message to display if the error object does not have a `message` property.
 */
export function notifyError(error: unknown, fallbackMessage: string) {
  toast.error(error instanceof Error ? error.message : fallbackMessage);
  console.error(error);
}
