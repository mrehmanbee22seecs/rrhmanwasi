# Security Best Practices Guide for Wasilah Platform

This guide provides security best practices for developers working on the Wasilah platform.

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Input Validation](#input-validation)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Frontend Security](#frontend-security)
6. [Dependency Management](#dependency-management)
7. [Deployment Security](#deployment-security)

---

## Authentication & Authorization

### ✅ DO

```typescript
// Always check authentication before sensitive operations
const { currentUser } = useAuth();
if (!currentUser) {
  return <Redirect to="/login" />;
}

// Use Firebase Auth for authentication
await signInWithEmailAndPassword(auth, email, password);

// Check admin status from Firestore
const userDoc = await getDoc(doc(db, 'users', userId));
const isAdmin = userDoc.data()?.isAdmin === true;
```

### ❌ DON'T

```typescript
// Never trust client-side admin checks alone
if (localStorage.getItem('isAdmin') === 'true') { // WRONG!
  showAdminPanel();
}

// Never expose sensitive operations without server-side verification
// All admin operations must be verified in Firestore Rules
```

### Best Practices
- ✅ Use Firebase Authentication for user management
- ✅ Verify admin status from Firestore in security rules
- ✅ Always check authentication state before rendering sensitive components
- ✅ Implement proper session timeout
- ✅ Use secure password requirements (min 8 characters)

---

## Input Validation

### ✅ DO

```typescript
// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email format');
}

// Validate and sanitize user input
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Validate file uploads
const validateImage = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  return file.size <= maxSize && allowedTypes.includes(file.type);
};
```

### ❌ DON'T

```typescript
// Never trust user input without validation
await updateDoc(doc(db, 'users', userId), {
  bio: userInput // WRONG! Validate first
});

// Never allow unrestricted file uploads
const uploadFile = async (file: any) => { // WRONG! Validate type and size
  await uploadBytes(storageRef, file);
};
```

### Validation Checklist
- ✅ Validate email format
- ✅ Validate phone numbers
- ✅ Sanitize text inputs (remove HTML/scripts)
- ✅ Validate file types and sizes
- ✅ Validate URLs before redirects
- ✅ Validate numeric inputs (min/max)
- ✅ Validate date ranges

---

## Data Protection

### ✅ DO

```typescript
// Use environment variables for sensitive data
const apiKey = import.meta.env.VITE_MAILERSEND_API_KEY;

// Never log sensitive information
console.log('Processing payment for user:', userId); // OK
// console.log('Payment details:', paymentData); // WRONG!

// Encrypt sensitive data at rest (Firebase does this by default)
// Use HTTPS for all data in transit (Firebase Hosting enforces this)
```

### ❌ DON'T

```typescript
// Never hardcode secrets
const API_KEY = 'sk-1234567890abcdef'; // WRONG!

// Never expose sensitive data in client code
const creditCard = user.creditCardNumber; // WRONG! Never store this

// Never log passwords or tokens
console.log('User password:', password); // WRONG!
```

### Data Protection Checklist
- ✅ Store secrets in environment variables
- ✅ Add `.env` to `.gitignore`
- ✅ Use `.env.example` for documentation
- ✅ Never commit API keys or tokens
- ✅ Minimize data collection (privacy by design)
- ✅ Implement data retention policies
- ✅ Use Firebase's encryption at rest

---

## API Security

### ✅ DO

```typescript
// Implement rate limiting
const rateLimit = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
};

// Use proper error handling
try {
  await apiCall();
} catch (error) {
  console.error('API error:', error);
  // Don't expose internal error details to users
  throw new Error('Operation failed. Please try again.');
}

// Validate API responses
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
```

### ❌ DON'T

```typescript
// Never expose internal errors to users
catch (error) {
  alert(error.stack); // WRONG! Security information disclosure
}

// Never allow unlimited API calls
while (true) {
  await apiCall(); // WRONG! No rate limiting
}
```

### API Security Checklist
- ✅ Implement rate limiting
- ✅ Use authentication tokens
- ✅ Validate all inputs
- ✅ Sanitize all outputs
- ✅ Use HTTPS only
- ✅ Implement CORS properly
- ✅ Log security-relevant events

---

## Frontend Security

### ✅ DO

```typescript
// Use React's built-in XSS protection
return <div>{userContent}</div>; // Automatically escaped

// Validate URLs before using them
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

// Use TypeScript for type safety
interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}
```

### ❌ DON'T

```typescript
// Never use dangerouslySetInnerHTML with user content
<div dangerouslySetInnerHTML={{__html: userInput}} /> // WRONG!

// Never disable TypeScript checks
// @ts-ignore // WRONG! Fix the issue instead
const unsafe = userInput;

// Never expose Firebase config to window in production
window.firebase = firebaseConfig; // WRONG! Use dev-only checks
```

### Frontend Security Checklist
- ✅ Use TypeScript for type safety
- ✅ Avoid `dangerouslySetInnerHTML`
- ✅ Validate user inputs
- ✅ Sanitize outputs
- ✅ Use Content Security Policy (CSP)
- ✅ Implement CSRF protection
- ✅ Use secure cookies (httpOnly, secure, sameSite)

---

## Dependency Management

### ✅ DO

```bash
# Regularly check for vulnerabilities
npm audit

# Fix vulnerabilities when possible
npm audit fix

# Update dependencies regularly
npm update

# Review dependency changes
git diff package-lock.json
```

### ❌ DON'T

```bash
# Never ignore security warnings
npm audit fix --force # Be careful with this!

# Never use outdated dependencies
# Check for updates regularly
```

### Dependency Security Checklist
- ✅ Run `npm audit` regularly
- ✅ Keep dependencies updated
- ✅ Review security advisories
- ✅ Use tools like Dependabot
- ✅ Audit new dependencies before adding
- ✅ Remove unused dependencies
- ✅ Pin dependency versions

---

## Deployment Security

### ✅ DO

```bash
# Use environment-specific configs
# Production
npm run build

# Development
npm run dev

# Use proper Firebase rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### ❌ DON'T

```bash
# Never deploy with debug mode enabled
DEBUG=true npm run build # WRONG!

# Never use development keys in production
# Use separate Firebase projects for dev/prod
```

### Deployment Checklist
- ✅ Use separate dev/staging/production environments
- ✅ Enable HTTPS (Firebase does this automatically)
- ✅ Set up proper CORS
- ✅ Configure CSP headers
- ✅ Enable security headers (X-Frame-Options, X-Content-Type-Options)
- ✅ Monitor error logs
- ✅ Set up security alerts
- ✅ Regular backups

---

## Firestore Security Rules Examples

### User Data Protection
```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && request.auth.uid == userId;
  allow update: if isOwnerOrAdmin(userId);
  allow delete: if isAdmin();
}
```

### Public Content with Approval
```javascript
match /project_submissions/{submissionId} {
  // Public can read approved and visible content
  allow read: if (resource.data.status == 'approved' && resource.data.isVisible == true)
              || isOwnerOrAdmin(resource.data.submittedBy);
  allow create: if isAuthenticated();
  allow update, delete: if isOwnerOrAdmin(resource.data.submittedBy);
}
```

### Admin-Only Access
```javascript
match /admin_panel/{document=**} {
  allow read, write: if isAdmin();
}
```

---

## Storage Security Rules Examples

### Image Upload with Validation
```javascript
match /uploads/{fileName} {
  allow read: if true;
  allow write: if isAuthenticated() && 
                  request.resource.size < 5 * 1024 * 1024 &&
                  request.resource.contentType.matches('image/.*');
}
```

---

## Security Monitoring

### What to Monitor
1. **Failed authentication attempts**
   - Multiple failed logins from same IP
   - Brute force attempts

2. **Unusual data access patterns**
   - Large data exports
   - Rapid API calls
   - Access to sensitive collections

3. **File upload anomalies**
   - Large file uploads
   - Unusual file types
   - Rapid uploads

4. **Admin actions**
   - User privilege changes
   - Bulk deletions
   - Configuration changes

### Setting Up Alerts

```typescript
// Example: Log security events
const logSecurityEvent = async (event: string, details: any) => {
  await addDoc(collection(db, 'security_logs'), {
    event,
    details,
    timestamp: serverTimestamp(),
    userId: auth.currentUser?.uid,
  });
};

// Example: Alert on suspicious activity
if (failedLoginAttempts > 5) {
  await logSecurityEvent('SUSPICIOUS_LOGIN_ATTEMPTS', {
    ip: userIp,
    attempts: failedLoginAttempts,
  });
  // Send alert to admins
}
```

---

## Incident Response

### In Case of Security Breach

1. **Immediate Actions**
   - Revoke compromised credentials
   - Reset affected user passwords
   - Disable compromised accounts
   - Block suspicious IPs

2. **Investigation**
   - Check audit logs
   - Identify affected data
   - Determine breach scope
   - Document timeline

3. **Recovery**
   - Restore from backups if needed
   - Update security rules
   - Patch vulnerabilities
   - Deploy fixes

4. **Post-Incident**
   - Notify affected users (if required by law)
   - Update security procedures
   - Conduct security training
   - Improve monitoring

---

## Security Checklist for Pull Requests

Before merging any PR, verify:

- [ ] No hardcoded secrets or API keys
- [ ] Input validation implemented
- [ ] Authentication checks in place
- [ ] Authorization verified
- [ ] Error handling doesn't leak sensitive info
- [ ] No SQL injection possibilities
- [ ] No XSS vulnerabilities
- [ ] Rate limiting implemented (if needed)
- [ ] Firestore rules updated (if schema changed)
- [ ] Tests include security test cases
- [ ] Dependencies are up to date
- [ ] CodeQL scan passed
- [ ] No `any` types without good reason
- [ ] Proper TypeScript types used

---

## Quick Reference

### Secure Coding Patterns

```typescript
// ✅ Good: Type-safe with validation
interface UserInput {
  email: string;
  name: string;
}

const validateInput = (input: UserInput): boolean => {
  return emailRegex.test(input.email) && input.name.length > 0;
};

// ✅ Good: Error handling without info disclosure
try {
  await dangerousOperation();
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('Something went wrong. Please try again.');
}

// ✅ Good: Authentication check
if (!currentUser || !isAdmin) {
  throw new Error('Unauthorized');
}

// ✅ Good: Environment variables
const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) {
  throw new Error('API key not configured');
}
```

---

## Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

*Last Updated: November 2, 2025*
