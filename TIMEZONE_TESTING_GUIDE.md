# Timezone Testing Guide - Pakistan Standard Time (PKT)

## Overview

This guide helps you verify that reminder emails are sent at the correct time according to Pakistan Standard Time (PKT = UTC+5:00).

## Quick Timezone Reference

| Time Zone | UTC Offset | Example |
|-----------|-----------|---------|
| **Pakistan Standard Time (PKT)** | **UTC+5:00** | **2:00 PM PKT = 9:00 AM UTC** |
| Greenwich Mean Time (GMT) | UTC+0:00 | 9:00 AM GMT = 9:00 AM UTC |
| Indian Standard Time (IST) | UTC+5:30 | 2:30 PM IST = 9:00 AM UTC |
| Dubai Time (GST) | UTC+4:00 | 1:00 PM GST = 9:00 AM UTC |

## Test Scenarios

### Test 1: Basic PKT to UTC Conversion

**Objective:** Verify timezone utilities correctly convert PKT to UTC

**Steps:**
1. Open browser console
2. Run the following code:

```javascript
import { convertLocalToUTC, formatPKTDateTime } from './utils/timezoneUtils';

// Test afternoon time
console.log(convertLocalToUTC("2024-12-25", "14:00"));
// Expected: "2024-12-25T09:00:00.000Z" (2 PM PKT = 9 AM UTC)

// Test morning time
console.log(convertLocalToUTC("2024-12-25", "08:00"));
// Expected: "2024-12-25T03:00:00.000Z" (8 AM PKT = 3 AM UTC)

// Test midnight
console.log(convertLocalToUTC("2024-12-25", "00:00"));
// Expected: "2024-12-24T19:00:00.000Z" (midnight PKT = 7 PM previous day UTC)

// Test near midnight
console.log(convertLocalToUTC("2024-12-25", "23:30"));
// Expected: "2024-12-25T18:30:00.000Z" (11:30 PM PKT = 6:30 PM UTC)
```

**Result:** ✅ All conversions should match expected UTC times

### Test 2: UTC to PKT Display Conversion

**Objective:** Verify reminders display correct PKT time to users

**Steps:**
```javascript
import { convertUTCToLocal, formatPKTDateTime } from './utils/timezoneUtils';

// Test conversion back to PKT
const local = convertUTCToLocal("2024-12-25T09:00:00.000Z");
console.log(local.date); // Expected: "2024-12-25"
console.log(local.time); // Expected: "14:00"

// Test formatted display
const formatted = formatPKTDateTime("2024-12-25T09:00:00.000Z");
console.log(formatted);
// Expected: "December 25, 2024 at 2:00 PM PKT"
```

**Result:** ✅ Times should display correctly in PKT

### Test 3: Create Reminder with PKT Time

**Objective:** Create a reminder and verify correct UTC storage

**Prerequisites:**
- Logged in to the app
- Apps Script deployed and configured

**Steps:**
1. Navigate to Create Project/Event page
2. Scroll to "Reminders" section
3. Click "Add Reminder"
4. Fill in:
   - **Title:** "Test PKT Reminder"
   - **Description:** "Testing timezone conversion"
   - **Date:** Tomorrow's date
   - **Time:** 14:00 (2:00 PM)
   - **Notify Emails:** your-email@example.com
5. Submit the project/event

**Verification:**
1. Open Google Sheets "Reminders" sheet
2. Find your reminder row
3. Check `scheduledTimestampUTC` column
4. Should show: `YYYY-MM-DDT09:00:00.000Z` (9:00 AM UTC)
5. Calculation: 14:00 PKT - 5 hours = 09:00 UTC ✅

### Test 4: Reminder Delivery Time

**Objective:** Verify reminder is sent at correct PKT time

**Setup:**
1. Create a reminder for 5 minutes from now in PKT
2. Note the current PKT time (e.g., 2:15 PM PKT)
3. Set reminder for 2:20 PM PKT (5 minutes later)

**Expected UTC Conversion:**
- Current: 2:15 PM PKT = 9:15 AM UTC
- Reminder: 2:20 PM PKT = 9:20 AM UTC

**Steps:**
1. Create reminder as above (5 minutes in future)
2. Wait for Apps Script trigger (runs every 5 minutes)
3. Check email inbox at 2:20 PM PKT

**Verification:**
✅ Email received between 2:20-2:25 PM PKT (within trigger window)
✅ Email subject includes your project name
✅ Email body contains your custom message

### Test 5: Edge Case - Midnight Boundary

**Objective:** Test reminders scheduled around midnight

**Scenario 1: Before Midnight PKT**
```javascript
// 11:30 PM PKT on Dec 25
convertLocalToUTC("2024-12-25", "23:30")
// Expected: "2024-12-25T18:30:00.000Z" (same day in UTC)
```

**Scenario 2: After Midnight PKT**
```javascript
// 12:30 AM PKT on Dec 26 (30 mins after midnight)
convertLocalToUTC("2024-12-26", "00:30")
// Expected: "2024-12-25T19:30:00.000Z" (previous day in UTC!)
```

**Key Point:** A reminder at 1:00 AM PKT on Dec 26 is actually 8:00 PM UTC on Dec 25!

### Test 6: Multiple Timezone Users (Future-Proof)

**Scenario:** User in Dubai (UTC+4) creates reminder, Pakistani user receives it

**Steps:**
1. Dubai user schedules: Dec 25 at 1:00 PM GST (UTC+4)
2. System converts: 1:00 PM GST = 9:00 AM UTC
3. Pakistani user receives: 9:00 AM UTC = 2:00 PM PKT

**Result:** ✅ Email arrives at correct local time for each user

## Common Issues and Solutions

### Issue 1: Reminder sent at wrong time

**Symptoms:**
- Scheduled 2:00 PM PKT but received at different time
- Email arrives 5 hours early or late

**Diagnosis:**
```javascript
// Check conversion
const utc = convertLocalToUTC("2024-12-25", "14:00");
console.log(utc); // Should be 09:00:00.000Z

// Check Google Sheet
// scheduledTimestampUTC should match UTC time above
```

**Solutions:**
1. Verify `timezoneUtils.ts` imported correctly
2. Check browser timezone settings
3. Ensure Apps Script trigger is active
4. Check Google Sheet for correct UTC time

### Issue 2: Date off by one day

**Symptoms:**
- Scheduled Dec 25 but shows Dec 24 or Dec 26 in sheet

**Cause:** Midnight boundary crossing

**Solution:**
- For late night times (11 PM - midnight), UTC will be same day
- For early morning times (midnight - 5 AM PKT), UTC will be previous day
- **This is correct behavior!**

**Example:**
```javascript
// 1 AM PKT on Dec 26
convertLocalToUTC("2024-12-26", "01:00")
// Returns: "2024-12-25T20:00:00.000Z"
// This is CORRECT: 1 AM Dec 26 PKT = 8 PM Dec 25 UTC
```

### Issue 3: Apps Script timezone confusion

**Symptoms:**
- Script shows different time than expected
- Trigger fires at wrong time

**Diagnosis:**
Open Apps Script and check:
```javascript
function testTimezone() {
  Logger.log("Current time (UTC): " + new Date().toISOString());
  Logger.log("Current time (PKT): " + new Date().toLocaleString('en-PK', {timeZone: 'Asia/Karachi'}));
}
```

**Solution:**
- Apps Script runs in UTC (this is correct)
- All comparisons should use UTC
- Display times can use PKT for user visibility

## Verification Checklist

Before deploying to production:

- [ ] Test basic PKT to UTC conversion
- [ ] Test UTC to PKT display conversion  
- [ ] Create test reminder and verify UTC in sheet
- [ ] Test reminder delivery at correct PKT time
- [ ] Test midnight boundary cases
- [ ] Verify email received within 5-minute window
- [ ] Check Google Sheet shows correct UTC
- [ ] Confirm no date off-by-one errors
- [ ] Test with different times (morning, afternoon, night)
- [ ] Document any edge cases for your use case

## Manual Timezone Calculation

**Formula:** PKT Time - 5 hours = UTC Time

**Examples:**
| PKT Time | Calculation | UTC Time |
|----------|-------------|----------|
| 12:00 AM (midnight) | 00:00 - 5 = -5 → 19:00 previous day | 7:00 PM (prev day) |
| 6:00 AM | 06:00 - 5 = 01:00 | 1:00 AM |
| 12:00 PM (noon) | 12:00 - 5 = 07:00 | 7:00 AM |
| 6:00 PM | 18:00 - 5 = 13:00 | 1:00 PM |
| 11:59 PM | 23:59 - 5 = 18:59 | 6:59 PM |

## Reference Links

- **Pakistan Time Now:** https://time.is/Pakistan
- **UTC Time Now:** https://time.is/UTC
- **Timezone Converter:** https://www.timeanddate.com/worldclock/converter.html

## Support

If you encounter timezone issues:

1. Check Google Sheet `scheduledTimestampUTC` column
2. Verify it's in ISO format: `YYYY-MM-DDTHH:MM:SS.000Z`
3. Calculate manually: PKT time - 5 hours should equal UTC time
4. Check Apps Script execution logs for errors
5. Review EmailLogs sheet for delivery status

## Success Criteria

✅ **System is working correctly when:**
- User schedules 2:00 PM PKT reminder
- Google Sheet shows 9:00 AM UTC (2:00 PM - 5 hours)
- Apps Script trigger fires at 9:00 AM UTC
- Email arrives between 2:00-2:05 PM PKT
- User receives email at intended local time

**All timezone handling is working as designed!**
