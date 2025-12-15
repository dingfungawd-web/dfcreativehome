import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data = await req.json();
    
    console.log('Received sync from sheet:', JSON.stringify(data, null, 2));

    const reportCode = data.report_code;
    
    if (!reportCode) {
      throw new Error('report_code is required');
    }

    // Find the report by report_code
    const { data: existingReport, error: findError } = await supabase
      .from('reports')
      .select('*')
      .eq('report_code', reportCode)
      .maybeSingle();

    if (findError) {
      console.error('Error finding report:', findError);
      throw findError;
    }

    if (!existingReport) {
      console.log('Report not found with code:', reportCode);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Report not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare update data - convert empty strings to null for numeric fields
    const parseNumeric = (val: any) => {
      if (val === '' || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Map fields from sheet to database
    if (data.report_date !== undefined) updateData.report_date = data.report_date || null;
    if (data.team !== undefined) updateData.team = data.team || null;
    if (data.installer_1 !== undefined) updateData.installer_1 = data.installer_1 || null;
    if (data.installer_2 !== undefined) updateData.installer_2 = data.installer_2 || null;
    if (data.installer_3 !== undefined) updateData.installer_3 = data.installer_3 || null;
    if (data.installer_4 !== undefined) updateData.installer_4 = data.installer_4 || null;
    
    // Completed case fields (H-R)
    if (data.install_address !== undefined) updateData.install_address = data.install_address || null;
    if (data.install_payment_method !== undefined) updateData.install_payment_method = data.install_payment_method || null;
    if (data.install_amount !== undefined) updateData.install_amount = parseNumeric(data.install_amount);
    if (data.install_notes !== undefined) updateData.install_notes = data.install_notes || null;
    if (data.install_material_open !== undefined) updateData.install_material_open = parseNumeric(data.install_material_open);
    if (data.install_material_replenish !== undefined) updateData.install_material_replenish = parseNumeric(data.install_material_replenish);
    if (data.measure_colleague !== undefined) updateData.measure_colleague = data.measure_colleague || null;
    if (data.install_doors !== undefined) updateData.install_doors = parseNumeric(data.install_doors);
    if (data.install_windows !== undefined) updateData.install_windows = parseNumeric(data.install_windows);
    if (data.install_aluminum !== undefined) updateData.install_aluminum = parseNumeric(data.install_aluminum);
    if (data.install_old_removed !== undefined) updateData.install_old_removed = parseNumeric(data.install_old_removed);
    
    // Follow-up case fields (S-AI)
    if (data.order_address !== undefined) updateData.order_address = data.order_address || null;
    if (data.order_payment_method !== undefined) updateData.order_payment_method = data.order_payment_method || null;
    if (data.order_amount !== undefined) updateData.order_amount = parseNumeric(data.order_amount);
    if (data.order_data_type !== undefined) updateData.order_data_type = data.order_data_type || null;
    if (data.order_material_open !== undefined) updateData.order_material_open = parseNumeric(data.order_material_open);
    if (data.order_material_replenish !== undefined) updateData.order_material_replenish = parseNumeric(data.order_material_replenish);
    if (data.order_reorder !== undefined) updateData.order_reorder = parseNumeric(data.order_reorder);
    if (data.order_measure_colleague !== undefined) updateData.order_measure_colleague = data.order_measure_colleague || null;
    if (data.order_reorder_location !== undefined) updateData.order_reorder_location = data.order_reorder_location || null;
    if (data.order_notes !== undefined) updateData.order_notes = data.order_notes || null;
    if (data.responsibility_option !== undefined) updateData.responsibility_option = data.responsibility_option || null;
    if (data.urgency !== undefined) updateData.urgency = data.urgency || null;
    if (data.install_difficulty !== undefined) updateData.install_difficulty = data.install_difficulty || null;
    if (data.order_install_doors !== undefined) updateData.order_install_doors = parseNumeric(data.order_install_doors);
    if (data.order_install_windows !== undefined) updateData.order_install_windows = parseNumeric(data.order_install_windows);
    if (data.order_install_aluminum !== undefined) updateData.order_install_aluminum = parseNumeric(data.order_install_aluminum);
    if (data.order_old_removed !== undefined) updateData.order_old_removed = parseNumeric(data.order_old_removed);

    console.log('Updating report with data:', JSON.stringify(updateData, null, 2));

    // Update the report
    const { error: updateError } = await supabase
      .from('reports')
      .update(updateData)
      .eq('report_code', reportCode);

    if (updateError) {
      console.error('Error updating report:', updateError);
      throw updateError;
    }

    console.log('Report updated successfully:', reportCode);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Report updated successfully',
      report_code: reportCode
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error syncing from sheet:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
