import mongodb from '@libs/mongodb';
import { Category } from '@models/category';
import config from '@utils/config';
import crypto from 'crypto';
import { InsertOneResult } from 'mongodb';
import { UUIDTypes, v4 as uuid } from 'uuid';

const collectionName = config.COLLECTION_NAME;

export async function createCategory(
  category: Omit<
    Category,
    'id' | 'createdAt' | 'updatedAt' | 'pathCategory' | 'depth'
  >,
  isRoot: boolean,
): Promise<Category> {
  const timestamp = new Date();
  const newCategoryId = uuid();
  const newCategory: Category = {
    ...category,
    id: newCategoryId,
    createdAt: timestamp,
    updatedAt: timestamp,
    pathCategory: isRoot
      ? newCategoryId
      : `${category.parentId}:${newCategoryId}`,
    depth: isRoot
      ? 0
      : category.parentId
      ? category.parentId.toString().split(':').length
      : 0,
    children: [],
    deletedAt: null,
    deleted: false,
  };

  try {
    if (isRoot) {
      const { categoryInserted } = await insertCategory(newCategory);
      return categoryInserted;
    } else if (category.parentId) {
      console.log('parentID', category.parentId);
      const parentCategory = await getParentCategory(category.parentId);
      validateMaxDepthChild(parentCategory.depth);
      validateMaxChildren(parentCategory.children);
      await validateUniqueChildName(category.name, category.parentId);
      await updateParentCategory(parentCategory.id, newCategory.id);

      newCategory.pathCategory = `${parentCategory.pathCategory}:${newCategoryId}`;
      newCategory.depth = parentCategory.depth + 1;

      const { categoryInserted } = await insertCategory(newCategory);
      return categoryInserted;
    }

    throw new Error('Parent ID must be provided for non-root categories');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating category: ${error.message}`);
    } else {
      throw new Error(`An unknown error occurred`);
    }
  }
}

async function insertCategory(newCategory: Category): Promise<{
  mongoResult: InsertOneResult<Category>;
  categoryInserted: Category;
}> {
  console.log('Inserting new category', newCategory);
  const result = await mongodb.insertOne<Category>({
    collectionName,
    document: newCategory,
  });

  if (!result.acknowledged) {
    throw new Error('Failed to insert category document');
  }
  return { mongoResult: result, categoryInserted: newCategory };
}

async function getParentCategory(parentId: UUIDTypes): Promise<Category> {
  const parentCategory = await mongodb.find<Category>({
    collectionName,
    filter: { id: parentId },
  });
  if (!parentCategory) {
    throw new Error('Parent category not found');
  }
  return parentCategory;
}

async function updateParentCategory(
  parentId: UUIDTypes,
  childId: UUIDTypes,
): Promise<void> {
  console.log('Updating parent category', parentId);
  await mongodb.updateOne<Category>({
    collectionName,
    filter: { id: parentId },
    update: { $push: { children: childId } },
  });
}

function validateMaxDepthChild(depth: Category['depth']) {
  if (depth === 5) {
    throw new Error(`Category reached the depth limit of sub categories`);
  }
}

function validateMaxChildren(children: Category['children']) {
  if (children.length === 20) {
    throw new Error(`Parent category reached the limit of categories`);
  }
}

async function validateUniqueChildName(
  childName: string,
  parentId: UUIDTypes,
): Promise<void> {
  const existingChild = await mongodb.find<Category>({
    collectionName,
    filter: { name: childName, parentId },
  });
  if (existingChild) {
    throw new Error(
      'A category cannot have more than one subcategory with the same name',
    );
  }
}
