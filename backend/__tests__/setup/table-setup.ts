import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  waitUntilTableExists,
  waitUntilTableNotExists,
} from '@aws-sdk/client-dynamodb';
import { testRawClient } from './dynamo-test-client';

export const TEST_TABLE_NAME = 'ClaroEcommerce-test';

export async function createTestTable(tablename?: string): Promise<void> {
  const table = tablename || TEST_TABLE_NAME;
  try {
    await testRawClient.send(new DescribeTableCommand({ TableName: table }));
    return;
  } catch {
    // tabla no existe, la creamos
  }

  try {
    await testRawClient.send(
      new CreateTableCommand({
        TableName: table,
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
          { AttributeName: 'GSI1PK', AttributeType: 'S' },
          { AttributeName: 'GSI1SK', AttributeType: 'S' },
          { AttributeName: 'GSI2PK', AttributeType: 'S' },
          { AttributeName: 'GSI2SK', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
          {
            IndexName: 'GSI2',
            KeySchema: [
              { AttributeName: 'GSI2PK', KeyType: 'HASH' },
              { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
      }),
    );

    await waitUntilTableExists({ client: testRawClient, maxWaitTime: 30 }, { TableName: table });
  } catch (error) {
    console.log('NO SE LOGRO CREAR LA TABLA', error);
  }
}

export async function deleteTestTable(tablename?: string): Promise<void> {
  const table = tablename || TEST_TABLE_NAME;
  try {
    await testRawClient.send(new DeleteTableCommand({ TableName: table }));
    await waitUntilTableNotExists({ client: testRawClient, maxWaitTime: 30 }, { TableName: table });
  } catch {
    // tabla ya no existe
  }
}
