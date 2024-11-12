import { listCategory } from '@services/list';
import { validateCategoryListInput } from '@utils/validations/validateListInput';
import { APIGatewayProxyHandler } from 'aws-lambda';
import formatJSONResponse from '@libs/apiGateway';

export const list: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Received event:', event);
    const filters = event.queryStringParameters || {};
    console.log('Filters:', filters);

    const validationResult = validateCategoryListInput(filters);
    console.log('Validation result:', validationResult);
    if ('error' in validationResult) {
      console.log('Validation error:', validationResult.error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: validationResult.error }),
      };
    }

    const categories = await listCategory({
      filters: validationResult.filters,
    });
    console.log('Categories found:', categories);

    return formatJSONResponse(200, { categories });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
