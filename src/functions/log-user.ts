/**
 * Logs user data to Google Sheets when they start a survey
 * Supports both old signature (email, phone, surveyType) and new signature (name, email, phone, surveyType)
 */
export async function logUserToSheets(
  nameOrEmail: string,
  emailOrPhone: string,
  phoneOrSurveyType: string,
  surveyType?: string
): Promise<any> {
  // Handle both old signature (email, phone, surveyType) and new signature (name, email, phone, surveyType)
  let name: string | undefined;
  let email: string;
  let phone: string;
  let type: string;

  if (surveyType !== undefined) {
    // New signature: (name, email, phone, surveyType)
    name = nameOrEmail;
    email = emailOrPhone;
    phone = phoneOrSurveyType;
    type = surveyType;
  } else {
    // Old signature: (email, phone, surveyType)
    name = undefined;
    email = nameOrEmail;
    phone = emailOrPhone;
    type = phoneOrSurveyType;
  }

  try {
    const response = await fetch('/api/log-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        surveyType: type,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to log user: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging user to sheets:', error);
    throw error;
  }
}
