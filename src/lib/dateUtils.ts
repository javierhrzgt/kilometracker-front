/**
 * Timezone-safe date utilities for the Kilometracker application
 *
 * Key principles:
 * - Always work with local timezone for user input/display
 * - Never use toISOString() for form fields
 * - Date input fields natively handle YYYY-MM-DD in local time
 */

/**
 * Get today's date as YYYY-MM-DD string in LOCAL time
 * Safe for HTML date input field default values
 *
 * @returns {string} Date in YYYY-MM-DD format (e.g., "2025-11-26")
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extract date portion from ISO datetime string or date string
 * Handles both "2025-11-26T10:30:45.123Z" and "2025-11-26" formats
 * Returns YYYY-MM-DD string suitable for date input fields
 *
 * @param {string} dateString - ISO datetime or date string
 * @returns {string} Date in YYYY-MM-DD format or empty string if invalid
 */
export function getDateValue(dateString: string): string {
  if (!dateString) return '';
  try {
    const dateOnly = dateString.split('T')[0];
    // Validate format is YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return '';
    }
    return dateOnly;
  } catch {
    return '';
  }
}

/**
 * Format a date string for display (locale-specific)
 *
 * Input: "2025-11-26" or "2025-11-26T10:30:45.123Z"
 * Output: "26 nov 2025" (in es-ES locale)
 *
 * Uses Date.UTC to prevent timezone shifting during formatting
 *
 * @param {string} dateString - ISO datetime or date string
 * @returns {string} Formatted date string or error message
 */
export function formatDateForDisplay(dateString: string): string {
  try {
    if (!dateString) return 'Sin fecha';

    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-').map(Number);

    // Validate parsed values
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return 'Fecha inválida';
    }

    // Use Date.UTC to create date without local timezone offset
    const timestamp = Date.UTC(year, month - 1, day);
    if (isNaN(timestamp)) {
      return 'Fecha inválida';
    }

    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'  // Prevent local timezone conversion
    }).format(date);
  } catch {
    return 'Fecha inválida';
  }
}

/**
 * Validate if a date string is in valid YYYY-MM-DD format
 *
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid YYYY-MM-DD format
 */
export function isValidDateFormat(dateString: string): boolean {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

/**
 * Helper for date range filters
 * Ensures both start and end dates are in valid format
 *
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Object} Validation result with valid flag and optional error message
 */
export function validateDateRange(
  startDate: string,
  endDate: string
): { valid: boolean; message?: string } {
  if (startDate && !isValidDateFormat(startDate)) {
    return { valid: false, message: 'Fecha inicio inválida' };
  }
  if (endDate && !isValidDateFormat(endDate)) {
    return { valid: false, message: 'Fecha fin inválida' };
  }
  if (startDate && endDate && startDate > endDate) {
    return { valid: false, message: 'Fecha inicio no puede ser mayor a fecha fin' };
  }
  return { valid: true };
}

/**
 * Calculate days until a target date from today
 * Handles timezone correctly by comparing date strings, not Date objects
 *
 * @param {string} targetDateString - Target date in YYYY-MM-DD or ISO format
 * @returns {number} Number of days (negative if in the past)
 */
export function getDaysUntilDate(targetDateString: string): number {
  if (!targetDateString) return 0;

  const targetDateOnly = targetDateString.split('T')[0];
  const todayString = getTodayDateString();

  // Parse both dates in UTC to avoid timezone issues
  const [targetYear, targetMonth, targetDay] = targetDateOnly.split('-').map(Number);
  const [todayYear, todayMonth, todayDay] = todayString.split('-').map(Number);

  const targetTimestamp = Date.UTC(targetYear, targetMonth - 1, targetDay);
  const todayTimestamp = Date.UTC(todayYear, todayMonth - 1, todayDay);

  const diffTime = targetTimestamp - todayTimestamp;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
