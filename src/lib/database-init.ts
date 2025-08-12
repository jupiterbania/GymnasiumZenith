import { connectToDatabase } from './mongodb';
import { Collection } from 'mongodb';

export async function initializeDatabase() {
  try {
    const db = await connectToDatabase();
    console.log('🔧 Initializing database collections and indexes...');

    // Initialize collections with proper indexes
    await initializeMembersCollection(db);
    await initializeGalleryCollection(db);
    await initializePostsCollection(db);
    await initializeExpensesCollection(db);
    await initializeSettingsCollection(db);

    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function initializeMembersCollection(db: any) {
  const collection = db.collection('members');
  
  // Create indexes for better query performance
  await collection.createIndex({ memberId: 1 }, { unique: true });
  await collection.createIndex({ phone: 1 });
  await collection.createIndex({ email: 1 }, { sparse: true });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ startDate: -1 });
  await collection.createIndex({ showOnHomepage: 1 });
  
  console.log('✅ Members collection initialized with indexes');
}

async function initializeGalleryCollection(db: any) {
  const collection = db.collection('gallery');
  
  // Create indexes for better query performance
  await collection.createIndex({ category: 1 });
  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ showOnHomepage: 1 });
  await collection.createIndex({ type: 1 });
  
  console.log('✅ Gallery collection initialized with indexes');
}

async function initializePostsCollection(db: any) {
  const collection = db.collection('posts');
  
  // Create indexes for better query performance
  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ showOnHomepage: 1 });
  await collection.createIndex({ title: 'text', content: 'text' });
  
  console.log('✅ Posts collection initialized with indexes');
}

async function initializeExpensesCollection(db: any) {
  const collection = db.collection('expenses');
  
  // Create indexes for better query performance
  await collection.createIndex({ date: -1 });
  await collection.createIndex({ amount: -1 });
  
  console.log('✅ Expenses collection initialized with indexes');
}

async function initializeSettingsCollection(db: any) {
  const collection = db.collection('settings');
  
  // Create indexes for better query performance
  await collection.createIndex({ name: 1 }, { unique: true });
  
  // Insert default fee settings if they don't exist
  const existingFees = await collection.findOne({ name: 'fees' });
  if (!existingFees) {
    await collection.insertOne({
      name: 'fees',
      admissionFee: 1000,
      monthlyFee: 500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Default fee settings created');
  }
  
  console.log('✅ Settings collection initialized with indexes');
}
