import formatJSONResponse from '@libs/apiGateway';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

jest.mock('@libs/apiGateway');

const mockFormatJSONResponse = formatJSONResponse as jest.Mock;

describe('getCategory Lambda Function', () => {
  it('example', async () => {});
});
