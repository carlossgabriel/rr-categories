import { validate as isValidUUID, UUIDTypes } from 'uuid';

export function validateCategoryDeleteInput(
  categoryId: UUIDTypes | undefined,
): { error: string } | { categoryId: UUIDTypes } {
  console.log('ci', categoryId);
  if (!categoryId) {
    return { error: 'Validation error: categoryId is required' };
  }
  if (!isValidUUID(categoryId)) {
    return { error: 'Validation error: categoryId must be an uuid' };
  }

  return { categoryId };
}
