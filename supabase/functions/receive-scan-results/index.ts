import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScanResultData {
  scan_id: string;
  status: string;
  progress: number;
  results?: any;
  error?: string;
  completed_at?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`Received ${req.method} request to receive-scan-results`);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Parsing request body...');
    const { scan_id, status, progress, results, error, completed_at }: ScanResultData = await req.json();

    if (!scan_id) {
      console.error('Missing scan_id in request');
      return new Response(
        JSON.stringify({ error: 'scan_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing results for scan: ${scan_id}, status: ${status}, progress: ${progress}`);

    // Update scan record
    const updateData: any = {
      status,
      progress: Math.min(progress, 100)
    };

    if (completed_at) {
      updateData.completed_at = completed_at;
    }

    if (error) {
      updateData.error_message = error;
      updateData.status = 'failed';
    }

    if (results && results.findings_count !== undefined) {
      updateData.findings_count = results.findings_count;
      
      // Determine overall severity
      const findings = results.findings || [];
      const severities = findings.map((f: any) => f.severity);
      
      if (severities.includes('critical')) {
        updateData.severity = 'critical';
      } else if (severities.includes('high')) {
        updateData.severity = 'high';
      } else if (severities.includes('medium')) {
        updateData.severity = 'medium';
      } else if (severities.includes('low')) {
        updateData.severity = 'low';
      } else {
        updateData.severity = 'info';
      }
    }

    console.log('Updating scan record...');
    const { error: scanUpdateError } = await supabase
      .from('scans')
      .update(updateData)
      .eq('id', scan_id);

    if (scanUpdateError) {
      console.error('Error updating scan:', scanUpdateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update scan', details: scanUpdateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert detailed results if available
    if (results && status === 'completed') {
      console.log('Inserting scan results...');
      const scanResults = [];

      // Insert summary
      if (results.findings_count !== undefined) {
        scanResults.push({
          scan_id,
          result_type: 'summary',
          content: {
            findings_count: results.findings_count,
            hosts_scanned: results.hosts_scanned || 1,
            scan_stats: results.scan_stats || {}
          }
        });
      }

      // Insert findings
      if (results.findings && results.findings.length > 0) {
        scanResults.push({
          scan_id,
          result_type: 'findings',
          content: { 
            findings: results.findings.map((finding: any) => ({
              ...finding,
              timestamp: new Date().toISOString()
            }))
          }
        });
      }

      // Insert host information
      if (results.scan_stats) {
        scanResults.push({
          scan_id,
          result_type: 'hosts',
          content: {
            total_hosts: results.scan_stats.total_hosts || 1,
            up_hosts: results.scan_stats.up_hosts || 1,
            down_hosts: results.scan_stats.down_hosts || 0
          }
        });
      }

      if (scanResults.length > 0) {
        console.log(`Inserting ${scanResults.length} scan result records...`);
        const { error: resultsError } = await supabase
          .from('scan_results')
          .insert(scanResults);

        if (resultsError) {
          console.error('Error inserting scan results:', resultsError);
          return new Response(
            JSON.stringify({ error: 'Failed to store scan results', details: resultsError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log('Successfully inserted scan results');
      } else {
        console.log('No scan results to insert');
      }
    }

    console.log(`Successfully processed results for scan ${scan_id}`);

    return new Response(
      JSON.stringify({ 
        message: 'Scan results received and processed successfully',
        scan_id,
        status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in receive-scan-results function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});