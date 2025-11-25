// lib/testDbConnection.ts
import { connectToDatabase } from './db';

async function testConnection() {
  try {
    await connectToDatabase();
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  } finally {
    process.exit();
  }
}

testConnection();
