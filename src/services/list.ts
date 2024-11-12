import { Category } from '@models/category';
import mongodb from '@libs/mongodb';

export type CategoryFilters = Partial<
  Pick<Category, 'enabled' | 'depth' | 'parentId' | 'deleted' | 'name'>
>;

const buildFilterQuery = (
  filters: CategoryFilters,
): Record<string, unknown> => {
  const filterQuery: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      filterQuery[key] =
        key === 'name'
          ? { $regex: value, $options: 'i' } // case-insensitive search for name
          : value;
    }
  }

  return filterQuery;
};

export const listCategory = async ({
  filters,
}: {
  filters: CategoryFilters;
}) => {
  const filterQuery = buildFilterQuery(filters);
  console.debug(
    `Listing categories from table "${
      process.env.CATEGORIES_TABLE_NAME
    }" using filters: ${JSON.stringify(filters)}`,
  );

  try {
    const result = await mongodb.findMany<Category>('categories', filterQuery);

    if (!result) {
      console.debug('No categories found');
      return [];
    }

    return result;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Error fetching categories');
  }
};
