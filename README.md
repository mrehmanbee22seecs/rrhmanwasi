# Wasilah Platform

A comprehensive platform for managing charitable projects, events, and community engagement.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [Deployment](#deployment)
- [QA Checklist](#qa-checklist)
- [Security](#security)
- [Documentation](#documentation)

---

## 🎯 Overview

Wasilah is a full-stack web application built with React, TypeScript, Firebase, and Vite. It enables organizations to manage projects, events, volunteers, and community interactions through an intuitive interface with admin controls.

**Tech Stack:**
- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Firebase (Auth, Firestore, Storage, Functions)
- **Build Tool:** Vite
- **Deployment:** Vercel (Frontend), Firebase (Backend)
- **CI/CD:** GitHub Actions

---

## ✨ Features

- 🔐 User authentication (Email, Google, Facebook)
- 📊 Admin dashboard with full CRUD operations
- 📝 Project and event submission workflow
- 🤖 AI-powered chatbot with knowledge base
- 📁 File upload with Cloudinary/Firebase Storage
- 👥 Volunteer application system
- 📧 Email automation (currently disabled)
- 📱 Fully responsive design
- 🎨 Customizable theme and content

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/mrehmanbee22seecs/rrhmanwasi.git
cd rrhmanwasi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

---

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root with these variables:

```bash
# Firebase Client Configuration (Frontend)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend Configuration (Firebase Functions)

For Firebase Functions, set these as environment variables in Firebase:

```bash
# Service Account (for Admin SDK)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

**Note:** Email features (MailerSend, QStash) are currently disabled. See [EMAIL_SYSTEM_README.md](./EMAIL_SYSTEM_README.md) when ready to enable.

---

## 💻 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Project Structure

```
rrhmanwasi/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── config/         # Configuration files
├── functions/          # Firebase Cloud Functions
├── public/             # Static assets
├── .github/            # GitHub Actions workflows
└── firestore.rules     # Firestore security rules
```

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors (when possible)
npm run lint -- --fix
```

---

## 🌐 Deployment

### Vercel Deployment (Frontend)

1. **Connect Repository to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Set Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all `VITE_*` variables from `.env.example`
   - Deploy: `vercel --prod`

3. **Verify Deployment:**
   - Check build logs for errors
   - Test authentication flows
   - Verify admin panel access

### Firebase Deployment (Backend)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Deploy Storage Rules:**
   ```bash
   firebase deploy --only storage
   ```

4. **Deploy Cloud Functions (when needed):**
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

### CI/CD Pipeline

GitHub Actions automatically runs on every push/PR:
- ✅ Linting
- ✅ Build verification
- ✅ Security audit
- ✅ Dependency scanning

**View Pipeline:** `.github/workflows/ci.yml`

---

## ✅ QA Checklist

### Pre-Deployment Testing

#### Authentication
- [ ] User can sign up with email/password
- [ ] User can log in with email/password
- [ ] User can log in with Google
- [ ] User can log in with Facebook
- [ ] User can reset password
- [ ] User can log out
- [ ] Email verification works
- [ ] Session persists on page reload

#### Project Management
- [ ] Users can view approved projects
- [ ] Authenticated users can submit projects
- [ ] Submitters can view their pending projects
- [ ] Admins can approve/reject projects
- [ ] Admins can edit project details
- [ ] Project images upload successfully
- [ ] Project visibility toggles work

#### Event Management
- [ ] Users can view approved events
- [ ] Authenticated users can submit events
- [ ] Events can be linked to projects
- [ ] Users can register for events
- [ ] Event images upload successfully
- [ ] Event filtering works correctly

#### Admin Panel
- [ ] Admin can access admin panel
- [ ] Non-admins cannot access admin panel
- [ ] CRUD operations work for all content types
- [ ] File uploads work in admin panel
- [ ] Audit logs are created
- [ ] Visibility controls work
- [ ] Bulk operations work

#### Chatbot
- [ ] Chatbot widget appears on all pages
- [ ] Chat responses are relevant
- [ ] Chat history persists
- [ ] Knowledge base is searchable
- [ ] Unanswered queries are logged

#### Forms & Submissions
- [ ] Contact form submits successfully
- [ ] Volunteer application submits
- [ ] Newsletter signup works
- [ ] Form validation works
- [ ] Error messages display correctly

#### Performance
- [ ] Lighthouse score > 90
- [ ] Images are optimized
- [ ] Initial page load < 3s
- [ ] No console errors in production

#### Mobile Responsiveness
- [ ] Layout works on mobile (< 768px)
- [ ] Layout works on tablet (768px - 1024px)
- [ ] Touch interactions work
- [ ] Navigation menu works on mobile

#### Security
- [ ] No API keys in client code
- [ ] Firestore rules prevent unauthorized access
- [ ] Storage rules prevent unauthorized uploads
- [ ] Admin-only functions are protected
- [ ] No sensitive data in console logs

---

## 🔒 Security

### Security Audit Report

A comprehensive security audit has been completed. See [SECURITY-AUDIT-REPORT.md](./SECURITY-AUDIT-REPORT.md) for:
- Critical findings and remediation
- Firestore and Storage rules review
- Code quality assessment
- Deployment checklist
- Incident response plan

### Reporting Security Issues

If you discover a security vulnerability, please email: **security@wasilah.org**

**Do not** open a public GitHub issue for security vulnerabilities.

### Security Best Practices

1. **Never commit secrets** to the repository
2. **Use environment variables** for all configuration
3. **Keep dependencies updated** (`npm audit`)
4. **Review Firestore rules** before major releases
5. **Monitor Firebase usage** for anomalies

---

## 📚 Documentation

### Additional Documentation

- [Email System Documentation](./EMAIL_SYSTEM_README.md) - Email automation setup (currently disabled)
- [Security Audit Report](./SECURITY-AUDIT-REPORT.md) - Comprehensive security review
- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Firebase configuration
- [Cloudinary Setup](./CLOUDINARY_BACKEND_SETUP.md) - Image optimization
- [Chatbot Documentation](./CHATBOT_COMPLETE_SUMMARY.md) - AI chatbot setup

### API Documentation

Firebase Firestore collections:
- `users` - User profiles and settings
- `project_submissions` - Project submissions and approvals
- `event_submissions` - Event submissions and approvals
- `volunteer_applications` - Volunteer sign-ups
- `contact_messages` - Contact form submissions
- `kb` - Chatbot knowledge base
- `chats` - User chat histories

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

- **Email:** info@wasilah.org
- **GitHub Issues:** [Create an issue](https://github.com/mrehmanbee22seecs/rrhmanwasi/issues)
- **Documentation:** See `/docs` folder

---

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Vercel for hosting
- React and TypeScript communities
- All contributors to this project

---

**Last Updated:** November 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
