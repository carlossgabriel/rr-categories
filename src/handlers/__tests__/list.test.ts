import { listCategory } from '@services/list';
import { validateCategoryListInput } from '@utils/validations/validateListInput';
import formatJSONResponse from '@libs/apiGateway';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { list } from '@handlers/list';

jest.mock('@services/list');
jest.mock('@utils/validations/validateListInput');
jest.mock('@libs/apiGateway');

const mockListCategory = listCategory as jest.Mock;
const mockValidateInput = validateCategoryListInput as jest.Mock;
const mockFormatJSONResponse = formatJSONResponse as jest.Mock;

describe('listCategory Lambda Function', () => {
  let event: APIGatewayProxyEvent;
  let context: Context;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    event = {
      queryStringParameters: {
        name: 'Test Category',
      },
    } as any as APIGatewayProxyEvent;

    context = {} as Context;

    jest.clearAllMocks();
  });

  it('should list categories successfully', async () => {
    mockValidateInput.mockReturnValue({ filters: { name: 'Test Category' } });
    mockListCategory.mockResolvedValue([
      { id: '123', name: 'Test Category', description: 'Test Description' },
    ]);
    mockFormatJSONResponse.mockReturnValue({
      statusCode: 200,
      body: JSON.stringify({
        categories: [
          { id: '123', name: 'Test Category', description: 'Test Description' },
        ],
      }),
    });

    const result = await list(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith(
      event.queryStringParameters || {},
    );
    expect(mockListCategory).toHaveBeenCalledWith({
      filters: { name: 'Test Category' },
    });
    expect(mockFormatJSONResponse).toHaveBeenCalledWith(200, {
      categories: [
        { id: '123', name: 'Test Category', description: 'Test Description' },
      ],
    });
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        categories: [
          { id: '123', name: 'Test Category', description: 'Test Description' },
        ],
      }),
    });
  });

  it('should return a validation error if input is invalid', async () => {
    mockValidateInput.mockReturnValue({ error: 'Validation error' });
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({ error: 'Validation error' }),
    };

    const result = await list(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith(
      event.queryStringParameters || {},
    );
    expect(result).toEqual(expectedResponse);
  });

  it('should handle unexpected errors gracefully', async () => {
    mockValidateInput.mockReturnValue({ filters: { name: 'Test Category' } });
    mockListCategory.mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };

    const result = await list(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith(
      event.queryStringParameters || {},
    );
    expect(mockListCategory).toHaveBeenCalledWith({
      filters: { name: 'Test Category' },
    });
    expect(result).toEqual(expectedResponse);
  });
});
