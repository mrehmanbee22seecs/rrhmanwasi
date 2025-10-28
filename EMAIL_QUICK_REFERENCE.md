# Email System - Quick Reference Card

## 🚀 Quick Links

- **Setup Guide:** [EMAIL_SYSTEM_DOCUMENTATION.md](./EMAIL_SYSTEM_DOCUMENTATION.md)
- **Testing Guide:** [EMAIL_TESTING_GUIDE.md](./EMAIL_TESTING_GUIDE.md)
- **Architecture:** [EMAIL_ARCHITECTURE.md](./EMAIL_ARCHITECTURE.md)

## 📧 Email Types Supported

| Email Type | Trigger | Recipient | Purpose |
|------------|---------|-----------|---------|
| **Welcome** | User signup | New user | Welcome + verify email instructions |
| **Submission** | Project/event submitted | Submitter | Confirmation of submission |
| **Approval** | Admin approves | Submitter | Celebrate approval 🎉 |
| **Reminder** | Scheduled time | Specified users | Custom reminder message |
| **Resend Verification** | User clicks resend | Current user | Verification instructions |
| **Password Reset** | Forgot password | User | Firebase Auth (automatic) |

## ⚙️ Setup Checklist (15 minutes)

### Apps Script Setup
- [ ] Create new Apps Script project
- [ ] Copy `apps_script/Code.gs` to project
- [ ] Create "Reminders" Google Sheet with 9 columns
- [ ] Create "EmailLogs" Google Sheet with 5 columns
- [ ] Set 4 Script Properties (SECRET_KEY, 2 sheet IDs, APP_URL)
- [ ] Deploy as Web App (Execute as: Me, Access: Anyone)
- [ ] Create time-driven trigger for `sendScheduledReminders` (every 5 mins)
- [ ] Copy Web App URL

### Frontend Setup
- [ ] Update `.env` with `VITE_APPS_SCRIPT_URL`
- [ ] Update `.env` with `VITE_APPS_SCRIPT_API_KEY` (same as SECRET_KEY)
- [ ] Run `npm install` (if needed)
- [ ] Run `npm run build`
- [ ] Deploy to hosting

## 🧪 Quick Test (5 minutes)

```bash
# Test 1: Sign up new user
# Expected: Welcome email + verification modal

# Test 2: Submit project
# Expected: Confirmation email

# Test 3: Admin approves
# Expected: Approval email with 🎉

# Test 4: Check Google Sheets
# Expected: Entries in EmailLogs
```

## 📊 Monitoring

**EmailLogs Sheet:**
- View all email activity
- Filter by type, status, date
- Check for errors

**Apps Script Executions:**
- Project > Executions
- View runtime, errors, logs

**Reminders Sheet:**
- See pending reminders (sent=FALSE)
- Track sent reminders (sent=TRUE)

## 🔐 Security

- **API Key:** Keep SECRET_KEY secure, rotate monthly
- **Rate Limit:** 5 requests per email per minute
- **Sanitization:** HTML cleaned automatically
- **Validation:** All inputs checked
- **Logging:** All requests logged

## 📈 Quotas

| Plan | Emails/Day | Cost |
|------|------------|------|
| Gmail Free | 100 | $0 |
| Google Workspace | 2,000 | $6/month |
| SendGrid | 10,000+ | Varies |

**Current Usage:** Check EmailLogs sheet daily

## 🐛 Troubleshooting

### Email not sent?
1. Check EmailLogs sheet for errors
2. Verify API key matches (Script Properties vs .env)
3. Check Apps Script Executions
4. Check spam folder

### Reminder not sent?
1. Check Reminders sheet - sent column
2. Verify date/time in UTC and future
3. Check trigger is active
4. Run `sendScheduledReminders()` manually

### Modal not showing?
1. Check browser console for errors
2. Verify z-index (should be 9999)
3. Clear browser cache
4. Check component imported correctly

## 📞 API Reference

**Base URL:** Your Apps Script Web App URL

**All requests require:**
```json
{
  "apiKey": "your-secret-key"
}
```

### Welcome Email
```json
{
  "type": "welcome",
  "name": "John Doe",
  "email": "john@example.com",
  "appUrl": "https://yourapp.com"
}
```

### Submission Email
```json
{
  "type": "submission",
  "name": "John Doe",
  "email": "john@example.com",
  "projectName": "Community Garden",
  "submissionUrl": "https://yourapp.com/dashboard"
}
```

### Approval Email
```json
{
  "type": "approval",
  "name": "John Doe",
  "email": "john@example.com",
  "projectName": "Community Garden",
  "projectUrl": "https://yourapp.com/projects/abc123"
}
```

### Create Reminder
```json
{
  "type": "createReminder",
  "userId": "firebase-uid",
  "name": "John Doe",
  "email": "john@example.com",
  "projectName": "Community Garden",
  "message": "Don't forget supplies!",
  "scheduledTimestampUTC": "2024-12-25T10:00:00.000Z"
}
```

## 💡 Best Practices

1. ✅ **Test thoroughly** before production
2. ✅ **Monitor EmailLogs** daily
3. ✅ **Rotate API keys** monthly
4. ✅ **Check quotas** regularly
5. ✅ **Keep documentation** updated
6. ✅ **Train team** on system
7. ✅ **Set up alerts** for failures
8. ✅ **Have backup plan** for high volume

## 📁 Project Structure

```
rrhmanwasi/
├── apps_script/
│   └── Code.gs                    # Main email service (deploy this)
├── src/
│   ├── utils/
│   │   └── appsScriptEmail.ts    # Frontend helpers
│   ├── components/
│   │   ├── VerificationModal.tsx # Email verification modal
│   │   ├── AuthModal.tsx         # Updated with modal
│   │   └── AdminPanel.tsx        # Updated with approval
│   ├── contexts/
│   │   └── AuthContext.tsx       # Updated with welcome email
│   └── pages/
│       └── CreateSubmission.tsx  # Updated with submission email
├── EMAIL_SYSTEM_DOCUMENTATION.md # Complete setup guide
├── EMAIL_TESTING_GUIDE.md        # Testing procedures
├── EMAIL_ARCHITECTURE.md         # Architecture details
└── .env.example                  # Environment template
```

## 🎯 Success Metrics

After setup, you should have:
- ✅ 100% email delivery rate
- ✅ All logs in EmailLogs sheet
- ✅ Reminders scheduling correctly
- ✅ No security vulnerabilities
- ✅ Clear user experience
- ✅ Comprehensive monitoring

## 📚 Documentation Index

| Document | Purpose | Size |
|----------|---------|------|
| EMAIL_SYSTEM_DOCUMENTATION.md | Complete setup & deployment | 12KB |
| EMAIL_TESTING_GUIDE.md | Step-by-step testing | 9KB |
| EMAIL_ARCHITECTURE.md | System design & flows | 12KB |
| EMAIL_QUICK_REFERENCE.md | This document | 6KB |
| README.md | Main project info | Updated |

## 🚨 Emergency Contacts

**If system fails:**
1. Check EmailLogs sheet immediately
2. Review Apps Script Executions
3. Verify API keys haven't changed
4. Check Gmail quota not exceeded
5. Contact: support@wasillah.org

## 🔄 Maintenance Schedule

- **Daily:** Check EmailLogs for errors
- **Weekly:** Review quota usage
- **Monthly:** Rotate API key
- **Quarterly:** Review and optimize

## 🎓 Training Resources

**For Developers:**
- Read EMAIL_SYSTEM_DOCUMENTATION.md
- Complete EMAIL_TESTING_GUIDE.md
- Review EMAIL_ARCHITECTURE.md

**For Admins:**
- Understand email types
- Know how to check logs
- Practice approving submissions

**For Support:**
- Know common issues
- Understand troubleshooting
- Access to monitoring tools

## ✅ Production Checklist

Before going live:
- [ ] All tests passed
- [ ] API keys secured
- [ ] Monitoring active
- [ ] Team trained
- [ ] Documentation accessible
- [ ] Backup plan ready
- [ ] Quota alerts set
- [ ] Support procedures defined

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
