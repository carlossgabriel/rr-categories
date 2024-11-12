export function validateCategoryGetInput(
  attribute: string | undefined,
  value: string | undefined,
):
  | { error: string; attribute?: undefined; value?: undefined }
  | { attribute: string; value: string; error?: undefined } {
  if (!attribute || (attribute !== 'id' && attribute !== 'name')) {
    return {
      error: 'Validation error: attribute must be either "id" or "name"',
    };
  }

  if (!value) {
    return { error: 'Validation error: value is required' };
  }

  return {
    attribute,
    value,
  };
}
