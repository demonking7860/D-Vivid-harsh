/**
 * Sends lead data to LeadSquared CRM API
 * Maps user data to LeadSquared's attribute-value format
 */
export async function sendToLeadSquared(
  name: string,
  email: string,
  phone: string,
  surveyType: string,
  s3Url: string
): Promise<void> {
  try {
    // Get credentials from environment variables with fallback to provided defaults
    const accessKey = process.env.LEADSQUARED_ACCESS_KEY || 'u$r2e5ec027d3c73d3df288f62f2682925a';
    const secretKey = process.env.LEADSQUARED_SECRET_KEY || 'b9b4d1c24524f817b1b57f22972c097e52e2a16e';
    const host = process.env.LEADSQUARED_HOST || 'https://api-in21.leadsquared.com/v2';

    // Extract first name from full name (split by space, take first part)
    const firstName = name ? name.split(' ')[0] : '';

    // Build the request body in LeadSquared's attribute-value format
    const requestBody = [
      {
        Attribute: 'EmailAddress',
        Value: email
      },
      {
        Attribute: 'FirstName',
        Value: firstName
      },
      {
        Attribute: 'Phone',
        Value: phone
      },
      {
        Attribute: 'Source',
        Value: 'Psychometric Test'
      },
      {
        Attribute: 'mx_Survey_Type',
        Value: surveyType
      },
      {
        Attribute: 'mx_Psychometric_test_PDF_URL',
        Value: s3Url
      }
    ];

    // Build the API URL with query parameters
    const apiUrl = `${host}/LeadManagement.svc/Lead.Create?accessKey=${encodeURIComponent(accessKey)}&secretKey=${encodeURIComponent(secretKey)}`;

    console.log('📤 Sending data to LeadSquared CRM...');
    console.log('  - Email:', email);
    console.log('  - Name:', name);
    console.log('  - Survey Type:', surveyType);

    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LeadSquared API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Successfully sent data to LeadSquared CRM:', responseData);
  } catch (error) {
    console.error('❌ Failed to send data to LeadSquared CRM:');
    console.error('  Error:', error instanceof Error ? error.message : String(error));
    // Don't throw - let PDF generation continue even if LeadSquared fails
  }
}
