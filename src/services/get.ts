import { Category } from '@models/category';
import config from '@utils/config';
import mongodb from '@libs/mongodb';

export const getCategory = async (attribute: 'id' | 'name', value: string) => {
  const collectionName = config.COLLECTION_NAME;
  console.debug(
    `Getting category by ${attribute} "${value}" from table "${collectionName}"`,
  );

  try {
    const result = await mongodb.find<Category>({
      collectionName,
      filter: {
        [attribute]: value,
      },
    });
    mongodb.closeConnection();

    console.debug(`Database query result: ${JSON.stringify(result)}`);

    if (!result) {
      console.debug(`Category not found by ${attribute} "${value}"`);
      return null;
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching category: ${error.message}`);
    } else {
      throw new Error(`An unknown error occurred`);
    }
  }
};
