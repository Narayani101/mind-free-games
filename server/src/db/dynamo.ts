import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
  type CreateTableCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { DbAdapter } from './interface.js';
import type { GameConfigDoc, ScoreDoc, SessionDoc, UserDoc } from '../types.js';
import { defaultGameConfigs } from '../gameConfigs.js';

export class DynamoDbAdapter implements DbAdapter {
  raw: DynamoDBClient;
  doc: DynamoDBDocumentClient;
  prefix: string;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    const endpoint = process.env.DYNAMODB_ENDPOINT;
    this.raw = new DynamoDBClient({
      region,
      ...(endpoint ? { endpoint } : {}),
    });
    this.doc = DynamoDBDocumentClient.from(this.raw, {
      marshallOptions: { removeUndefinedValues: true },
    });
    this.prefix = process.env.TABLE_PREFIX || 'MindFreeGames';
  }

  usersTable() {
    return `${this.prefix}Users`;
  }
  sessionsTable() {
    return `${this.prefix}Sessions`;
  }
  scoresTable() {
    return `${this.prefix}Scores`;
  }
  configsTable() {
    return `${this.prefix}Configs`;
  }

  async ensureTables(): Promise<void> {
    const defs = [
      {
        TableName: this.usersTable(),
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'email', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'email-index',
            KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
      },
      {
        TableName: this.sessionsTable(),
        KeySchema: [{ AttributeName: 'sessionId', KeyType: 'HASH' }],
        AttributeDefinitions: [
          { AttributeName: 'sessionId', AttributeType: 'S' },
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'gameId', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'user-game-index',
            KeySchema: [
              { AttributeName: 'userId', KeyType: 'HASH' },
              { AttributeName: 'gameId', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
      },
      {
        TableName: this.scoresTable(),
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'gameId', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'gameId', AttributeType: 'S' },
        ],
      },
      {
        TableName: this.configsTable(),
        KeySchema: [{ AttributeName: 'gameId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'gameId', AttributeType: 'S' }],
      },
    ];

    for (const spec of defs) {
      try {
        await this.raw.send(new DescribeTableCommand({ TableName: spec.TableName }));
      } catch (e) {
        if (e instanceof ResourceNotFoundException) {
          await this.raw.send(
            new CreateTableCommand({
              ...(spec as CreateTableCommandInput),
              BillingMode: 'PAY_PER_REQUEST',
            })
          );
        } else throw e;
      }
    }

    for (const c of defaultGameConfigs) {
      await this.putGameConfig(c);
    }
  }

  async createUser(user: UserDoc): Promise<void> {
    await this.doc.send(
      new PutCommand({
        TableName: this.usersTable(),
        Item: { ...user, email: user.email.toLowerCase() },
        ConditionExpression: 'attribute_not_exists(userId)',
      })
    );
  }

  async getUserByEmail(email: string): Promise<UserDoc | null> {
    const r = await this.doc.send(
      new QueryCommand({
        TableName: this.usersTable(),
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :e',
        ExpressionAttributeValues: { ':e': email.toLowerCase() },
        Limit: 1,
      })
    );
    const item = r.Items?.[0];
    if (!item) return null;
    return item as UserDoc;
  }

  async getUserById(userId: string): Promise<UserDoc | null> {
    const r = await this.doc.send(
      new GetCommand({ TableName: this.usersTable(), Key: { userId } })
    );
    return (r.Item as UserDoc) ?? null;
  }

  async upsertSession(s: SessionDoc): Promise<void> {
    await this.doc.send(
      new PutCommand({
        TableName: this.sessionsTable(),
        Item: s,
      })
    );
  }

  async getSession(sessionId: string): Promise<SessionDoc | null> {
    const r = await this.doc.send(
      new GetCommand({ TableName: this.sessionsTable(), Key: { sessionId } })
    );
    return (r.Item as SessionDoc) ?? null;
  }

  async listSessionsForUser(userId: string, gameId?: string): Promise<SessionDoc[]> {
    if (gameId) {
      const r = await this.doc.send(
        new QueryCommand({
          TableName: this.sessionsTable(),
          IndexName: 'user-game-index',
          KeyConditionExpression: 'userId = :u AND gameId = :g',
          ExpressionAttributeValues: { ':u': userId, ':g': gameId },
        })
      );
      return ((r.Items as SessionDoc[]) ?? []).sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
      );
    }
    const r = await this.doc.send(
      new QueryCommand({
        TableName: this.sessionsTable(),
        IndexName: 'user-game-index',
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: { ':u': userId },
      })
    );
    return ((r.Items as SessionDoc[]) ?? []).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }

  async upsertScore(s: ScoreDoc): Promise<void> {
    await this.doc.send(
      new PutCommand({
        TableName: this.scoresTable(),
        Item: s,
      })
    );
  }

  async getScore(userId: string, gameId: string): Promise<ScoreDoc | null> {
    const r = await this.doc.send(
      new GetCommand({
        TableName: this.scoresTable(),
        Key: { userId, gameId },
      })
    );
    return (r.Item as ScoreDoc) ?? null;
  }

  async listScores(userId: string): Promise<ScoreDoc[]> {
    const r = await this.doc.send(
      new QueryCommand({
        TableName: this.scoresTable(),
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: { ':u': userId },
      })
    );
    return (r.Items as ScoreDoc[]) ?? [];
  }

  async getGameConfig(gameId: string): Promise<GameConfigDoc | null> {
    const r = await this.doc.send(
      new GetCommand({ TableName: this.configsTable(), Key: { gameId } })
    );
    return (r.Item as GameConfigDoc) ?? null;
  }

  async listGameConfigs(): Promise<GameConfigDoc[]> {
    const r = await this.doc.send(
      new ScanCommand({ TableName: this.configsTable() })
    );
    return (r.Items as GameConfigDoc[]) ?? [];
  }

  async putGameConfig(c: GameConfigDoc): Promise<void> {
    await this.doc.send(
      new PutCommand({
        TableName: this.configsTable(),
        Item: c,
      })
    );
  }
}
