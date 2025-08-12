import { connectToDatabase } from '../src/lib/mongodb';
import { Member, GalleryItem, Post, Expense } from '../src/types';

export async function insertSampleData() {
  try {
    const db = await connectToDatabase();
    console.log('📝 Inserting sample data...');

    // Sample Members
    const sampleMembers: Omit<Member, 'id'>[] = [
      {
        memberId: 'M001',
        fullName: 'John Doe',
        dob: '1990-05-15',
        gender: 'Male',
        phone: '+1234567890',
        email: 'john.doe@email.com',
        bloodGroup: 'O+',
        admissionFee: 1000,
        monthlyFee: 500,
        startDate: '2024-01-15',
        notes: 'Regular member, very dedicated',
        status: 'active',
        statusHistory: [
          {
            id: '1',
            status: 'active',
            startDate: '2024-01-15',
            endDate: null
          }
        ],
        payments: [
          {
            id: '1',
            memberId: 'M001',
            amount: 500,
            paymentDate: '2024-01-15',
            month: 'January 2024',
            status: 'Paid'
          },
          {
            id: '2',
            memberId: 'M001',
            amount: 500,
            paymentDate: '2024-02-15',
            month: 'February 2024',
            status: 'Paid'
          }
        ],
        showOnHomepage: true
      },
      {
        memberId: 'M002',
        fullName: 'Jane Smith',
        dob: '1988-12-20',
        gender: 'Female',
        phone: '+1234567891',
        email: 'jane.smith@email.com',
        bloodGroup: 'A+',
        admissionFee: 1000,
        monthlyFee: 500,
        startDate: '2024-02-01',
        notes: 'New member, showing great progress',
        status: 'active',
        statusHistory: [
          {
            id: '1',
            status: 'active',
            startDate: '2024-02-01',
            endDate: null
          }
        ],
        payments: [
          {
            id: '1',
            memberId: 'M002',
            amount: 500,
            paymentDate: '2024-02-01',
            month: 'February 2024',
            status: 'Paid'
          }
        ],
        showOnHomepage: false
      }
    ];

    // Sample Gallery Items
    const sampleGalleryItems: Omit<GalleryItem, 'id'>[] = [
      {
        title: 'Morning Workout Session',
        description: 'Members enjoying their morning workout routine',
        type: 'image',
        url: '/images/morning-workout.jpg',
        category: 'Workout Sessions',
        createdAt: new Date().toISOString(),
        image: '/images/morning-workout.jpg',
        hint: 'High energy morning session',
        showOnHomepage: true
      },
      {
        title: 'Fitness Transformation',
        description: 'Amazing transformation journey of our member',
        type: 'image',
        url: '/images/transformation.jpg',
        category: 'Transformations',
        createdAt: new Date().toISOString(),
        image: '/images/transformation.jpg',
        hint: 'Before and after results',
        showOnHomepage: true
      },
      {
        title: 'Gym Anniversary Event',
        description: 'Celebrating our gym anniversary with members',
        type: 'video',
        url: '/videos/anniversary-event.mp4',
        category: 'Events',
        createdAt: new Date().toISOString(),
        image: '/images/anniversary-thumbnail.jpg',
        hint: 'Special celebration event',
        showOnHomepage: true
      }
    ];

    // Sample Posts
    const samplePosts: Omit<Post, 'id'>[] = [
      {
        title: 'Welcome to Gymnasium Zenith',
        content: 'Welcome to our state-of-the-art gym facility. We offer the best equipment and training programs to help you achieve your fitness goals.',
        imageUrl: '/images/gym-interior.jpg',
        createdAt: new Date().toISOString(),
        redirectUrl: '/about',
        showOnHomepage: true
      },
      {
        title: 'New Equipment Arrival',
        content: 'We have just received new premium equipment to enhance your workout experience. Come check out our latest additions!',
        imageUrl: '/images/new-equipment.jpg',
        createdAt: new Date().toISOString(),
        redirectUrl: '/gallery',
        showOnHomepage: true
      },
      {
        title: 'Monthly Fitness Challenge',
        content: 'Join our monthly fitness challenge and win exciting prizes. Push your limits and achieve new milestones!',
        imageUrl: '/images/fitness-challenge.jpg',
        createdAt: new Date().toISOString(),
        redirectUrl: '/challenges',
        showOnHomepage: false
      }
    ];

    // Sample Expenses
    const sampleExpenses: Omit<Expense, 'id'>[] = [
      {
        description: 'Equipment Maintenance',
        amount: 2500,
        date: '2024-01-15'
      },
      {
        description: 'Utility Bills',
        amount: 800,
        date: '2024-01-20'
      },
      {
        description: 'Cleaning Supplies',
        amount: 300,
        date: '2024-01-25'
      },
      {
        description: 'Staff Training',
        amount: 1500,
        date: '2024-02-01'
      }
    ];

    // Insert sample data
    const membersCollection = db.collection('members');
    const galleryCollection = db.collection('gallery');
    const postsCollection = db.collection('posts');
    const expensesCollection = db.collection('expenses');

    // Check if data already exists
    const existingMembers = await membersCollection.countDocuments();
    if (existingMembers === 0) {
      await membersCollection.insertMany(sampleMembers);
      console.log('✅ Sample members inserted');
    } else {
      console.log('ℹ️ Members collection already has data, skipping');
    }

    const existingGallery = await galleryCollection.countDocuments();
    if (existingGallery === 0) {
      await galleryCollection.insertMany(sampleGalleryItems);
      console.log('✅ Sample gallery items inserted');
    } else {
      console.log('ℹ️ Gallery collection already has data, skipping');
    }

    const existingPosts = await postsCollection.countDocuments();
    if (existingPosts === 0) {
      await postsCollection.insertMany(samplePosts);
      console.log('✅ Sample posts inserted');
    } else {
      console.log('ℹ️ Posts collection already has data, skipping');
    }

    const existingExpenses = await expensesCollection.countDocuments();
    if (existingExpenses === 0) {
      await expensesCollection.insertMany(sampleExpenses);
      console.log('✅ Sample expenses inserted');
    } else {
      console.log('ℹ️ Expenses collection already has data, skipping');
    }

    console.log('🎉 Sample data insertion completed!');
  } catch (error) {
    console.error('❌ Sample data insertion failed:', error);
    throw error;
  }
}
