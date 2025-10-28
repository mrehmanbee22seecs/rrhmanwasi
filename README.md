# Wasillah Community Platform

A web application connecting volunteers with meaningful community projects and events.

## Features

- 🔐 User authentication with Firebase Auth
- 📧 Complete email system with Google Apps Script
- 📝 Project and event submission system
- ✅ Admin approval workflow
- ⏰ Scheduled reminder system
- 📊 User dashboard and analytics
- 💬 Interactive chatbot
- 🗺️ Interactive maps for locations
- 📱 Responsive design

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Firebase account (Spark plan supported)
- Google account for Apps Script

### Installation

```bash
# Clone the repository
git clone https://github.com/mrehmanbee22seecs/rrhmanwasi.git
cd rrhmanwasi

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your Firebase and Apps Script credentials
```

### Development

```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

## Email System Setup

The application includes a complete email system powered by Google Apps Script. This allows sending emails on the Firebase Spark (free) plan.

**📖 See [EMAIL_SYSTEM_DOCUMENTATION.md](./EMAIL_SYSTEM_DOCUMENTATION.md) for detailed setup instructions.**

Quick overview:
1. Create Google Apps Script project with `apps_script/Code.gs`
2. Set up Google Sheets for reminders and logs
3. Configure Script Properties (API keys, Sheet IDs)
4. Deploy as web app
5. Set up time-driven trigger
6. Add credentials to `.env`

## Firebase Configuration

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password, Google, Facebook)
3. Create Firestore database
4. Add your config to `.env`:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Project Structure

```
rrhmanwasi/
├── apps_script/           # Google Apps Script code
│   ├── Code.gs           # Main email service
│   └── EmailWebhook.gs   # Legacy webhook
├── src/
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   │   ├── appsScriptEmail.ts    # Email service
│   │   └── emailService.ts       # Legacy service
│   └── config/           # Configuration files
├── public/               # Static assets
└── docs/                 # Documentation

```

## Key Documentation

- [Email System Setup](./EMAIL_SYSTEM_DOCUMENTATION.md) - Complete email system guide
- [Firebase Setup](./FIREBASE_SETUP.md) - Firebase configuration
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment
- [Admin Guide](./ADMIN_CMS_GUIDE.md) - Admin panel usage

## Environment Variables

See `.env.example` for all required variables:

```bash
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Apps Script Email Service
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_APPS_SCRIPT_API_KEY=your-secret-api-key-here

# Legacy Email Webhook (Optional)
VITE_EMAIL_WEBHOOK_URL=
VITE_EMAIL_WEBHOOK_TOKEN=
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

Quick deployment:
```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Contact: support@wasillah.org
