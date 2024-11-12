import { Category } from '@models/category';

export function validateCategoryUpdateInput({
  categoryId,
  requestBody,
}: {
  categoryId: string | undefined;
  requestBody: any;
}):
  | {
      error: string;
    }
  | {
      categoryId: string;
      updateFields: Partial<
        Omit<
          Category,
          | 'id'
          | 'createdAt'
          | 'updatedAt'
          | 'pathCategory'
          | 'depth'
          | 'children'
        >
      >;
      newParentId?: string;
    } {
  if (!categoryId) {
    return { error: 'Validation error: categoryId is required' };
  }

  const { updateFields, newParentId } = requestBody;
  if (!updateFields || typeof updateFields !== 'object') {
    return {
      error: 'Validation error: updateFields is required and must be an object',
    };
  }

  return { categoryId, updateFields, newParentId };
}
