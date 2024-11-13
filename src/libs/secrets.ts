import {
  GetSecretValueCommand,
  GetSecretValueCommandInput,
  GetSecretValueCommandOutput,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

let clientSingleton: SecretsManagerClient | undefined;

const getClient = () => {
  if (!clientSingleton) {
    clientSingleton = new SecretsManagerClient({
      endpoint: process.env.LOCALSTACK_HOSTNAME
        ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566` // LocalStack endpoint
        : undefined, // Use real AWS endpoint when deployed
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
    });
  }
  return clientSingleton;
};

export class SecretsManager {
  static getSecretValue(
    params: GetSecretValueCommandInput,
  ): Promise<GetSecretValueCommandOutput> {
    const client = getClient();
    return client.send(new GetSecretValueCommand(params));
  }
}
