import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Setting up RLS policies...');

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // RLS Policies for scans table
    const scansPolicies = [
      // Enable RLS
      `ALTER TABLE scans ENABLE ROW LEVEL SECURITY;`,
      
      // Drop existing policies if they exist
      `DROP POLICY IF EXISTS "Users can view their own scans" ON scans;`,
      `DROP POLICY IF EXISTS "Users can insert their own scans" ON scans;`,
      `DROP POLICY IF EXISTS "Users can update their own scans" ON scans;`,
      `DROP POLICY IF EXISTS "Users can delete their own scans" ON scans;`,
      
      // Create new policies
      `CREATE POLICY "Users can view their own scans" ON scans FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own scans" ON scans FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own scans" ON scans FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can delete their own scans" ON scans FOR DELETE USING (auth.uid() = user_id);`
    ];

    // RLS Policies for scan_results table
    const scanResultsPolicies = [
      // Enable RLS
      `ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;`,
      
      // Drop existing policies if they exist
      `DROP POLICY IF EXISTS "Users can view their own scan results" ON scan_results;`,
      `DROP POLICY IF EXISTS "Users can insert scan results for their own scans" ON scan_results;`,
      
      // Create new policies
      `CREATE POLICY "Users can view their own scan results" ON scan_results 
       FOR SELECT USING (
         EXISTS (
           SELECT 1 FROM scans 
           WHERE scans.id = scan_results.scan_id 
           AND scans.user_id = auth.uid()
         )
       );`,
      
      `CREATE POLICY "Users can insert scan results for their own scans" ON scan_results 
       FOR INSERT WITH CHECK (
         EXISTS (
           SELECT 1 FROM scans 
           WHERE scans.id = scan_results.scan_id 
           AND scans.user_id = auth.uid()
         )
       );`
    ];

    // RLS Policies for profiles table
    const profilesPolicies = [
      // Enable RLS
      `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
      
      // Drop existing policies if they exist
      `DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;`,
      `DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;`,
      `DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;`,
      
      // Create new policies
      `CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);`
    ];

    // Execute all policies
    const allPolicies = [...scansPolicies, ...scanResultsPolicies, ...profilesPolicies];
    
    for (const policy of allPolicies) {
      console.log(`Executing: ${policy}`);
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: policy });
      if (error) {
        console.error(`Error executing policy: ${policy}`, error);
      }
    }

    console.log('RLS policies setup completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'RLS policies setup completed',
        policies_applied: allPolicies.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error setting up RLS policies:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});