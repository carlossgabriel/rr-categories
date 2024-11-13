import { Category, categorySchema } from '@models/category';

export function validateCategoryCreationInput(requestBody: any):
  | {
      category: Omit<
        Category,
        'id' | 'createdAt' | 'updatedAt' | 'pathCategory' | 'depth'
      >;
      isRoot: boolean;
    }
  | { error: string } {
  const { name, parentId, isRoot } = requestBody;

  const category: Omit<
    Category,
    'id' | 'createdAt' | 'updatedAt' | 'pathCategory' | 'depth'
  > = {
    name,
    parentId: parentId || null,
    children: [],
    deletedAt: null,
    deleted: false,
    enabled: requestBody.enabled ?? true,
    description: requestBody.description ?? '',
  };

  const validationResult = categorySchema.validate(category);
  if (validationResult.error) {
    return { error: `Validation error: ${validationResult.error.message}` };
  }

  if (!isRoot && !category.parentId) {
    return {
      error: 'Validation error: parentId is required for non-root categories',
    };
  }

  if (isRoot && category.parentId) {
    return {
      error: 'Validation error: cannot set parentId on root category',
    };
  }

  return { category, isRoot };
}
