import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateLead } from '@/lib/leadsquared';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Create-lead API called');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (jsonError: any) {
      console.error('❌ Failed to parse request JSON:', jsonError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: jsonError.message 
      }, { status: 400 });
    }

    const { name, email, phone, surveyType } = body;

    // Validate required fields
    if (!email) {
      console.error('❌ Missing email in request');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!name) {
      console.error('❌ Missing name in request');
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!phone) {
      console.error('❌ Missing phone in request');
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    if (!surveyType) {
      console.error('❌ Missing surveyType in request');
      return NextResponse.json({ error: 'Survey type is required' }, { status: 400 });
    }

    console.log('📥 Creating/updating lead:', { name, email, phone, surveyType });

    // Create or update lead in LeadSquared
    const result = await createOrUpdateLead(name, email, phone, surveyType);

    if (result.success) {
      console.log('✅ Lead created/updated successfully');
      return NextResponse.json({ 
        success: true, 
        prospectId: result.prospectId,
        isNew: result.isNew,
        message: result.isNew ? 'Lead created successfully' : 'Lead updated successfully'
      });
    } else {
      console.error('❌ Failed to create/update lead');
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create/update lead in CRM' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Error in create-lead API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

