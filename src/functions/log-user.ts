/**
 * Logs user data to Google Sheets when they start a survey
 * @param email - User's email address
 * @param phone - User's phone number
 * @param surveyType - Type of survey (e.g., 'Concise', 'Expanded', 'UltraQuick', 'StudyAbroad')
 * @returns Promise with the response
 */
export async function logUserToSheets(
  email: string,
  phone: string,
  surveyType: string
) {
  try {
    const response = await fetch('/api/log-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        phone,
        surveyType,
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
