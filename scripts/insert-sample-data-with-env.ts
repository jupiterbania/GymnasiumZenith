import { insertSampleData } from './sample-data';

// Set the MongoDB URI environment variable
process.env.MONGODB_URI = 'mongodb+srv://jupiterbania472:KDYd7oJAbDwv60v9@gymnasium.6dylxfl.mongodb.net/?retryWrites=true&w=majority&appName=Gymnasium';

async function main() {
  try {
    console.log('🚀 Starting sample data insertion...');
    await insertSampleData();
    console.log('🎉 Sample data insertion completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Sample data insertion failed:', error);
    process.exit(1);
  }
}

main();
