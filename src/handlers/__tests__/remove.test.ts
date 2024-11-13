import { remove } from '@handlers/remove';
import { removeCategory } from '@services/remove';
import { validateCategoryDeleteInput } from '@utils/validations/validateDeleteInput';
import formatJSONResponse from '@libs/apiGateway';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

jest.mock('@services/remove');
jest.mock('@utils/validations/validateDeleteInput');
jest.mock('@libs/apiGateway');

const mockRemoveCategory = removeCategory as jest.Mock;
const mockValidateInput = validateCategoryDeleteInput as jest.Mock;
const mockFormatJSONResponse = formatJSONResponse as jest.Mock;

describe('removeCategory Lambda Function', () => {
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
    } as any as APIGatewayProxyEvent;

    context = {} as Context;

    jest.clearAllMocks();
  });

  it('should delete a category successfully', async () => {
    mockValidateInput.mockReturnValue({ categoryId: '123' });
    mockFormatJSONResponse.mockReturnValue({
      statusCode: 200,
      body: JSON.stringify({ message: 'Category deleted successfully' }),
    });
    mockRemoveCategory.mockReturnValue(true);

    const result = await remove(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith('123');
    expect(mockRemoveCategory).toHaveBeenCalledWith('123');
    expect(mockFormatJSONResponse).toHaveBeenCalledWith(200, {
      message: 'Category deleted successfully',
    });
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: 'Category deleted successfully' }),
    });
  });

  it('should return a validation error if input is invalid', async () => {
    mockValidateInput.mockReturnValue({ error: 'Validation error' });
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({ error: 'Validation error' }),
    };

    const result = await remove(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith('123');
    expect(result).toEqual(expectedResponse);
  });

  it('should handle unexpected errors gracefully', async () => {
    mockValidateInput.mockReturnValue({ categoryId: '123' });
    mockRemoveCategory.mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };

    const result = await remove(event, context, () => null);

    expect(mockValidateInput).toHaveBeenCalledWith('123');
    expect(mockRemoveCategory).toHaveBeenCalledWith('123');
    expect(result).toEqual(expectedResponse);
  });
});
