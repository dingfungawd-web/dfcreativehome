import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define the exact column order matching Google Sheet columns A-AJ
const COLUMN_ORDER = [
  'name',                    // A
  'report_date',             // B
  'team',                    // C
  'installer_1',             // D
  'installer_2',             // E
  'installer_3',             // F
  'installer_4',             // G
  'install_address',         // H
  'install_payment_method',  // I
  'install_amount',          // J
  'install_notes',           // K
  'install_material_open',   // L
  'install_material_replenish', // M
  'measure_colleague',       // N
  'install_doors',           // O
  'install_windows',         // P
  'install_aluminum',        // Q
  'install_old_removed',     // R
  'order_address',           // S
  'order_payment_method',    // T
  'order_amount',            // U
  'order_data_type',         // V
  'order_material_open',     // W
  'order_material_replenish', // X
  'order_reorder',           // Y
  'order_measure_colleague', // Z
  'order_reorder_location',  // AA
  'order_notes',             // AB
  'responsibility_option',   // AC
  'urgency',                 // AD
  'install_difficulty',      // AE
  'order_install_doors',     // AF
  'order_install_windows',   // AG
  'order_install_aluminum',  // AH
  'order_old_removed',       // AI
  'report_code',             // AJ
];

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

    // Convert each row object to an ordered array based on COLUMN_ORDER
    const orderedRows = rows.map((row: Record<string, any>) => {
      return COLUMN_ORDER.map(key => row[key] ?? '');
    });

    console.log('Column order:', COLUMN_ORDER.join(', '));
    console.log('First row values:', orderedRows[0]?.join(', '));

    // Send data to Google Apps Script with column headers and ordered row arrays
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        columns: COLUMN_ORDER,
        rows: orderedRows 
      }),
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
