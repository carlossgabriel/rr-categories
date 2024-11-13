import { getCategory } from '@services/get';
import formatJSONResponse from '@libs/apiGateway';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { validateCategoryGetInput } from '@utils/validations/validateGetInput';
import { get } from '@handlers/get';

jest.mock('@services/get');
jest.mock('@utils/validations/validateGetInput');
jest.mock('@libs/apiGateway');

const mockGetCategory = getCategory as jest.Mock;
const mockValidateInput = validateCategoryGetInput as jest.Mock;
const mockFormatJSONResponse = formatJSONResponse as jest.Mock;

describe('getCategory Lambda Function', () => {
  let event: APIGatewayProxyEvent;
  let context: Context;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    event = {
      body: JSON.stringify({}),
      httpMethod: 'GET',
      headers: {},
      pathParameters: {
        attribute: 'id',
        value: '123',
      },
    } as unknown as APIGatewayProxyEvent;

    context = {} as Context;

    jest.clearAllMocks();
  });

  it('should return a category successfully', async () => {
    mockValidateInput.mockReturnValue({ attribute: 'id', value: '123' });
    mockGetCategory.mockResolvedValue({
      id: '123',
      name: 'Test Category',
      description: 'Test Description',
    });
    mockFormatJSONResponse.mockReturnValue({
      statusCode: 200,
      body: JSON.stringify({
        category: {
          id: '123',
          name: 'Test Category',
          description: 'Test Description',
        },
      }),
    });

    const result = await get(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith('id', '123');
    expect(mockGetCategory).toHaveBeenCalledWith('id', '123');
    expect(mockFormatJSONResponse).toHaveBeenCalledWith(200, {
      category: {
        id: '123',
        name: 'Test Category',
        description: 'Test Description',
      },
    });
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        category: {
          id: '123',
          name: 'Test Category',
          description: 'Test Description',
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

    const result = await get(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith('id', '123');
    expect(result).toEqual(expectedResponse);
  });

  it('should return 404 if category is not found', async () => {
    mockValidateInput.mockReturnValue({ attribute: 'id', value: '123' });
    mockGetCategory.mockResolvedValue(null);
    const expectedResponse = {
      statusCode: 404,
      body: JSON.stringify({ error: 'Category not found' }),
    };

    const result = await get(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith('id', '123');
    expect(mockGetCategory).toHaveBeenCalledWith('id', '123');
    expect(result).toEqual(expectedResponse);
  });

  it('should handle unexpected errors gracefully', async () => {
    mockValidateInput.mockReturnValue({ attribute: 'id', value: '123' });
    mockGetCategory.mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };

    const result = await get(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith('id', '123');
    expect(mockGetCategory).toHaveBeenCalledWith('id', '123');
    expect(result).toEqual(expectedResponse);
  });
});
