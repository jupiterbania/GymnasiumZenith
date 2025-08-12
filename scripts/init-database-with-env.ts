import { initializeDatabase } from '../src/lib/database-init';

// Set the MongoDB URI environment variable
process.env.MONGODB_URI = 'mongodb+srv://jupiterbania472:KDYd7oJAbDwv60v9@gymnasium.6dylxfl.mongodb.net/?retryWrites=true&w=majority&appName=Gymnasium';

async function main() {
  try {
    console.log('🚀 Starting database initialization...');
    await initializeDatabase();
    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Database initialization failed:', error);
    process.exit(1);
  }
}

main();
