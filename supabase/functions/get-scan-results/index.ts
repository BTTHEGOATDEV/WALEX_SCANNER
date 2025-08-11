import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`Received ${req.method} request to get-scan-results`);

  try {
    const { scanId } = await req.json();

    if (!scanId) {
      console.error('Missing scanId in request');
      return new Response(
        JSON.stringify({ error: 'Scan ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching details for scan: ${scanId}`);

    // Create Supabase client with user context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !data.user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${data.user.id}`);

    // Get scan details with better error handling
    console.log('Fetching scan details...');
    const { data: scan, error: scanError } = await supabaseClient
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .maybeSingle();

    console.log('Raw scan query result:', { scan, scanError });

    if (scanError) {
      console.error('Database error fetching scan:', scanError);
      return new Response(
        JSON.stringify({ error: 'Database error fetching scan', details: scanError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!scan) {
      console.error('Scan not found for ID:', scanId, 'User:', data.user.id);
      
      // Let's also check if the scan exists at all (without RLS)
      const { data: allScans } = await supabaseClient
        .from('scans')
        .select('id, user_id')
        .eq('id', scanId);
      
      console.log('Scan existence check:', allScans);
      
      return new Response(
        JSON.stringify({ error: 'Scan not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found scan: ${scan.id}, status: ${scan.status}`);

    // Get scan results
    console.log('Fetching scan results...');
    const { data: results, error: resultsError } = await supabaseClient
      .from('scan_results')
      .select('*')
      .eq('scan_id', scanId)
      .order('created_at', { ascending: false });

    if (resultsError) {
      console.error('Error fetching scan results:', resultsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch scan results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${results?.length || 0} scan results`);

    return new Response(
      JSON.stringify({
        scan,
        results: results || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-scan-results function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});