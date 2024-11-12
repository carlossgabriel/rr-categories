import { canAddChild, Category, categorySchema } from '@models/category';
import { ObjectId } from 'mongodb';

import config from '@utils/config';
import mongodb from '@libs/mongodb';

export async function createCategory(
  category: Omit<
    Category,
    'id' | 'createdAt' | 'updatedAt' | 'pathCategory' | 'depth'
  >,
  isRoot: boolean,
  pathCategory?: string,
): Promise<Category> {
  const collectionName = config.COLLECTION_NAME;
  if (!mongodb.collectionExists(config.COLLECTION_NAME)) {
    console.log(`Creating collection "${config.COLLECTION_NAME}"`);
    await mongodb.createCollection(config.COLLECTION_NAME);
  }

  const timestamp = new Date();
  const newCategoryId = new ObjectId().toHexString();
  const newCategory: Category = {
    ...category,
    id: newCategoryId,
    createdAt: timestamp,
    updatedAt: timestamp,
    pathCategory: isRoot ? newCategoryId : `${pathCategory}:${newCategoryId}`,
    depth: isRoot ? 0 : pathCategory ? pathCategory.split(':').length : 0,
    children: [],
    deletedAt: null,
    deleted: false,
  };

  console.log('Validating category creation');
  const validationResult = categorySchema.validate(newCategory);
  if (validationResult.error) {
    throw new Error(`Validation error: ${validationResult.error.message}`);
  }

  try {
    console.log('Inserting new category', newCategory);
    const result = await mongodb.insertOne<Category>({
      collectionName: config.COLLECTION_NAME,
      document: newCategory,
    });

    console.log('Insert result', result);
    if (!result.acknowledged)
      throw new Error('Failed to insert category document');

    // If not a root category, update the parent
    if (!isRoot && category.parentId) {
      console.log('Updating parent category');
      const parentCategory = await mongodb.find<Category>({
        collectionName,
        filter: { id: category.parentId },
      });

      if (!parentCategory) throw new Error('Parent category not found');
      if (!canAddChild(parentCategory))
        throw new Error('Cannot add more children to this category');

      console.log('Updating parent category', parentCategory);
      await mongodb.updateOne<Category>({
        collectionName: config.COLLECTION_NAME,
        filter: { id: category.parentId },
        update: { $push: { children: newCategory.id } },
      });
    }

    console.log('Returning new category', newCategory);
    return newCategory;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating category: ${error.message}`);
    } else {
      throw new Error(`An unknown error occurred`);
    }
  }
}
