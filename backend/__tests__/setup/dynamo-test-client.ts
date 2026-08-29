import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const rawClient = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

export const testDynamoClient = DynamoDBDocumentClient.from(rawClient);
export const testRawClient = rawClient;
