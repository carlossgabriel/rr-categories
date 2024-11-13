import mongodb from '@libs/mongodb';
import { Category } from '@models/category';
import config from '@utils/config';
import { UUIDTypes } from 'uuid';

export async function removeCategory(categoryId: UUIDTypes): Promise<boolean> {
  const collectionName = config.COLLECTION_NAME;

  try {
    console.log(`Deleting category ${categoryId}`);
    // Find the category to be deleted
    const categoryToDelete = await mongodb.find<Category>({
      collectionName,
      filter: { id: categoryId },
    });
    if (!categoryToDelete) {
      return false;
    }
    console.log('Category found:', categoryToDelete);

    // Delete the category and all its subcategories by matching the pathCategory prefix
    const pathPattern = new RegExp(`^${categoryToDelete.pathCategory}`);
    console.log(
      'Deleting all categories matching the pathCategory prefix:',
      pathPattern,
    );
    await mongodb.deleteMany<Category>({
      collectionName,
      filter: { pathCategory: pathPattern },
    });

    // Remove the deleted category from its parent’s children array if it’s not a root category
    if (categoryToDelete.parentId) {
      console.log(
        'Updating parent category by removing the deleted category from its children array',
        categoryToDelete.parentId,
      );
      await mongodb.updateOne<Category>({
        collectionName,
        filter: { id: categoryToDelete.parentId },
        update: { $pull: { children: categoryId } },
      });
    }
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error removing category: ${error.message}`);
    } else {
      throw new Error(`An unknown error occurred`);
    }
  }
}
