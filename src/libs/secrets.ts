import {
  GetSecretValueCommand,
  GetSecretValueCommandInput,
  GetSecretValueCommandOutput,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

let clientSingleton: SecretsManagerClient | undefined;

/**
 * Forces the AWS endpoint while on localstack
 *
 * endpoint:
 *  LOCALSTACK_HOSTNAME: Current VM IP address, like 172.17.0.2
 *
 * region:
 *  AWS_REGION: Use env defined region or default us-east-1
 */
const getClient = () => {
  if (!clientSingleton) {
    clientSingleton = new SecretsManagerClient({
      endpoint: process.env.LOCALSTACK_HOSTNAME
        ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566`
        : undefined,
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }
  return clientSingleton;
};

export class SecretsManager {
  /**
   * Retrieves a secret from the SecretsManager
   * Requires `secretsmanager:GetSecretValue` and possibly `kms:Decrypt` permission
   * Ref.: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/secrets-manager/command/GetSecretValueCommand/
   * @param {SendMessageCommandInput} params
   * @returns {Promise<SendMessageCommandOutput>}
   */
  static getSecretValue(
    params: GetSecretValueCommandInput,
  ): Promise<GetSecretValueCommandOutput> {
    const client = getClient();
    return client.send(new GetSecretValueCommand(params));
  }
}
