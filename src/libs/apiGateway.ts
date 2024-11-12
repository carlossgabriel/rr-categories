import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

type ValidatedAPIGatewayProxyEvent<S extends JSONSchema> = Omit<
  APIGatewayProxyEvent,
  'body'
> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S extends JSONSchema> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export const formatJSONResponse = (
  code: number,
  response: Record<string, unknown>,
): APIGatewayProxyResult => ({
  statusCode: code,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(response),
});

export default formatJSONResponse;
