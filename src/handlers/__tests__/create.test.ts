import { createCategory } from '@services/create';
import { validateCategoryCreationInput } from '@utils/validations/validateCreateInput';
import formatJSONResponse from '@libs/apiGateway';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { create } from '@handlers/create';

jest.mock('@services/create');
jest.mock('@utils/validations/validateCreateInput');
jest.mock('@libs/apiGateway');
jest.mock('console');

const mockCreateCategory = createCategory as jest.Mock;
const mockValidateInput = validateCategoryCreationInput as jest.Mock;
const mockFormatJSONResponse = formatJSONResponse as jest.Mock;

describe('createCategory Lambda Function', () => {
  let event: APIGatewayProxyEvent;
  let context: Context;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    event = {
      body: JSON.stringify({
        name: 'Test Category',
        description: 'Test Description',
      }),
    } as any as APIGatewayProxyEvent;

    context = {} as Context;

    jest.clearAllMocks();
  });

  it('should create a category successfully', async () => {
    mockValidateInput.mockReturnValue({
      category: { name: 'Test Category', description: 'Test Description' },
      isRoot: true,
    });
    mockCreateCategory.mockResolvedValue({
      id: '123',
      name: 'Test Category',
      description: 'Test Description',
    });
    mockFormatJSONResponse.mockReturnValue({
      statusCode: 201,
      body: JSON.stringify({
        newCategory: {
          id: '123',
          name: 'Test Category',
          description: 'Test Description',
        },
      }),
    });

    const result = await create(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith(
      JSON.parse(event.body || '{}'),
    );
    expect(mockCreateCategory).toHaveBeenCalledWith(
      { name: 'Test Category', description: 'Test Description' },
      true,
    );
    expect(mockFormatJSONResponse).toHaveBeenCalledWith(201, {
      newCategory: {
        id: '123',
        name: 'Test Category',
        description: 'Test Description',
      },
    });
    expect(result).toEqual({
      statusCode: 201,
      body: JSON.stringify({
        newCategory: {
          id: '123',
          name: 'Test Category',
          description: 'Test Description',
        },
      }),
    });
  });

  it('should return a validation error if input is invalid', async () => {
    mockValidateInput.mockReturnValue({ error: 'Validation error' });
    mockFormatJSONResponse.mockReturnValue({
      statusCode: 400,
      body: JSON.stringify({ message: 'Validation error' }),
    });

    const result = await create(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith(
      JSON.parse(event.body || '{}'),
    );
    expect(mockFormatJSONResponse).toHaveBeenCalledWith(400, {
      message: 'Validation error',
    });
    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'Validation error' }),
    });
  });

  it('should handle unexpected errors gracefully', async () => {
    mockValidateInput.mockReturnValue({
      category: { name: 'Test Category', description: 'Test Description' },
      isRoot: true,
    });
    mockCreateCategory.mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    mockFormatJSONResponse.mockReturnValue({
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });

    const result = await create(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith(
      JSON.parse(event.body || '{}'),
    );
    expect(mockCreateCategory).toHaveBeenCalledWith(
      { name: 'Test Category', description: 'Test Description' },
      true,
    );
    expect(mockFormatJSONResponse).toHaveBeenCalledWith(500, {
      error: 'Internal Server Error',
    });
    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });
});
