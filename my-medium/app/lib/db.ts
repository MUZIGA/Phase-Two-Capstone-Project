'use server'

import mongoose, { Mongoose } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI. Please set it in your environment variables.')
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
  } | undefined
}

const cached = global.mongooseConnection || {
  conn: null,
  promise: null,
}

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
    })
  }

  cached.conn = await cached.promise
  global.mongooseConnection = cached
  return cached.conn
}

