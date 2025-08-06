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

  try {
    const { target, scanType, scanSubtype, priority } = await req.json();

    // Validate input
    if (!target || !scanType) {
      return new Response(
        JSON.stringify({ error: 'Target and scan type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for database operations
    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create client for user authentication
    const supabaseAuthClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data, error: authError } = await supabaseAuthClient.auth.getUser(token);
    
    if (authError || !data.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = data.user.id;

    // Create scan entry using service role client
    const { data: scan, error: insertError } = await supabaseServiceClient
      .from('scans')
      .insert({
        user_id: userId,
        target,
        scan_type: scanType,
        scan_subtype: scanSubtype,
        priority,
        status: 'queued',
        estimated_completion: new Date(Date.now() + 300000).toISOString() // 5 minutes from now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating scan:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create scan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if PYTHON_SCANNER_URL is set for real scanning
    const pythonScannerUrl = Deno.env.get('PYTHON_SCANNER_URL');
    
    console.log('PYTHON_SCANNER_URL environment variable:', pythonScannerUrl);
    
    if (pythonScannerUrl && pythonScannerUrl !== 'PYTHON_SCANNER_URL') {
      // Use real Python nmap scanning
      console.log(`Using real scanning with URL: ${pythonScannerUrl}`);
      EdgeRuntime.waitUntil(executeRealScan(scan.id, scanType, scanSubtype, target, pythonScannerUrl));
    } else {
      // Fall back to mock scanning for development
      console.log('PYTHON_SCANNER_URL not properly set, using mock scanning');
      EdgeRuntime.waitUntil(executeMockScan(scan.id, scanType, scanSubtype, target));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        scanId: scan.id,
        message: 'Scan created and queued successfully',
        realScanning: !!pythonScannerUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-scan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeRealScan(scanId: string, scanType: string, scanSubtype: string, target: string, pythonScannerUrl: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Update status to running
    await supabase
      .from('scans')
      .update({ 
        status: 'running', 
        started_at: new Date().toISOString(),
        progress: 10 
      })
      .eq('id', scanId);

    console.log(`Starting real scan ${scanId} for ${target} using Python scanner`);

    // Prepare callback URL for Python scanner to report results
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/receive-scan-results`;

    // Clean URL and ensure proper endpoint construction
    let cleanUrl = pythonScannerUrl.trim();
    // Remove trailing slashes
    while (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    // Ensure we have a proper base URL
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    const scanUrl = `${cleanUrl}/scan`;
    
    console.log(`Cleaned base URL: ${cleanUrl}`);
    console.log(`Full scan endpoint: ${scanUrl}`);
    
    // Call Python scanner service
    const scannerResponse = await fetch(scanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scan_id: scanId,
        target,
        scan_type: scanType,
        scan_subtype: scanSubtype,
        priority: 'medium',
        callback_url: callbackUrl
      })
    });

    if (!scannerResponse.ok) {
      throw new Error(`Scanner service responded with status: ${scannerResponse.status}`);
    }

    const scannerResult = await scannerResponse.json();
    console.log('Real scanner initiated:', scannerResult);

  } catch (error) {
    console.error('Real scan execution error:', error);
    
    // Update scan as failed
    await supabase
      .from('scans')
      .update({ 
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: `Real scan failed: ${error.message}`
      })
      .eq('id', scanId);
  }
}

async function executeMockScan(scanId: string, scanType: string, scanSubtype: string, target: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Update status to running
    await supabase
      .from('scans')
      .update({ 
        status: 'running', 
        started_at: new Date().toISOString(),
        progress: 10 
      })
      .eq('id', scanId);

    let scanResults;
    
    // Execute different scan types
    switch (scanType) {
      case 'domain':
        scanResults = await executeDomainScan(target, scanSubtype);
        break;
      case 'port':
        scanResults = await executePortScan(target, scanSubtype);
        break;
      case 'vulnerability':
        scanResults = await executeVulnScan(target, scanSubtype);
        break;
      case 'ssl':
        scanResults = await executeSSLScan(target, scanSubtype);
        break;
      default:
        throw new Error(`Unsupported scan type: ${scanType}`);
    }

    // Update progress
    await supabase
      .from('scans')
      .update({ progress: 75 })
      .eq('id', scanId);

    // Store scan results
    await supabase
      .from('scan_results')
      .insert({
        scan_id: scanId,
        result_type: 'formatted_summary',
        content: scanResults
      });

    // Update scan as completed
    await supabase
      .from('scans')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100,
        findings_count: scanResults.findings?.length || 0,
        severity: calculateSeverity(scanResults.findings || [])
      })
      .eq('id', scanId);

  } catch (error) {
    console.error('Scan execution error:', error);
    
    // Update scan as failed
    await supabase
      .from('scans')
      .update({ 
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', scanId);
  }
}

async function executeDomainScan(target: string, subtype?: string) {
  // Simulate domain scan - In production, this would use actual tools
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
  
  const mockResults = {
    target,
    scan_type: 'domain',
    subtype,
    timestamp: new Date().toISOString(),
    summary: {
      domain_info: {
        domain: target,
        ip_address: '192.168.1.1',
        nameservers: ['ns1.example.com', 'ns2.example.com'],
        mx_records: ['mail.example.com']
      },
      ssl_certificate: {
        valid: true,
        issuer: 'Let\'s Encrypt',
        expires: '2024-12-30'
      }
    },
    findings: [
      {
        type: 'info',
        severity: 'low',
        title: 'Domain Information Retrieved',
        description: `Successfully retrieved domain information for ${target}`
      }
    ]
  };

  return mockResults;
}

async function executePortScan(target: string, subtype?: string) {
  // Simulate port scan
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const openPorts = [22, 80, 443, 3000];
  const mockResults = {
    target,
    scan_type: 'port',
    subtype,
    timestamp: new Date().toISOString(),
    summary: {
      total_ports_scanned: 1000,
      open_ports: openPorts,
      services: {
        22: 'SSH',
        80: 'HTTP',
        443: 'HTTPS',
        3000: 'Unknown'
      }
    },
    findings: openPorts.map(port => ({
      type: 'open_port',
      severity: port === 22 ? 'medium' : 'low',
      title: `Port ${port} Open`,
      description: `Port ${port} is open and accessible`
    }))
  };

  return mockResults;
}

async function executeVulnScan(target: string, subtype?: string) {
  // Simulate vulnerability scan
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const mockResults = {
    target,
    scan_type: 'vulnerability',
    subtype,
    timestamp: new Date().toISOString(),
    summary: {
      vulnerabilities_found: 2,
      risk_score: 6.5
    },
    findings: [
      {
        type: 'vulnerability',
        severity: 'medium',
        title: 'Outdated SSL Protocol',
        description: 'Server supports TLS 1.1 which is deprecated',
        cve: 'CVE-2023-1234'
      },
      {
        type: 'vulnerability',
        severity: 'low',
        title: 'Missing Security Headers',
        description: 'X-Frame-Options header not present'
      }
    ]
  };

  return mockResults;
}

async function executeSSLScan(target: string, subtype?: string) {
  // Simulate SSL scan
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockResults = {
    target,
    scan_type: 'ssl',
    subtype,
    timestamp: new Date().toISOString(),
    summary: {
      certificate_valid: true,
      grade: 'A',
      protocols: ['TLS 1.2', 'TLS 1.3'],
      cipher_suites: 12
    },
    findings: [
      {
        type: 'certificate',
        severity: 'none',
        title: 'Valid SSL Certificate',
        description: 'Certificate is valid and properly configured'
      }
    ]
  };

  return mockResults;
}

function calculateSeverity(findings: any[]): string {
  if (findings.some(f => f.severity === 'critical')) return 'critical';
  if (findings.some(f => f.severity === 'high')) return 'high';
  if (findings.some(f => f.severity === 'medium')) return 'medium';
  if (findings.some(f => f.severity === 'low')) return 'low';
  return 'none';
}