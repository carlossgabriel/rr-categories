import { canAddChild, Category, categorySchema } from '@models/category';
import config from '@utils/config';
import mongodb from '@libs/mongodb';

interface UpdateCategoryParams {
  categoryId: string;
  updateFields: Partial<
    Omit<
      Category,
      'id' | 'createdAt' | 'updatedAt' | 'pathCategory' | 'depth' | 'children'
    >
  >;
  newParentId?: string;
}

export async function updateCategory({
  categoryId,
  updateFields,
  newParentId,
}: UpdateCategoryParams): Promise<Category> {
  const collectionName = config.COLLECTION_NAME;
  console.log(`Updating category with ID: ${categoryId}`);

  const category = await mongodb.find<Category>({
    collectionName,
    filter: { id: categoryId },
  });
  if (!category) {
    throw new Error('Category not found');
  }

  if (newParentId && newParentId !== category.parentId) {
    console.log(`Changing parent to newParentId: ${newParentId}`);
    const newParent = await mongodb.find<Category>({
      collectionName,
      filter: { id: newParentId },
    });
    if (!newParent) {
      throw new Error('New parent category not found');
    }
    if (!canAddChild(newParent)) {
      throw new Error('Cannot add more children to the new parent category');
    }

    const oldPathCategory = category.pathCategory;
    const newPathCategory = `${newParent.pathCategory}:${categoryId}`;
    const depthDifference = newParent.depth + 1 - category.depth;
    console.log('Updating pathCategory and depth for subcategories');

    await mongodb.updateMany<Category>({
      collectionName,
      filter: { pathCategory: new RegExp(`^${oldPathCategory}`) },
      update: [
        {
          $set: {
            pathCategory: {
              $replaceOne: {
                input: '$pathCategory',
                find: oldPathCategory,
                replacement: newPathCategory,
              },
            },
            depth: { $add: ['$depth', depthDifference] },
          },
        },
      ],
    });

    console.log(`Adding categoryId to new parent: ${newParentId}`);
    await mongodb.updateOne<Category>({
      collectionName,
      filter: { id: newParentId },
      update: { $push: { children: categoryId } },
    });

    console.log(`Removing categoryId from old parent: ${category.parentId}`);
    await mongodb.updateOne<Category>({
      collectionName,
      filter: { id: category.parentId },
      update: {
        $pull: { children: categoryId },
      },
    });

    category.parentId = newParentId;
    category.pathCategory = newPathCategory;
    category.depth = newParent.depth + 1;
  }

  const updatedCategory = {
    ...category,
    ...updateFields,
    updatedAt: new Date(),
  };
  console.log('Updated category data:', updatedCategory);

  const validationResult = categorySchema.validate(updatedCategory);
  if (validationResult.error) {
    throw new Error(`Validation error: ${validationResult.error.message}`);
  }

  console.log('Saving updated category to database');
  await mongodb.updateOne<Category>({
    collectionName,
    filter: { id: categoryId },
    update: { $set: updatedCategory },
  });

  console.log('Category update successful');
  return updatedCategory;
}
