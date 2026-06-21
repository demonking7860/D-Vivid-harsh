/**
 * Checks if a lead exists in LeadSquared by email address
 * @returns Object with exists status and ProspectID if lead exists
 */
async function checkLeadExists(
  email: string,
  accessKey: string,
  secretKey: string,
  host: string
): Promise<{ exists: boolean; prospectId?: string; source?: string }> {
  try {
    // Normalize host to avoid double slashes
    host = host.replace(/\/$/, '');

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
    
    // Helper to extract source from a record
    const extractSource = (record: any): string | undefined => {
      return (
        record?.Source ||
        record?.LeadSource ||
        record?.mx_Lead_Source_Type ||
        undefined
      );
    };

    // Check if response contains ProspectID (lead exists)
    // Response can be null, empty array, or object with ProspectID
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { exists: false };
    }
    
    // Handle array response
    if (Array.isArray(data) && data.length > 0) {
      const record = data[0];
      const prospectId = record?.ProspectID;
      const source = extractSource(record);
      if (prospectId) {
        return { exists: true, prospectId: String(prospectId), source };
      }
      return { exists: false };
    }
    
    // Handle object response
    const prospectId = data.ProspectID;
    const source = extractSource(data);
    if (prospectId) {
      return { exists: true, prospectId: String(prospectId), source };
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
    const accessKey = process.env.LEADSQUARED_ACCESS_KEY || 'u$r8f03e27b38208d84fbe8d069336f2227';
    const secretKey = process.env.LEADSQUARED_SECRET_KEY || 'bb7af308a36a8243930e8f66617a92933bcb7248';
    const host = process.env.LEADSQUARED_HOST || 'https://api-in21.leadsquared.com/v2';
    const normalizedHost = host.replace(/\/$/, '');

    // Check if lead exists by email address
    console.log('🔍 Checking if lead exists in LeadSquared by email address...');
    const leadCheckResult = await checkLeadExists(email, accessKey, secretKey, normalizedHost);
    const { exists: leadExists, prospectId, source } = leadCheckResult;
    
    // Generate timestamp for test
    const timestamp = new Date().toISOString();

    let requestBody: Array<{ Attribute: string; Value: string }>;

    if (leadExists && prospectId) {
      // EXISTING LEAD: Use minimal payload (only test-related fields) with ProspectID and existing Source if present
      console.log('📝 Existing lead detected');
      console.log('  - ProspectID:', prospectId);
      console.log('  - Existing Source:', source || 'not set');
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
      if (source) {
        requestBody.push({
          Attribute: 'Source',
          Value: source
        });
      }
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
    const apiUrl = `${normalizedHost}/LeadManagement.svc/Lead.Capture?accessKey=${encodeURIComponent(accessKey)}&secretKey=${encodeURIComponent(secretKey)}&LeadUpdateBehavior=DoNotUpdateUniqueFields`;

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

/**
 * Creates or updates a lead in LeadSquared when user submits form (before test)
 * - If new lead: Creates with full payload (name, email, phone, source, survey type)
 * - If existing lead: Updates only survey type and timestamp
 * - No PDF URL at this stage
 */
export async function createOrUpdateLead(
  name: string,
  email: string,
  phone: string,
  surveyType: string
): Promise<{ success: boolean; prospectId?: string; isNew?: boolean }> {
  try {
    // Get credentials from environment variables
    const accessKey = process.env.LEADSQUARED_ACCESS_KEY || 'u$r8f03e27b38208d84fbe8d069336f2227';
    const secretKey = process.env.LEADSQUARED_SECRET_KEY || 'bb7af308a36a8243930e8f66617a92933bcb7248';
    const host = process.env.LEADSQUARED_HOST || 'https://api-in21.leadsquared.com/v2';
    const normalizedHost = host.replace(/\/$/, '');

    // Check if lead exists by email address
    console.log('🔍 [Form Submit] Checking if lead exists in LeadSquared...');
    const leadCheckResult = await checkLeadExists(email, accessKey, secretKey, normalizedHost);
    const { exists: leadExists, prospectId, source } = leadCheckResult;
    
    // Generate timestamp
    const timestamp = new Date().toISOString();

    let requestBody: Array<{ Attribute: string; Value: string }>;

    if (leadExists && prospectId) {
      // EXISTING LEAD: Update only survey type and timestamp
      console.log('📝 [Form Submit] Existing lead detected, updating survey info');
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
          Attribute: 'mx_Test_Timestamp',
          Value: timestamp
        }
      ];
      // Preserve existing source if present
      if (source) {
        requestBody.push({
          Attribute: 'Source',
          Value: source
        });
      }
    } else {
      // NEW LEAD: Create with full payload (no PDF URL yet)
      console.log('🆕 [Form Submit] New lead - creating with full payload');
      
      // Extract first name and last name from full name
      let firstName = '';
      let lastName = '';
      
      if (name) {
        const nameParts = name.trim().split(/\s+/);
        firstName = nameParts[0] || '';
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
          Attribute: 'mx_Test_Timestamp',
          Value: timestamp
        }
      ];
    }

    // Build the API URL
    const apiUrl = `${normalizedHost}/LeadManagement.svc/Lead.Capture?accessKey=${encodeURIComponent(accessKey)}&secretKey=${encodeURIComponent(secretKey)}&LeadUpdateBehavior=DoNotUpdateUniqueFields`;

    console.log('📤 [Form Submit] Sending lead data to LeadSquared CRM...');
    console.log('  - Email:', email);
    console.log('  - Name:', name);
    console.log('  - Phone:', phone);
    console.log('  - Survey Type:', surveyType);
    console.log('  - Is new lead:', !leadExists);

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
    console.log('✅ [Form Submit] Successfully created/updated lead in LeadSquared:', responseData);
    
    // Extract ProspectID from response for new leads
    const newProspectId = responseData?.Message?.RelatedId || responseData?.RelatedId || prospectId;
    
    return { 
      success: true, 
      prospectId: newProspectId,
      isNew: !leadExists
    };
  } catch (error) {
    console.error('❌ [Form Submit] Failed to create/update lead in LeadSquared:');
    console.error('  Error:', error instanceof Error ? error.message : String(error));
    return { success: false };
  }
}

/**
 * Updates an existing lead with PDF URL after PDF is generated
 * - Finds lead by email using checkLeadExists()
 * - Uses minimal payload to update only mx_Psychometric_test_PDF_URL
 */
export async function updateLeadPdfUrl(
  email: string,
  s3Url: string
): Promise<{ success: boolean }> {
  try {
    // Get credentials from environment variables
    const accessKey = process.env.LEADSQUARED_ACCESS_KEY || 'u$r8f03e27b38208d84fbe8d069336f2227';
    const secretKey = process.env.LEADSQUARED_SECRET_KEY || 'bb7af308a36a8243930e8f66617a92933bcb7248';
    const host = process.env.LEADSQUARED_HOST || 'https://api-in21.leadsquared.com/v2';
    const normalizedHost = host.replace(/\/$/, '');

    // Find lead by email to get ProspectID
    console.log('🔍 [PDF Update] Finding lead in LeadSquared by email...');
    const leadCheckResult = await checkLeadExists(email, accessKey, secretKey, normalizedHost);
    const { exists: leadExists, prospectId, source } = leadCheckResult;
    
    if (!leadExists || !prospectId) {
      console.error('❌ [PDF Update] Lead not found for email:', email);
      return { success: false };
    }

    console.log('📝 [PDF Update] Lead found, updating PDF URL');
    console.log('  - ProspectID:', prospectId);
    console.log('  - PDF URL:', s3Url);

    // Minimal payload - only update PDF URL
    const requestBody: Array<{ Attribute: string; Value: string }> = [
      {
        Attribute: 'ProspectID',
        Value: prospectId
      },
      {
        Attribute: 'EmailAddress',
        Value: email
      },
      {
        Attribute: 'mx_Psychometric_test_PDF_URL',
        Value: s3Url
      }
    ];
    
    // Preserve existing source if present
    if (source) {
      requestBody.push({
        Attribute: 'Source',
        Value: source
      });
    }

    // Build the API URL
    const apiUrl = `${normalizedHost}/LeadManagement.svc/Lead.Capture?accessKey=${encodeURIComponent(accessKey)}&secretKey=${encodeURIComponent(secretKey)}&LeadUpdateBehavior=DoNotUpdateUniqueFields`;

    console.log('📤 [PDF Update] Sending PDF URL to LeadSquared CRM...');

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
    console.log('✅ [PDF Update] Successfully updated lead with PDF URL:', responseData);
    
    return { success: true };
  } catch (error) {
    console.error('❌ [PDF Update] Failed to update lead PDF URL in LeadSquared:');
    console.error('  Error:', error instanceof Error ? error.message : String(error));
    return { success: false };
  }
}
