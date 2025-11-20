import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'App'

if (!uri) throw new Error('Please define MONGODB_URI in .env.local')

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const client = new MongoClient(uri)
const clientPromise = global._mongoClientPromise || (global._mongoClientPromise = client.connect())

export async function getDb() {
  const c = await clientPromise
  return c.db(dbName)
}