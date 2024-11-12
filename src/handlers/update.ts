import { updateCategory } from '@services/update';
import { validateCategoryUpdateInput } from '@utils/validations/validateUpdateInput';
import { APIGatewayProxyHandler } from 'aws-lambda';
import formatJSONResponse from '@libs/apiGateway';

export const update: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Received event:', event);
    const { categoryId } = event.pathParameters || {};
    const requestBody = JSON.parse(event.body || '{}');

    console.log('Request body:', requestBody);

    const validationResult = validateCategoryUpdateInput({
      categoryId,
      requestBody,
    });
    if ('error' in validationResult) {
      console.log('Validation error:', validationResult.error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: validationResult.error }),
      };
    }

    console.log(
      'Updating category:',
      validationResult.categoryId,
      'with fields:',
      validationResult.updateFields,
      'and new parent category:',
      validationResult.newParentId,
    );
    const updatedCategory = await updateCategory({
      categoryId: validationResult.categoryId,
      updateFields: validationResult.updateFields,
      newParentId: validationResult.newParentId,
    });

    console.log('Updated category:', updatedCategory);

    return formatJSONResponse(200, { updatedCategory });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
