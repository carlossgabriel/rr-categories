export function validateCategoryDeleteInput(
  categoryId: string | undefined,
): { error: string } | { categoryId: string } {
  if (!categoryId) {
    return { error: 'Validation error: categoryId is required' };
  }

  return { categoryId };
}
