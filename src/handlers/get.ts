import { getCategory } from '@services/get';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { validateCategoryGetInput } from '../utils/validations/validateGetInput';
import formatJSONResponse from '@libs/apiGateway';

export const get: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Received event:', event);
    const { attribute, value } = event.pathParameters || {};

    const validationResult = validateCategoryGetInput(attribute, value);
    console.log('Validation result:', validationResult);
    if ('error' in validationResult) {
      console.log('Validation error:', validationResult.error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: validationResult.error }),
      };
    }

    const category = await getCategory(
      validationResult.attribute as 'id' | 'name',
      validationResult.value,
    );
    console.log('Category found:', category);
    if (!category) {
      console.log('Category not found');
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Category not found' }),
      };
    }

    return formatJSONResponse(200, { category });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
