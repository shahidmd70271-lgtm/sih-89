/**
 * Validates whether a given string is a valid UUID v1-v5 format.
 * Used defensively to ensure non-UUID string identifiers (like 'prof-123' or 'wkr-456')
 * are never passed to PostgreSQL UUID columns.
 */
export const isValidUuid = (value?: string | null): boolean => {
  if (!value || typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value.trim());
};
