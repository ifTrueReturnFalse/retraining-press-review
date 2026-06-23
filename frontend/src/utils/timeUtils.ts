/**
 * Constant representing the number of milliseconds in a day.
 */
const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Checks if a given value is a valid Date object.
 * @param date The value to check.
 * @returns `true` if the value is a valid Date object, `false` otherwise.
 */
function isValidDate(date: Date | unknown) {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Calculates the ISO week number for a given Date object.
 * The week starts on Monday, and the first week of the year is the one that contains January 4th.
 * @param date The Date object for which to calculate the week number.
 * @returns The ISO week number (1-53).
 */
function dateToWeekNumber(date: Date) {
  const dateClone = new Date(date);
  const dayOfWeek = dateClone.getDay();
  const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;

  dateClone.setHours(0, 0, 0, 0);
  dateClone.setDate(dateClone.getDate() + (4 - isoDay));

  const firstDayDate = new Date(dateClone);
  firstDayDate.setMonth(0, 1);

  return Math.ceil(
    (dateClone.getTime() - firstDayDate.getTime() + DAY_IN_MS) / DAY_IN_MS / 7,
  );
}

/**
 * Returns the ISO week number for a given date string.
 * If the `stringDate` is invalid, it returns the week number for the current date.
 *
 * @param stringDate The date string to convert (e.g., "YYYY-MM-DD" or any valid date string).
 * @returns The ISO week number (1-53).
 */
export function getWeekNumber(stringDate: string) {
  const date = new Date(stringDate);
  return isValidDate(date)
    ? dateToWeekNumber(date)
    : dateToWeekNumber(new Date());
}
