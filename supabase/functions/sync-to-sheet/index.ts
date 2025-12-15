import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_APPS_SCRIPT_URL = Deno.env.get('GOOGLE_APPS_SCRIPT_URL');
    
    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.error('GOOGLE_APPS_SCRIPT_URL not configured');
      throw new Error('Google Apps Script URL not configured');
    }

    const { rows } = await req.json();
    
    console.log('=== Syncing to Google Sheet ===');
    console.log('Number of rows:', rows?.length || 0);
    if (rows && rows.length > 0) {
      console.log('First row name field:', rows[0].name);
      console.log('First row keys:', Object.keys(rows[0]).join(', '));
    }
    console.log('Full payload:', JSON.stringify(rows, null, 2));

    // Send data to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rows }),
    });

    const result = await response.text();
    console.log('Google Apps Script response:', result);

    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch {
      parsedResult = { raw: result };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      result: parsedResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error syncing to sheet:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
