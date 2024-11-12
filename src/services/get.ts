import { Category } from '@models/category';
import config from '@utils/config';
import mongodb from '@libs/mongodb';

export const getCategory = async (attribute: 'id' | 'name', value: string) => {
  const collectionName = config.COLLECTION_NAME;
  console.log(`Starting getCategory function`);
  console.log(`Parameters - attribute: ${attribute}, value: ${value}`);

  console.debug(
    `Getting category by ${attribute} "${value}" from table "${collectionName}"`,
  );

  const result = await mongodb.find<Category>({
    collectionName,
    filter: {
      [attribute]: value,
    },
  });

  console.log(`Database query result: ${JSON.stringify(result)}`);

  if (!result) {
    console.debug(`Category not found by ${attribute} "${value}"`);
    console.log(`Exiting getCategory function with result: null`);
    return null;
  }

  console.log(
    `Exiting getCategory function with result: ${JSON.stringify(result)}`,
  );
  return result;
};
