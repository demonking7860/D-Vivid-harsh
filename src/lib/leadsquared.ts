/**
 * Checks if a lead exists in LeadSquared by email address
 * @returns Object with exists status and ProspectID if lead exists
 */
async function checkLeadExists(
  email: string,
  accessKey: string,
  secretKey: string,
  host: string
): Promise<{ exists: boolean; prospectId?: string }> {
  try {
    const checkUrl = `${host}/LeadManagement.svc/Leads.GetByEmailaddress?emailaddress=${encodeURIComponent(email)}&accessKey=${encodeURIComponent(accessKey)}&secretKey=${encodeURIComponent(secretKey)}`;
    
    const response = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // If API returns error, assume lead doesn't exist
      console.log('⚠️ Lead check API returned error, assuming new lead');
      return { exists: false };
    }

    const data = await response.json();
    
    // Check if response contains ProspectID (lead exists)
    // Response can be null, empty array, or object with ProspectID
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { exists: false };
    }
    
    // Handle array response
    if (Array.isArray(data) && data.length > 0) {
      const prospectId = data[0]?.ProspectID;
      if (prospectId) {
        return { exists: true, prospectId: String(prospectId) };
      }
      return { exists: false };
    }
    
    // Handle object response
    const prospectId = data.ProspectID;
    if (prospectId) {
      return { exists: true, prospectId: String(prospectId) };
    }
    
    return { exists: false };
  } catch (error) {
    console.error('⚠️ Error checking lead existence, assuming new lead:', error instanceof Error ? error.message : String(error));
    return { exists: false }; // On error, assume new lead to avoid blocking
  }
}

/**
 * Sends lead data to LeadSquared CRM API using Lead.Capture
 * Checks if lead exists first, then uses appropriate payload (full for new, minimal for existing)
 * Ensures no duplicate leads and no overwriting of unique fields
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

    // Check if lead exists by email address
    console.log('🔍 Checking if lead exists in LeadSquared by email address...');
    const leadCheckResult = await checkLeadExists(email, accessKey, secretKey, host);
    const leadExists = leadCheckResult.exists;
    const prospectId = leadCheckResult.prospectId;
    
    // Generate timestamp for test
    const timestamp = new Date().toISOString();

    let requestBody: Array<{ Attribute: string; Value: string }>;

    if (leadExists && prospectId) {
      // EXISTING LEAD: Use minimal payload (only test-related fields) with ProspectID
      console.log('📝 Lead exists - using minimal payload (updating test fields only)');
      console.log('  - ProspectID:', prospectId);
      requestBody = [
        {
          Attribute: 'ProspectID',
          Value: prospectId
        },
        {
          Attribute: 'EmailAddress',
          Value: email
        },
        {
          Attribute: 'mx_Survey_Type',
          Value: surveyType
        },
        {
          Attribute: 'mx_Psychometric_test_PDF_URL',
          Value: s3Url
        },
        {
          Attribute: 'mx_Test_Timestamp',
          Value: timestamp
        }
      ];
    } else {
      // NEW LEAD: Use full payload
      console.log('🆕 New lead - using full payload');
      
      // Extract first name and last name from full name
      let firstName = '';
      let lastName = '';
      
      if (name) {
        const nameParts = name.trim().split(/\s+/);
        firstName = nameParts[0] || '';
        // Join all remaining parts as last name (handles middle names too)
        lastName = nameParts.slice(1).join(' ') || '';
      }

      requestBody = [
        {
          Attribute: 'EmailAddress',
          Value: email
        },
        {
          Attribute: 'FirstName',
          Value: firstName
        },
        {
          Attribute: 'LastName',
          Value: lastName
        },
        {
          Attribute: 'Phone',
          Value: phone
        },
        {
          Attribute: 'Source',
          Value: 'Dvivid AI Website'
        },
        {
          Attribute: 'mx_Lead_Source_Type',
          Value: 'Psychometric Test'
        },
        {
          Attribute: 'mx_Survey_Type',
          Value: surveyType
        },
        {
          Attribute: 'mx_Psychometric_test_PDF_URL',
          Value: s3Url
        },
        {
          Attribute: 'mx_Test_Timestamp',
          Value: timestamp
        }
      ];
    }

    // Build the API URL with Lead.Capture and LeadUpdateBehavior parameter
    const apiUrl = `${host}/LeadManagement.svc/Lead.Capture?accessKey=${encodeURIComponent(accessKey)}&secretKey=${encodeURIComponent(secretKey)}&LeadUpdateBehavior=DoNotUpdateUniqueFields`;

    console.log('📤 Sending data to LeadSquared CRM...');
    console.log('  - Email:', email);
    console.log('  - Name:', name);
    console.log('  - Phone:', phone);
    console.log('  - Survey Type:', surveyType);
    console.log('  - Lead exists:', leadExists);
    if (leadExists && prospectId) {
      console.log('  - ProspectID:', prospectId);
    }
    console.log('  - Payload type:', leadExists ? 'minimal' : 'full');

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
