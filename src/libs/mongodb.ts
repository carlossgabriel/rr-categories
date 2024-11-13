import config from '@utils/config';
import {
  Collection,
  Db,
  DeleteResult,
  Document,
  Filter,
  InsertManyResult,
  InsertOneResult,
  MongoClient,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateResult,
  WithId,
} from 'mongodb';
import { SecretsManager } from './secrets';

const dbName = config.MONGODB_NAME;

const getMongoUri = async (): Promise<string | undefined> => {
  if (config.environment === 'development') return;
  try {
    console.log('AS:DLKJASD:', config.MONGO_URI_SECRET_NAME);
    const secret = await SecretsManager.getSecretValue({
      SecretId: config.MONGO_URI_SECRET_NAME,
    });

    if (secret && secret.SecretString) {
      const secretValue = JSON.parse(secret.SecretString);
      return secretValue.MONGO_URI;
    }
    throw new Error('Secret value not found');
  } catch (err) {
    console.error('Failed to retrieve secret', err);
    throw err;
  }
};

class MongoDB {
  private static instance: MongoDB;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  public async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }
    try {
      const uri = await getMongoUri();
      this.client = await MongoClient.connect(uri || config.MONGODB_URL);
      this.db = this.client.db(dbName);
      console.debug('Connected to MongoDB');
      return this.db;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw new Error('Error establishing a connection with the database');
    }
  }

  public async closeConnection(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.debug('Disconnected from MongoDB');
    }
  }

  public async collectionExists(collectionName: string): Promise<boolean> {
    if (!this.db) await this.connect();
    const collections = await this.db!.listCollections().toArray();
    return collections.some((c) => c.name === collectionName);
  }

  public async createCollection(
    collectionName: string,
  ): Promise<Collection | void> {
    if (!this.db) await this.connect();
    if (await this.collectionExists(collectionName)) {
      console.info(`Collection "${collectionName}" already exists`);
      return;
    }
    const result = await this.db!.createCollection(collectionName);
    console.debug(`Collection "${collectionName}" created successfully`);
    return result;
  }

  public async insertOne<T extends Document>({
    collectionName,
    document,
  }: {
    collectionName: string;
    document: OptionalUnlessRequiredId<T>;
  }): Promise<InsertOneResult<T>> {
    if (!this.db) await this.connect();
    try {
      const result = await this.db!.collection<T>(collectionName).insertOne(
        document,
      );
      console.info('Inserted document:', result.acknowledged);
      return result;
    } catch (error) {
      console.error('Error inserting document:', error);
      throw new Error('Error inserting document');
    }
  }

  public async insertMany<T extends Document>(
    collectionName: string,
    documents: OptionalUnlessRequiredId<T>[],
  ): Promise<InsertManyResult<T>> {
    if (!this.db) await this.connect();
    try {
      if (!this.collectionExists(collectionName)) {
        console.info(`Creating collection "${collectionName}"`);
        await this.createCollection(collectionName);
      }
      const result = await this.db!.collection<T>(collectionName).insertMany(
        documents,
      );
      console.info('Inserted documents:', result.insertedCount);
      return result;
    } catch (error) {
      console.error('Error inserting documents:', error);
      throw new Error('Error inserting documents');
    }
  }

  public async find<T extends Document>({
    collectionName,
    filter,
  }: {
    collectionName: string;
    filter: Filter<T>;
  }): Promise<WithId<T> | null> {
    if (!this.db) await this.connect();
    try {
      const result = await this.db!.collection<T>(collectionName).findOne(
        filter,
      );
      console.info('Found document:', result);
      return result;
    } catch (error) {
      console.error('Error finding document:', error);
      throw new Error('Error finding document');
    }
  }

  public async findMany<T extends Document>(
    collectionName: string,
    filter: Filter<T>,
  ): Promise<WithId<T>[]> {
    if (!this.db) await this.connect();
    try {
      const results = await this.db!.collection<T>(collectionName)
        .find(filter)
        .toArray();
      console.info('Found documents:', results);
      return results;
    } catch (error) {
      console.error('Error finding documents:', error);
      throw new Error('Error finding documents');
    }
  }

  public async updateOne<T extends Document>({
    collectionName,
    filter,
    update,
  }: {
    collectionName: string;
    filter: Filter<T>;
    update: UpdateFilter<T>;
  }): Promise<UpdateResult> {
    if (!this.db) await this.connect();
    try {
      const result = await this.db!.collection<T>(collectionName).updateOne(
        filter,
        update,
      );
      console.info('Updated document:', result.modifiedCount);
      return result;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Error updating document');
    }
  }

  public async updateMany<T extends Document>({
    collectionName,
    filter,
    update,
  }: {
    collectionName: string;
    filter: Filter<T>;
    update: UpdateFilter<T>;
  }): Promise<UpdateResult> {
    if (!this.db) await this.connect();
    try {
      const result = await this.db!.collection<T>(collectionName).updateMany(
        filter,
        update,
      );
      console.info('Updated documents:', result.modifiedCount);
      return result;
    } catch (error) {
      console.error('Error updating documents:', error);
      throw new Error('Error updating documents');
    }
  }

  public async deleteOne<T extends Document>(
    collectionName: string,
    filter: Filter<T>,
  ): Promise<DeleteResult> {
    if (!this.db) await this.connect();
    try {
      const result = await this.db!.collection<T>(collectionName).deleteOne(
        filter,
      );
      console.info('Deleted document:', result.deletedCount);
      return result;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Error deleting document');
    }
  }

  public async deleteMany<T extends Document>({
    collectionName,
    filter,
  }: {
    collectionName: string;
    filter: Filter<T>;
  }): Promise<DeleteResult> {
    if (!this.db) await this.connect();
    try {
      const result = await this.db!.collection<T>(collectionName).deleteMany(
        filter,
      );
      console.info('Deleted documents:', result.deletedCount);
      return result;
    } catch (error) {
      console.error('Error deleting documents:', error);
      throw new Error('Error deleting documents');
    }
  }
}

export default MongoDB.getInstance();
