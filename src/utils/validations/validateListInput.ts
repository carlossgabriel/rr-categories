export function validateCategoryListInput(filters: any):
  | {
      error: string;
    }
  | { filters: Record<string, unknown> } {
  const validFilters = ['enabled', 'depth', 'parentId', 'deleted', 'name'];
  const parsedFilters: Record<string, unknown> = {};

  for (const key of Object.keys(filters)) {
    if (validFilters.includes(key)) {
      parsedFilters[key] =
        key === 'enabled' || key === 'deleted'
          ? filters[key] === 'true'
          : filters[key];
    } else {
      return { error: `Validation error: Invalid filter key "${key}"` };
    }
  }

  return { filters: parsedFilters };
}
