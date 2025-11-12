// ✅ Force server-side (Node.js) runtime and disable static optimization
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

interface UserData {
  email: string;
  phone: string;
  surveyType: string;
  timestamp: string;
}

// ✅ Directly hardcode your Google Sheet ID (safe – not secret)
const SHEET_ID = "16hCDBmJZSgpTILoKWNFXqAU6BAHSG-5JirFIOKfYU1U";

const RANGE = 'Sheet1!A:G'; // Columns: Email, Phone, Survey Type, Timestamp, Lead Generated, Contacted, Notes

// Parse service account credentials from environment variable
const getServiceAccountAuth = () => {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    const credentials = JSON.parse(serviceAccountKey);

    // Basic sanity check for key integrity
    if (!credentials.private_key?.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Invalid or truncated private key');
    }

    return new google.auth.GoogleAuth({
      credentials: {
        type: credentials.type,
        project_id: credentials.project_id,
        private_key_id: credentials.private_key_id,
        private_key: credentials.private_key,
        client_email: credentials.client_email,
        client_id: credentials.client_id,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (error) {
    console.error('Failed to parse Google Service Account key:', error);
    throw new Error(`Failed to parse service account key: ${error}`);
  }
};

// Initialize Sheets API client
const getSheetsClient = async () => {
  const auth = getServiceAccountAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
};

export async function POST(request: NextRequest) {
  try {
    const { email, phone, surveyType } = await request.json();

    // Validation
    if (!email || !phone) {
      return NextResponse.json(
        { error: 'Email and phone are required' },
        { status: 400 }
      );
    }

    // Initialize Sheets client
    const sheets = await getSheetsClient();

    // Step 1: Check for duplicate entry (same email)
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = getResponse.data.values || [];
    const emailExists = rows.slice(1).some((row: string[]) => row[0] === email);

    if (emailExists) {
      return NextResponse.json(
        { message: 'User already registered', isDuplicate: true },
        { status: 200 }
      );
    }

    // Step 2: Add new row to Google Sheets
    const timestamp = new Date().toISOString();
    const newRow = [
      email,
      phone,
      surveyType || '
