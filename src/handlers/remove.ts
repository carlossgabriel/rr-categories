import { removeCategory } from '@services/remove';
import { validateCategoryDeleteInput } from '@utils/validations/validateDeleteInput';
import { APIGatewayProxyHandler } from 'aws-lambda';
import formatJSONResponse from '@libs/apiGateway';

export const remove: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Received event:', event);
    const { categoryId } = event.pathParameters || {};

    const validationResult = validateCategoryDeleteInput(categoryId);
    console.log('Validation result:', validationResult);
    if ('error' in validationResult) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: validationResult.error }),
      };
    }

    console.log('Deleting category:', validationResult.categoryId);
    await removeCategory(validationResult.categoryId);
    console.log('Category deleted successfully');

    return formatJSONResponse(200, {
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
