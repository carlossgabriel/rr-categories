import { removeCategory } from '@services/remove';
import { validateCategoryDeleteInput } from '@utils/validations/validateDeleteInput';
import { APIGatewayProxyHandler } from 'aws-lambda';
import formatJSONResponse from '@libs/apiGateway';
import mongodb from '@libs/mongodb';

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
    const result = await removeCategory(validationResult.categoryId);
    mongodb.closeConnection();

    if (!result) {
      console.log('Category not found');

      return formatJSONResponse(404, {
        message: 'Category not found',
      });
    }

    console.log('Category deleted successfully');
    return formatJSONResponse(200, {
      message: 'Category deleted successfully',
    });
  } catch (error) {
    mongodb.closeConnection();

    console.error('Internal Server Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
