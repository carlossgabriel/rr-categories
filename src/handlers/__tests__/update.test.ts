import { updateCategory } from '@services/update';
import { validateCategoryUpdateInput } from '@utils/validations/validateUpdateInput';
import formatJSONResponse from '@libs/apiGateway';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { update } from '@handlers/update';

jest.mock('@services/update');
jest.mock('@utils/validations/validateUpdateInput');
jest.mock('@libs/apiGateway');

const mockUpdateCategory = updateCategory as jest.Mock;
const mockValidateInput = validateCategoryUpdateInput as jest.Mock;
const mockFormatJSONResponse = formatJSONResponse as jest.Mock;

describe('updateCategory Lambda Function', () => {
  let event: APIGatewayProxyEvent;
  let context: Context;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    event = {
      pathParameters: {
        categoryId: '123',
      },
      body: JSON.stringify({
        name: 'Updated Category',
        description: 'Updated Description',
      }),
    } as any as APIGatewayProxyEvent;

    context = {} as Context;

    jest.clearAllMocks();
  });

  it('should update a category successfully', async () => {
    mockValidateInput.mockReturnValue({
      categoryId: '123',
      updateFields: {
        name: 'Updated Category',
        description: 'Updated Description',
      },
      newParentId: null,
    });
    mockUpdateCategory.mockResolvedValue({
      id: '123',
      name: 'Updated Category',
      description: 'Updated Description',
    });
    mockFormatJSONResponse.mockReturnValue({
      statusCode: 200,
      body: JSON.stringify({
        updatedCategory: {
          id: '123',
          name: 'Updated Category',
          description: 'Updated Description',
        },
      }),
    });

    const result = await update(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith({
      categoryId: '123',
      requestBody: {
        name: 'Updated Category',
        description: 'Updated Description',
      },
    });
    expect(mockUpdateCategory).toHaveBeenCalledWith({
      categoryId: '123',
      updateFields: {
        name: 'Updated Category',
        description: 'Updated Description',
      },
      newParentId: null,
    });
    expect(mockFormatJSONResponse).toHaveBeenCalledWith(200, {
      updatedCategory: {
        id: '123',
        name: 'Updated Category',
        description: 'Updated Description',
      },
    });
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        updatedCategory: {
          id: '123',
          name: 'Updated Category',
          description: 'Updated Description',
        },
      }),
    });
  });

  it('should return a validation error if input is invalid', async () => {
    mockValidateInput.mockReturnValue({ error: 'Validation error' });
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({ error: 'Validation error' }),
    };

    const result = await update(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith({
      categoryId: '123',
      requestBody: {
        name: 'Updated Category',
        description: 'Updated Description',
      },
    });
    expect(result).toEqual(expectedResponse);
  });

  it('should handle unexpected errors gracefully', async () => {
    mockValidateInput.mockReturnValue({
      categoryId: '123',
      updateFields: {
        name: 'Updated Category',
        description: 'Updated Description',
      },
      newParentId: null,
    });
    mockUpdateCategory.mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };

    const result = await update(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith({
      categoryId: '123',
      requestBody: {
        name: 'Updated Category',
        description: 'Updated Description',
      },
    });
    expect(mockUpdateCategory).toHaveBeenCalledWith({
      categoryId: '123',
      updateFields: {
        name: 'Updated Category',
        description: 'Updated Description',
      },
      newParentId: null,
    });
    expect(result).toEqual(expectedResponse);
  });
});
