import { MemoryDb } from './memory.js';
import { DynamoDbAdapter } from './dynamo.js';
import type { DbAdapter } from './interface.js';

let singleton: DbAdapter | null = null;

/** In-memory DB by default (no AWS setup). Set USE_DYNAMODB=true or DYNAMODB_ENDPOINT for DynamoDB. */
export async function getDb(): Promise<DbAdapter> {
  if (singleton) return singleton;
  const useDynamo =
    process.env.USE_DYNAMODB === 'true' ||
    process.env.USE_DYNAMODB === '1' ||
    Boolean(process.env.DYNAMODB_ENDPOINT);
  if (!useDynamo) {
    const m = new MemoryDb();
    await m.ensureTables();
    singleton = m;
    return singleton;
  }
  const d = new DynamoDbAdapter();
  await d.ensureTables();
  singleton = d;
  return singleton;
}

export type { DbAdapter };
