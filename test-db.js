const { createClient } = require('@supabase/supabase-js');

// Project credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxsixllbppablltuvtkj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Cf8BqtzedCI5qHgtt0gWRA_TihclIWq';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Connecting to:", supabaseUrl);
  
  const { data: cust, error: custErr } = await supabase.from('customers').select('*').limit(1);
  console.log("Customers query result:", { data: cust, error: custErr });

  const { data: prod, error: prodErr } = await supabase.from('products').select('*').limit(1);
  console.log("Products query result:", { data: prod, error: prodErr });
}

run();
