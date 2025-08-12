# Gymnasium Zenith 🏋️‍♂️

A modern, full-stack gym management application built with Next.js, TypeScript, MongoDB, and Firebase. Features member management, payment tracking, gallery management, and expense tracking.

## ✨ Features

- **Member Management**: Add, edit, and track gym members with detailed profiles
- **Payment Tracking**: Monitor monthly fees and payment status
- **Gallery Management**: Upload and manage gym photos and videos
- **Blog Posts**: Create and manage announcements and blog posts
- **Expense Tracking**: Monitor gym expenses and financial records
- **Admin Dashboard**: Comprehensive admin interface for gym management
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Live data updates with MongoDB integration

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Auth
- **Deployment**: Render
- **AI Integration**: Google AI (Genkit)
- **State Management**: React Hooks
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account
- Firebase project
- GitHub account (for deployment)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gymnasium-zenith.git
   cd gymnasium-zenith
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string

   # Google AI Configuration (optional)
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Initialize database:**
   ```bash
   npm run db:init
   npm run db:sample
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:9002](http://localhost:9002)

## 📊 Database Setup

The application uses MongoDB with the following collections:

- **members**: Gym member information and payment tracking
- **gallery**: Gallery items (images/videos)
- **posts**: Blog posts and announcements
- **expenses**: Gym expense tracking
- **settings**: Application configuration

### Database Commands:
```bash
# Initialize database collections and indexes
npm run db:init

# Insert sample data for testing
npm run db:sample
```

## 🚀 Deployment

### Deploy to Render

1. **Push to GitHub** (follow the `GITHUB_SETUP_GUIDE.md`)
2. **Connect to Render:**
   - Sign up at [render.com](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository
3. **Configure environment variables** in Render dashboard
4. **Deploy!**

For detailed deployment instructions, see `RENDER_DEPLOYMENT.md`.

## 📁 Project Structure

```
gymnasium-zenith/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── gallery/        # Gallery pages
│   │   ├── members/        # Member pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── header.tsx     # Header component
│   │   └── footer.tsx     # Footer component
│   ├── lib/               # Utility functions
│   │   ├── mongodb.ts     # Database connection
│   │   ├── actions.ts     # Server actions
│   │   └── utils.ts       # Utility functions
│   ├── types/             # TypeScript definitions
│   └── hooks/             # Custom React hooks
├── scripts/               # Database setup scripts
├── docs/                 # Documentation
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🎯 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript check

# Database
npm run db:init          # Initialize database
npm run db:sample        # Insert sample data

# AI/Genkit
npm run genkit:dev       # Start Genkit development
npm run genkit:watch     # Watch mode for Genkit
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `GOOGLE_AI_API_KEY` | Google AI API key | No |

### Database Configuration

The application automatically creates the following indexes for optimal performance:

- **members**: memberId (unique), phone, email, status, startDate
- **gallery**: category, createdAt, showOnHomepage, type
- **posts**: createdAt, showOnHomepage, text search
- **expenses**: date, amount
- **settings**: name (unique)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [documentation](docs/)
2. Review the [database schema](docs/database-schema.md)
3. Check the [deployment guide](RENDER_DEPLOYMENT.md)
4. Open an issue on GitHub

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [MongoDB](https://www.mongodb.com/)
- Authentication with [Firebase](https://firebase.google.com/)
- Deployed on [Render](https://render.com/)

---

**Made with ❤️ for gym management**
