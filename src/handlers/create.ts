import { APIGatewayProxyHandler } from 'aws-lambda';
import { validateCategoryCreationInput } from '@utils/validations/validateCreateInput';
import formatJSONResponse from '@libs/apiGateway';
import { createCategory } from '@services/create';

export const create: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Received event:', event);

    const requestBody = JSON.parse(event.body || '{}');

    console.log('Request body:', requestBody);

    const result = validateCategoryCreationInput(requestBody);
    console.log('Validation result:', result);

    if ('error' in result) {
      return formatJSONResponse(400, { message: result.error });
    }

    const newCategory = await createCategory(result.category, result.isRoot);

    console.log('New category:', newCategory);

    return formatJSONResponse(201, {
      newCategory,
    });
  } catch (error) {
    console.error('Internal Server Error:', error);

    return formatJSONResponse(500, { error: 'Internal Server Error' });
  }
};
