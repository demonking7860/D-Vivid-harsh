# Google Sheets Integration - Quick Setup Checklist

## ✅ Pre-Setup Checklist

- [ ] Have access to Google account
- [ ] Have access to Google Cloud Console
- [ ] Have access to your project's `.env.local` file

---

## 📋 Step-by-Step Setup

### 1. Create Google Sheet (5 minutes)

- [ ] Go to https://sheets.google.com
- [ ] Create new sheet
- [ ] Rename sheet tab to "Sheet1" (if not already)
- [ ] Add headers in Row 1:
  - A1: `Email`
  - B1: `Phone`
  - C1: `Survey Type`
  - D1: `Timestamp`
  - E1: `Lead Generated`
  - F1: `Contacted`
  - G1: `Notes`
- [ ] Copy Sheet ID from URL (example: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o`)

### 2. Get Google API Key (10 minutes)

- [ ] Go to https://console.cloud.google.com
- [ ] Create new project (or select existing)
- [ ] Search for "Google Sheets API" → Enable
- [ ] Go to Credentials page
- [ ] Click "+ Create Credentials"
- [ ] Select "API Key"
- [ ] Copy the API key (starts with `AIzaSy...`)

### 3. Share Google Sheet (2 minutes)

- [ ] Open your Google Sheet
- [ ] Click "Share" button
- [ ] Set sharing to "Anyone with the link can view" or public
  - *OR* if using Service Account, share with service account email
- [ ] Click "Share"

### 4. Configure Environment Variables (2 minutes)

- [ ] Create/edit `.env.local` file in project root
- [ ] Add these lines:
  ```env
  GOOGLE_SHEET_ID=your_sheet_id_here
  GOOGLE_API_KEY=your_api_key_here
  ```
- [ ] Replace `your_sheet_id_here` with actual Sheet ID from Step 1
- [ ] Replace `your_api_key_here` with actual API Key from Step 2
- [ ] Save file

### 5. Restart Development Server (2 minutes)

- [ ] Stop your development server (Ctrl+C)
- [ ] Run `pnpm dev` to restart
- [ ] Verify no errors in terminal

### 6. Test Integration (5 minutes)

- [ ] Go to your website (http://localhost:3000)
- [ ] Click on any survey (Concise, Expanded, etc.)
- [ ] Fill in email: `test@example.com`
- [ ] Fill in phone: `9876543210`
- [ ] Click "Start [Survey Type]"
- [ ] Open your Google Sheet in new tab
- [ ] Verify new row appeared with your test data
- [ ] **Do NOT refresh page** - fill out the survey to completion

### 7. Test Deduplication (3 minutes)

- [ ] Go back to survey page
- [ ] Fill in same email: `test@example.com`
- [ ] Fill in different phone: `9123456789`
- [ ] Click "Start [Survey Type]"
- [ ] Try to proceed
- [ ] Check sheet - should still have only 1 entry for that email

---

## ⚙️ Environment Variables Reference

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `GOOGLE_SHEET_ID` | `1a2b3c4...` | Google Sheet URL |
| `GOOGLE_API_KEY` | `AIzaSy...` | Google Cloud Console → Credentials |

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] `.env.local` file exists in project root
- [ ] `GOOGLE_SHEET_ID` is 25+ characters
- [ ] `GOOGLE_API_KEY` starts with `AIzaSy`
- [ ] Google Sheet has headers in row 1
- [ ] Google Sheet is shared/public
- [ ] Development server restarted after env changes
- [ ] Test user appears in Google Sheet after survey submission
- [ ] No errors in browser console (F12)
- [ ] No errors in terminal where server runs

---

## 📊 What to Expect

### On Survey Submission

1. User fills email and phone
2. User clicks "Start Survey"
3. **Behind the scenes:**
   - System validates email & phone
   - System checks for duplicate email
   - New row added to Google Sheet
   - User proceeds to survey
4. User can see their data in Google Sheet immediately

### In Google Sheets

New row will look like:
```
Email              | Phone      | Survey Type | Timestamp                 | Lead... | Contacted | Notes
test@example.com   | 9876543210 | Concise      | 2024-11-11T10:30:00Z      |         |           |
```

---

## 🚨 Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| Data not appearing in sheet | Restart dev server, verify `.env.local`, check sheet is public |
| "Server configuration error" | Check `GOOGLE_SHEET_ID` and `GOOGLE_API_KEY` in `.env.local` |
| API key rejected | Verify API key is correct, Google Sheets API is enabled |
| Can still submit duplicate emails | This is a feature - deduplication works based on email match |
| Errors in browser console | Check `.env.local` is in correct location and formatted correctly |

---

## 📞 Support Resources

- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com)
- Full documentation: See `GOOGLE_SHEETS_INTEGRATION.md`

---

## ✨ Next Steps

After verification:

1. **Test with real emails** - Try with different survey types
2. **Add lead tracking** - Mark "Lead Generated" ✓ for promising users
3. **Monitor registrations** - Check sheet regularly for new submissions
4. **Export data** - Download as CSV/Excel for analysis
5. **Iterate** - Consider future enhancements listed in full docs

---

## 📝 Notes

- System automatically prevents duplicate email entries
- Each survey type is tracked separately (Concise, Expanded, etc.)
- Timestamps in GMT/UTC format
- Email validation: must have @ and valid domain
- Phone validation: exactly 10 digits
- All columns except Email, Phone, Survey Type, Timestamp are optional
- You can manually edit Lead Generated, Contacted, Notes columns in sheet

---

**Setup Time: ~25-30 minutes total**

**Your Google Sheet will auto-populate as users register!** 🎉
