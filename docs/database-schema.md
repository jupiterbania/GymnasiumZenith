# Database Schema Documentation

This document describes the MongoDB collections and their schemas for the Gymnasium Zenith application.

## Collections Overview

The application uses the following MongoDB collections:

1. **members** - Gym member information and payment tracking
2. **gallery** - Gallery items (images/videos) for the website
3. **posts** - Blog posts and announcements
4. **expenses** - Gym expense tracking
5. **settings** - Application configuration settings

## Collection Details

### 1. Members Collection

**Collection Name:** `members`

**Purpose:** Store gym member information, payment history, and status tracking.

**Schema:**
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  memberId: string,                 // Unique member identifier (e.g., "M001")
  fullName: string,                 // Member's full name
  dob: string,                      // Date of birth (YYYY-MM-DD format)
  gender: 'Male' | 'Female' | 'Other',
  phone: string,                    // Phone number
  email?: string,                   // Email address (optional)
  bloodGroup: string,               // Blood group
  admissionFee: number,             // Initial admission fee
  monthlyFee: number,               // Monthly membership fee
  startDate: string,                // Membership start date
  notes?: string,                   // Additional notes
  photoUrl?: string,                // Member photo URL
  status: 'active' | 'inactive',    // Current membership status
  statusHistory: MemberStatus[],    // History of status changes
  payments?: Payment[],             // Payment history
  showOnHomepage?: boolean          // Whether to show on homepage
}
```

**Indexes:**
- `memberId` (unique)
- `phone`
- `email` (sparse)
- `status`
- `startDate` (descending)
- `showOnHomepage`

### 2. Gallery Collection

**Collection Name:** `gallery`

**Purpose:** Store gallery items (images/videos) for the website.

**Schema:**
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  title: string,                    // Item title
  description?: string,             // Item description
  type: 'image' | 'video',          // Media type
  url: string,                      // Media URL
  category: string,                 // Category (e.g., "Events", "Workout Sessions")
  createdAt: string,                // Creation timestamp
  image: string,                    // Image URL (for thumbnails)
  hint?: string,                    // Additional hint text
  showOnHomepage?: boolean          // Whether to show on homepage
}
```

**Indexes:**
- `category`
- `createdAt` (descending)
- `showOnHomepage`
- `type`
- Text index on `title` and `content`

### 3. Posts Collection

**Collection Name:** `posts`

**Purpose:** Store blog posts and announcements.

**Schema:**
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  title: string,                    // Post title
  content: string,                  // Post content
  imageUrl?: string,                // Featured image URL
  createdAt: string,                // Creation timestamp
  redirectUrl?: string,             // Optional redirect URL
  showOnHomepage?: boolean          // Whether to show on homepage
}
```

**Indexes:**
- `createdAt` (descending)
- `showOnHomepage`
- Text index on `title` and `content`

### 4. Expenses Collection

**Collection Name:** `expenses`

**Purpose:** Track gym expenses and financial records.

**Schema:**
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  description: string,              // Expense description
  amount: number,                   // Expense amount
  date: string                      // Expense date (YYYY-MM-DD format)
}
```

**Indexes:**
- `date` (descending)
- `amount` (descending)

### 5. Settings Collection

**Collection Name:** `settings`

**Purpose:** Store application configuration settings.

**Schema:**
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  name: string,                     // Setting name (unique)
  admissionFee: number,             // Default admission fee
  monthlyFee: number,               // Default monthly fee
  createdAt: string,                // Creation timestamp
  updatedAt: string                 // Last update timestamp
}
```

**Indexes:**
- `name` (unique)

## Supporting Types

### MemberStatus
```typescript
{
  id: string,                       // Status change ID
  status: 'active' | 'inactive',    // Status value
  startDate: string,                // When this status started
  endDate: string | null            // When this status ended (null = current)
}
```

### Payment
```typescript
{
  id: string,                       // Payment ID
  memberId: string,                 // Member ID
  amount: number,                   // Payment amount
  paymentDate: string | null,       // Payment date (null if unpaid)
  month: string,                    // Month (e.g., "January 2024")
  status: 'Paid' | 'Unpaid' | 'Inactive'
}
```

## Database Operations

### Initialization
To initialize the database with collections and indexes:
```bash
npm run db:init
```

### Sample Data
To insert sample data for testing:
```bash
npm run db:sample
```

## Best Practices

1. **Indexes:** All collections have appropriate indexes for common query patterns
2. **Validation:** Use TypeScript types for data validation
3. **Error Handling:** All database operations include proper error handling
4. **Caching:** Database connection is cached for better performance
5. **Security:** Sensitive data should be encrypted or stored securely

## Backup and Maintenance

- Regular backups should be performed on the MongoDB database
- Monitor index usage and performance
- Clean up old data periodically
- Update indexes as query patterns change

## Environment Variables

Required environment variables for database connection:
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)
