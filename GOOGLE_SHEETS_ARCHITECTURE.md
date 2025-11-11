# Google Sheets Integration - Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER BROWSER                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Survey Component (React)                         │   │
│  │  - ConciseSurvey.tsx                                 │   │
│  │  - ExpandedSurvey.tsx                                │   │
│  │  - UltraQuickSurvey.tsx                              │   │
│  │  - StudyAbroadSurvey.tsx                             │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ User Fills Form                              │   │   │
│  │  │ - Email: user@example.com                    │   │   │
│  │  │ - Phone: 9876543210                          │   │   │
│  │  │ - Click: "Start Assessment"                  │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                    ↓                                  │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ handleInfoSubmit()                           │   │   │
│  │  │ - validateForm()                             │   │   │
│  │  │ - logUserToSheets(email, phone, type)       │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    /functions/log-user.ts (Client Utility)          │   │
│  │                                                      │   │
│  │  - Calls: POST /api/log-user                         │   │
│  │  - Payload: { email, phone, surveyType }            │   │
│  │  - Error handling: logs to console                   │   │
│  │  - On success: returns data                          │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP POST
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     /api/log-user/route.ts (Backend API)            │   │
│  │                                                      │   │
│  │  1. Validate request                                │   │
│  │     - Check email & phone present                   │   │
│  │     - Check env variables loaded                    │   │
│  │                                                      │   │
│  │  2. FETCH existing data from Google Sheets          │   │
│  │     GET https://sheets.googleapis.com/v4/...        │   │
│  │     Range: Sheet1!A:G                               │   │
│  │                                                      │   │
│  │  3. Check for duplicates                            │   │
│  │     Loop through rows                               │   │
│  │     If email exists → Return isDuplicate: true      │   │
│  │     If not found → Continue                         │   │
│  │                                                      │   │
│  │  4. APPEND new row to Google Sheets                 │   │
│  │     POST https://sheets.googleapis.com/v4/...       │   │
│  │     Values: [email, phone, surveyType, timestamp,   │   │
│  │             '', '', '']                             │   │
│  │                                                      │   │
│  │  5. Return response                                 │   │
│  │     Success: 201 with data                          │   │
│  │     Duplicate: 200 with isDuplicate flag            │   │
│  │     Error: 400/500 with error message               │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Environment Variables (from .env.local)                    │
│  - GOOGLE_SHEET_ID: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o         │
│  - GOOGLE_API_KEY: AIzaSyDxxx_xxxxxxxxxxxxxxxxxxxxx         │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                  GOOGLE SHEETS API                           │
│                                                              │
│  - Service: Google Sheets v4 API                            │
│  - Authentication: API Key (Public access)                  │
│  - Rate limit: 300 requests/minute per user                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE SHEET (Your Spreadsheet)                │
│                                                              │
│  Row 1 (Headers):                                           │
│  ┌──────┬───────┬──────────────┬───────────┬──────┬─────────┐
│  │Email │ Phone │ Survey Type  │ Timestamp │ Lead │Contacted│
│  │      │       │              │           │ Gen  │         │
│  └──────┴───────┴──────────────┴───────────┴──────┴─────────┘
│                                                              │
│  Row 2 (First User):                                        │
│  ┌──────────────────┬────────────┬──────────┬──────────────┬──┐
│  │user@example.com  │ 9876543210 │ Concise  │ 2024-11-11...│  │
│  └──────────────────┴────────────┴──────────┴──────────────┴──┘
│                                                              │
│  Row 3 (Second User):                                       │
│  ┌──────────────────┬────────────┬──────────┬──────────────┬──┐
│  │user2@example.com │ 9876543211 │ Expanded │ 2024-11-11...│ ✓│
│  └──────────────────┴────────────┴──────────┴──────────────┴──┘
│                                                              │
│  (More rows automatically added as users register)          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## User Registration Flow Diagram

```
START
  │
  ├─→ User lands on survey page
  │
  ├─→ User fills in form
  │    • Email: validation (must have @, valid TLD)
  │    • Phone: validation (exactly 10 digits)
  │
  ├─→ User clicks "Start [Survey Type]"
  │
  ├─→ handleInfoSubmit() triggered
  │    │
  │    └─→ validateForm()
  │         │
  │         ├─→ Email valid? ✓
  │         ├─→ Phone valid? ✓
  │         └─→ Return true/false
  │
  ├─→ If invalid: Show error messages & stop
  │
  ├─→ If valid: logUserToSheets() called
  │    │
  │    └─→ POST /api/log-user
  │         {
  │           email: "user@example.com",
  │           phone: "9876543210",
  │           surveyType: "Concise"
  │         }
  │
  ├─→ API Processing:
  │    │
  │    ├─→ Validate data ✓
  │    │
  │    ├─→ Check env variables ✓
  │    │
  │    ├─→ GET existing data from Google Sheets
  │    │   Retrieve all emails from rows
  │    │
  │    ├─→ Check for duplicate email
  │    │    │
  │    │    ├─→ Email exists?
  │    │    │   YES → Return { isDuplicate: true } (200)
  │    │    │   NO → Continue
  │    │    │
  │    │
  │    ├─→ Append new row to Google Sheets
  │    │   POST with values:
  │    │   [user@example.com, 9876543210, Concise,
  │    │    2024-11-11T10:30:00Z, '', '', '']
  │    │
  │    └─→ Return success response (201)
  │         {
  │           message: "User data logged successfully",
  │           isDuplicate: false,
  │           data: { ... }
  │         }
  │
  ├─→ Frontend receives response
  │
  ├─→ setStep('survey') → Show survey questions
  │
  └─→ User begins assessment
     
END
```

## Data Flow: Email to Google Sheets

```
Browser                          Next.js API                    Google Sheets
────────────────────────────────────────────────────────────────────────────

User Form Input:
┌──────────────────────┐
│ Email: user@test.com │
│ Phone: 9876543210    │
└──────────────────────┘
        │
        ├─→ handleInfoSubmit()
        │
        └─→ logUserToSheets(email, phone, type)
            │
            └─→ POST /api/log-user
                {
                  email: "user@test.com",
                  phone: "9876543210",
                  surveyType: "Concise"
                }
                │
                ├──────────────→ Endpoint receives request
                │               │
                │               ├─→ env: GOOGLE_SHEET_ID=1a2b...
                │               ├─→ env: GOOGLE_API_KEY=AIzaSy...
                │               │
                │               ├─→ GET request to Google Sheets
                │               │   Fetch existing data to check duplicates
                │               │
                │               ├─→ No duplicate found ✓
                │               │
                │               ├─→ POST request to Google Sheets
                │               │   Append row:
                │               │   [user@test.com, 9876543210, Concise,
                │               │    2024-11-11T..., '', '', '']
                │               │
                │               └──────────────→ Google Sheets API
                │                              │
                │                              ├─→ Validate API key
                │                              ├─→ Append to Sheet1
                │                              ├─→ Auto-save
                │                              │
                │                              └──→ Success response
                │
                ├──────────────← Response sent
                │
    Response received:
    {
      message: "User data logged...",
      isDuplicate: false,
      data: {...}
    }
        │
        └─→ setStep('survey')
            │
            └─→ Show survey questions


Google Sheet Updated:
┌─────────────────────────────────────────────────┐
│ Email      │ Phone      │ Survey │ Timestamp    │
│ user@test.com │ 9876543210 │ Concise │ 2024-11-11...│
│            │            │        │              │
│ (Ready for manual tracking in Lead/Contacted) │
└─────────────────────────────────────────────────┘
```

## Deduplication Logic

```
User submits form with email: "john@example.com"
                    phone: "9876543210"
                    type: "Concise"
       │
       ├─→ validateForm() → PASS
       │
       ├─→ API: GET all existing rows
       │
       ├─→ Check each row's Column A (Email)
       │   Row 2: "alice@example.com" ❌ No match
       │   Row 3: "bob@example.com"   ❌ No match
       │   Row 4: "john@example.com"  ✓ MATCH FOUND!
       │
       ├─→ Email exists in row 4
       │
       └─→ Return Response 200
           {
             message: "User already registered",
             isDuplicate: true
           }

User frontend shows:
"You have already registered for this assessment"
OR
"Using existing registration"


(User data is NOT re-appended to sheet)


─────────────────────────────────────────────────────

If NO match found:

       │
       ├─→ validateForm() → PASS
       │
       ├─→ API: GET all existing rows
       │
       ├─→ Check all rows: NO EMAIL MATCH
       │
       └─→ Append new row
           [john@example.com, 9876543210, Concise, ...]
           
           Return Response 201
           {
             message: "User data logged successfully",
             isDuplicate: false,
             data: {...}
           }

(New entry added to sheet)
```

## Error Handling Flow

```
API receives request
    │
    ├─→ No email/phone?
    │   └─→ 400: "Email and phone are required"
    │
    ├─→ No GOOGLE_SHEET_ID env?
    │   └─→ 500: "Server configuration error"
    │
    ├─→ No GOOGLE_API_KEY env?
    │   └─→ 500: "Server configuration error"
    │
    ├─→ GET request fails (sheet not accessible)?
    │   └─→ 500: "Failed to fetch existing data"
    │
    ├─→ POST request fails (API rejected)?
    │   └─→ 500: "Failed to append to Google Sheets"
    │
    ├─→ Unexpected error?
    │   └─→ 500: "Internal server error"
    │
    └─→ All checks pass?
        └─→ Return 200/201 with data
        
Browser receives error
    │
    └─→ console.error() logs it
        Survey still proceeds (graceful degradation)
```

## Files Involved

```
Project Structure
├── src/
│   ├── app/
│   │   └── api/
│   │       └── log-user/
│   │           └── route.ts ← NEW: Main API endpoint
│   │
│   ├── components/
│   │   └── assessment/
│   │       ├── ConciseSurvey.tsx ← MODIFIED: Added logging
│   │       ├── ExpandedSurvey.tsx ← MODIFIED: Added logging
│   │       ├── UltraQuickSurvey.tsx ← MODIFIED: Added logging
│   │       └── StudyAbroadSurvey.tsx ← MODIFIED: Added logging
│   │
│   └── functions/
│       └── log-user.ts ← NEW: Client utility
│
├── .env.local ← NEW: Environment variables
│
├── GOOGLE_SHEETS_INTEGRATION.md ← Full documentation
└── GOOGLE_SHEETS_QUICK_SETUP.md ← Quick reference
```

## Key Components

### 1. API Route (`/api/log-user/route.ts`)
- **Purpose:** Handle user data logging to Google Sheets
- **Methods:** POST
- **Authentication:** API Key from environment
- **Deduplication:** Checks email column before appending

### 2. Client Utility (`/functions/log-user.ts`)
- **Purpose:** Wrapper around API call
- **Error handling:** Non-blocking (survey continues even if fails)
- **Retry:** Not implemented (single attempt)

### 3. Survey Components
- **ConciseSurvey.tsx**
- **ExpandedSurvey.tsx**
- **UltraQuickSurvey.tsx**
- **StudyAbroadSurvey.tsx**

**Modifications:** 
- Import `logUserToSheets`
- Call in `handleInfoSubmit()` after validation passes

## Security Considerations

```
┌─ .env.local (Git ignored)
│  - GOOGLE_SHEET_ID
│  - GOOGLE_API_KEY
│  (Never committed to repository)
│
├─ API Key Scope
│  - Read/Write access to Google Sheets only
│  - Not full Google Account access
│
├─ Data Validation
│  - Email format check
│  - Phone format check (10 digits)
│  - Required fields validation
│
├─ Error Messages
│  - Generic server errors (don't reveal internals)
│  - Logged details in server console only
│
└─ Rate Limiting
   - Google Sheets API: 300 req/min per user
   - Implement user-level throttling if needed
```
