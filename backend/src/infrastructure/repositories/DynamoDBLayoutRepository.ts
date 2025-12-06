// ============================================================
// DynamoDB Layout Repository
// ============================================================

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Layout, LayoutRecord } from '../../domain/entities.js';
import { toLayoutRecord, fromLayoutRecord } from '../../domain/entities.js';
import type { LayoutRepository } from '../../shared/repository.js';

const IS_LOCAL = process.env.IS_LOCAL === 'true';
const TABLE_NAME = process.env.TABLE_NAME || 'seatcraft_layouts';

/**
 * DynamoDB クライアントの設定
 */
function createDynamoDBClient(): DynamoDBDocumentClient {
    const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = IS_LOCAL
        ? {
            endpoint: 'http://localhost:8000',
            region: 'ap-northeast-1',
            credentials: {
                accessKeyId: 'dummy',
                secretAccessKey: 'dummy',
            },
        }
        : {
            region: process.env.AWS_REGION || 'ap-northeast-1',
        };

    const client = new DynamoDBClient(clientConfig);
    return DynamoDBDocumentClient.from(client);
}

export class DynamoDBLayoutRepository implements LayoutRepository {
    private readonly client: DynamoDBDocumentClient;
    private readonly tableName: string;

    constructor() {
        this.client = createDynamoDBClient();
        this.tableName = TABLE_NAME;
    }

    async save(layout: Layout): Promise<void> {
        const record = toLayoutRecord(layout);

        await this.client.send(
            new PutCommand({
                TableName: this.tableName,
                Item: record,
            })
        );
    }

    async findById(id: string): Promise<Layout | null> {
        const result = await this.client.send(
            new GetCommand({
                TableName: this.tableName,
                Key: { id },
            })
        );

        if (!result.Item) {
            return null;
        }

        return fromLayoutRecord(result.Item as LayoutRecord);
    }
}
