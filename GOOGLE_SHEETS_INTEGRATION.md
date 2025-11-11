# Google Sheets User Data Integration Guide

## Overview
This system automatically logs user data (email and phone number) to Google Sheets when users submit the initial form and start a survey. It includes automatic deduplication and tracking columns for lead management.

## Architecture

### Components
1. **API Route** (`/api/log-user`) - Backend endpoint that:
   - Validates user data
   - Checks for duplicate entries (same email)
   - Appends new data to Google Sheets
   - Returns deduplication status

2. **Utility Function** (`/functions/log-user.ts`) - Client-side helper that:
   - Calls the API endpoint
   - Handles errors gracefully
   - Allows survey to proceed even if logging fails

3. **Survey Components** - All 4 survey types now call `logUserToSheets()` on form submission:
   - ConciseSurvey
   - ExpandedSurvey
   - UltraQuickSurvey
   - StudyAbroadSurvey

---

## Setup Instructions

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new sheet named something like "User Registrations"
3. Create the following column headers in row 1:
   - **Column A:** Email
   - **Column B:** Phone
   - **Column C:** Survey Type
   - **Column D:** Timestamp
   - **Column E:** Lead Generated
   - **Column F:** Contacted
   - **Column G:** Notes

Example:
```
Email | Phone | Survey Type | Timestamp | Lead Generated | Contacted | Notes
```

### Step 2: Get Google Sheets API Credentials

#### Option A: Using Google Cloud Console (Recommended for Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Sheets API:
   - Search for "Google Sheets API" → Enable it
4. Create API key:
   - Go to **Credentials** → **+ Create Credentials** → **API Key**
   - Copy your API key

#### Option B: Using Service Account (Recommended for Security)

1. In Google Cloud Console, go to **Credentials**
2. **+ Create Credentials** → **Service Account**
3. Fill in the details and create
4. In the service account, go to **Keys** tab
5. **Add Key** → **Create new key** → Choose **JSON**
6. Download the JSON file and store safely
7. Share your Google Sheet with the service account email

### Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_API_KEY=your_api_key_here
```

**How to get GOOGLE_SHEET_ID:**
- Open your Google Sheet
- Look at the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
- Copy the ID between `/d/` and `/edit`

**Example .env.local:**
```env
GOOGLE_SHEET_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o
GOOGLE_API_KEY=AIzaSyDxxx_xxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Share Google Sheet (If Using API Key)

1. Open your Google Sheet
2. Click **Share** button
3. Make sure "Anyone with the link" or public access is enabled
   - Or make it viewable by anyone

---

## How It Works

### User Flow

1. User fills in email and phone (with validation)
2. User clicks "Start [Survey Type]"
3. **Form submission triggers:**
   ```
   handleInfoSubmit()
     ↓
   validateForm() - Checks email format & 10-digit phone
     ↓
   logUserToSheets() - Sends API request
     ↓
   GET /api/log-user - Checks for duplicates & appends to sheet
     ↓
   setStep('survey') - Proceeds to survey
   ```

### Deduplication Logic

The system checks if an email already exists:
- Fetches all existing data from Google Sheets
- Compares incoming email with existing emails
- If found: Returns `isDuplicate: true` (user already registered)
- If not found: Appends new row with empty tracking columns

### Data Structure in Google Sheets

| Email | Phone | Survey Type | Timestamp | Lead Generated | Contacted | Notes |
|-------|-------|-------------|-----------|----------------|-----------|-------|
| user@example.com | 9876543210 | Concise | 2024-11-11T10:30:00Z | | | |
| user2@example.com | 9123456789 | Expanded | 2024-11-11T10:35:00Z | ✓ | ✓ | Called & interested |

---

## Tracking Columns Guide

### Lead Generated
- **Values:** ✓ (checkmark) or empty
- **Meaning:** Has this lead been qualified as a potential customer?
- **Update:** Manually by your team

### Contacted
- **Values:** ✓ (checkmark) or empty
- **Meaning:** Have you contacted this user?
- **Update:** Manually by your team

### Notes
- **Type:** Free text
- **Purpose:** Store any follow-up information, call notes, etc.
- **Update:** Manually by your team

---

## API Reference

### POST /api/log-user

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "9876543210",
  "surveyType": "Concise"
}
```

**Success Response (201):**
```json
{
  "message": "User data logged successfully",
  "isDuplicate": false,
  "data": {
    "email": "user@example.com",
    "phone": "9876543210",
    "surveyType": "Concise",
    "timestamp": "2024-11-11T10:30:00Z"
  }
}
```

**Duplicate Response (200):**
```json
{
  "message": "User already registered",
  "isDuplicate": true
}
```

**Error Response (400/500):**
```json
{
  "error": "Email and phone are required"
}
```

---

## Utility Function Usage

### In Components

```typescript
import { logUserToSheets } from "@/functions/log-user";

// Inside your form submission handler
await logUserToSheets(
  userInfo.email,      // User's email
  userInfo.mobile,     // User's phone number
  'Concise'            // Survey type
);
```

### Error Handling

The function will:
- Log errors to console
- **Still allow survey to proceed** even if logging fails
- This ensures user experience isn't impacted by backend issues

---

## Monitoring & Management

### View Submissions in Google Sheets

1. Open your Google Sheet
2. Sort by **Timestamp** (newest first) to see latest submissions
3. Filter by **Survey Type** to see which survey users took
4. Update **Lead Generated** and **Contacted** columns manually

### Export Data

- **To CSV:** File → Download → Comma Separated Values (.csv)
- **To Excel:** File → Download → Microsoft Excel (.xlsx)
- **Real-time reports:** Use Google Sheets formulas and charts

### Example Formulas

**Count total users:**
```
=COUNTA(A2:A)
```

**Count leads generated:**
```
=COUNTIF(E2:E, "✓")
```

**Count contacted users:**
```
=COUNTIF(F2:F, "✓")
```

**Count by survey type:**
```
=COUNTIF(C2:C, "Concise")
```

---

## Troubleshooting

### Issue: Getting "Server configuration error"

**Solution:**
- Verify `GOOGLE_SHEET_ID` and `GOOGLE_API_KEY` are set in `.env.local`
- Restart your development server after adding env variables
- Check that you have the correct API key from Google Cloud Console

### Issue: Getting "Failed to fetch existing data"

**Solution:**
- Make sure the Google Sheet is shared/public
- Verify the SHEET_ID is correct
- Check Google Sheets API is enabled in Google Cloud Console

### Issue: Data not appearing in Google Sheets

**Solution:**
- Check browser console for errors (F12 → Console tab)
- Verify the sheet range is correct (should be "Sheet1!A:G")
- Make sure your API key has Sheets API permissions

### Issue: Users can submit duplicate entries

**Solution:**
- The system automatically prevents duplicates by email
- If user tries with different email, it will create new entry (this is intended behavior)
- Manual review recommended for similar emails (typos, variations)

---

## Security Considerations

### API Key Protection

⚠️ **Important:** Never commit your API key to version control

**Best practices:**
- Use `.env.local` (which is in `.gitignore`)
- For production, use environment variables in your hosting platform
- Consider using service accounts with restricted permissions
- Regularly rotate API keys

### Data Privacy

- Ensure compliance with GDPR/CCPA if applicable
- Add privacy notice on your website about data collection
- Consider adding user consent checkbox before logging data
- Implement data retention policies

### Rate Limiting

- Google Sheets API has rate limits (~300 requests/minute per user)
- For high-traffic scenarios, consider using a database instead
- Current implementation should handle typical consulting website traffic

---

## Future Enhancements

### Potential Improvements

1. **Automatic Lead Scoring:**
   - Score users based on survey responses
   - Mark automatically based on scoring criteria

2. **Email Notifications:**
   - Send alert when new user registers
   - Daily/weekly digest of new leads

3. **Two-Way Sync:**
   - Update user data from Sheets back to website
   - Create user dashboard showing their test score

4. **Database Migration:**
   - Move from Google Sheets to proper database (Firebase, PostgreSQL, etc.)
   - Better performance and scalability

5. **CRM Integration:**
   - Auto-sync with Salesforce, HubSpot, etc.
   - Advanced lead management

---

## Files Modified/Created

### New Files
- `/src/app/api/log-user/route.ts` - API endpoint
- `/src/functions/log-user.ts` - Utility function

### Modified Files
- `/src/components/assessment/ConciseSurvey.tsx` - Added import and logging
- `/src/components/assessment/ExpandedSurvey.tsx` - Added import and logging
- `/src/components/assessment/UltraQuickSurvey.tsx` - Added import and logging
- `/src/components/assessment/StudyAbroadSurvey.tsx` - Added import and logging

---

## Support & Questions

For issues or questions:
1. Check the troubleshooting section above
2. Review Google Sheets API documentation: https://developers.google.com/sheets/api
3. Check browser console (F12) for detailed error messages
4. Verify environment variables are loaded: Add `console.log(process.env.GOOGLE_SHEET_ID)` temporarily
