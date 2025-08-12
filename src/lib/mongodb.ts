
import { MongoClient, Db } from 'mongodb';

const MONGODB_DB = 'Gymnasium';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  // Read the URI at runtime to handle environment variable changes
  const MONGODB_URI = process.env.MONGODB_URI;
  
  // Check for the URI within the function to handle runtime errors gracefully.
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside your hosting provider settings.');
  }

  const client = new MongoClient(MONGODB_URI);

  await client.connect();
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return db;
}
