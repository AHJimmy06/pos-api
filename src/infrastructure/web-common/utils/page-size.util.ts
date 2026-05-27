/**
 * Normalizes page size to valid predefined options.
 * @param value - The page size value to normalize
 * @param defaultSize - Default size if invalid (default: 10)
 * @returns Valid page size: 10, 15, 20, or 30
 */
export function normalizePageSize(
  value: number | string | undefined,
  defaultSize: number = 10,
): number {
  const validOptions = [10, 15, 20, 30];
  const numValue =
    typeof value === 'string' ? parseInt(value, 10) : (value ?? defaultSize);

  if (!validOptions.includes(numValue)) {
    return defaultSize;
  }

  return numValue;
}

/**
 * Validates if a page size is within valid options.
 * @param value - The page size value to validate
 * @returns true if valid, false otherwise
 */
export function isValidPageSize(value: number | string): boolean {
  const validOptions = [10, 15, 20, 30];
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  return validOptions.includes(numValue);
}
