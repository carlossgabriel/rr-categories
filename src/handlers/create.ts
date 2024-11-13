import { APIGatewayProxyHandler } from 'aws-lambda';
import { validateCategoryCreationInput } from '@utils/validations/validateCreateInput';
import formatJSONResponse from '@libs/apiGateway';
import { createCategory } from '@services/create';
import mongodb from '@libs/mongodb';

export const create: APIGatewayProxyHandler = async (event) => {
  try {
    console.debug('Received event:', event);

    const requestBody = JSON.parse(event.body || '{}');

    console.debug('Request body:', requestBody);

    const categoryInput = validateCategoryCreationInput(requestBody);
    console.debug('Validation result:', categoryInput);

    if ('error' in categoryInput) {
      return formatJSONResponse(400, { message: categoryInput.error });
    }

    const newCategory = await createCategory(
      categoryInput.category,
      categoryInput.isRoot,
    );

    console.debug('New categoryId:', newCategory);
    mongodb.closeConnection();

    return formatJSONResponse(201, {
      newCategory,
    });
  } catch (error) {
    mongodb.closeConnection();
    console.error('Internal Server Error:', error);

    return formatJSONResponse(500, { error: 'Internal Server Error' });
  }
};
