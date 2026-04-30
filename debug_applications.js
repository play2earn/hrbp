/**
 * Debug Script: Check Applications Table
 * Run: node debug_applications.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service key to bypass RLS
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n🔍 Debug: Checking Applications Table\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Environment Check:');
console.log(`  SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`  SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing (optional, but needed to bypass RLS)'}`);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Missing required environment variables!');
  process.exit(1);
}

// Create clients
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const serviceClient = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

async function checkApplications() {
  console.log('\n📊 Applications Table Check:\n');
  
  // 1. Check with ANON key (should return nothing due to RLS)
  console.log('1️⃣ Query with ANON key (simulates unauthenticated user):');
  const { data: anonData, error: anonError } = await anonClient
    .from('applications')
    .select('id, full_name, status, created_at')
    .limit(5);
  
  if (anonError) {
    console.log(`   ❌ Error: ${anonError.message}`);
  } else {
    console.log(`   📦 Records found: ${anonData?.length || 0}`);
    if (anonData?.length > 0) {
      console.log(`   ⚠️  WARNING: Anon users can read data! RLS may not be enabled.`);
    }
  }

  // 2. Check with SERVICE key (bypasses RLS - shows actual data)
  if (serviceClient) {
    console.log('\n2️⃣ Query with SERVICE key (bypasses RLS, shows real count):');
    const { data: serviceData, error: serviceError, count } = await serviceClient
      .from('applications')
      .select('id, full_name, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (serviceError) {
      console.log(`   ❌ Error: ${serviceError.message}`);
    } else {
      console.log(`   📦 Total records in database: ${count}`);
      if (serviceData && serviceData.length > 0) {
        console.log(`   📋 Latest ${serviceData.length} applications:`);
        serviceData.forEach((app, i) => {
          console.log(`      ${i+1}. ${app.full_name || 'No name'} - ${app.status} (${new Date(app.created_at).toLocaleDateString()})`);
        });
      } else {
        console.log(`   ⚠️  No applications found in the database!`);
        console.log(`   💡 This means no one has submitted an application yet.`);
      }
    }
  } else {
    console.log('\n2️⃣ Skipping SERVICE key check (key not set)');
    console.log('   💡 Add SUPABASE_SERVICE_ROLE_KEY to .env.local to see actual records');
  }

  // 3. Check RLS status
  console.log('\n3️⃣ Checking RLS policies on applications table:');
  if (serviceClient) {
    const { data: policies, error: polError } = await serviceClient
      .rpc('get_policies_for_table', { table_name: 'applications' });
    
    if (polError && polError.code === 'PGRST202') {
      // Function doesn't exist, try direct query
      const { data: rlsCheck } = await serviceClient
        .from('applications')
        .select('id')
        .limit(1);
      console.log(`   ℹ️  RLS appears to be active (service key can read data)`);
    } else if (policies) {
      console.log(`   📜 Found ${policies.length} policies`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📝 Diagnosis Summary:\n');
  
  if (serviceClient) {
    const { count } = await serviceClient
      .from('applications')
      .select('*', { count: 'exact', head: true });
    
    if (count === 0) {
      console.log('🔴 ISSUE: No applications exist in the database.');
      console.log('   → Submit a test application through the form first.');
    } else {
      console.log('🟡 Applications exist but may not be visible due to:');
      console.log('   1. User session not being "authenticated" role');
      console.log('   2. RLS policy blocking the select query');
      console.log('   3. Login using legacy auth instead of Supabase Auth');
      console.log('\n💡 Recommended fixes:');
      console.log('   → Run fix_permissions.sql in Supabase SQL Editor');
      console.log('   → Or temporarily allow anon reads for testing');
    }
  }
  
  console.log('\n');
}

checkApplications().catch(console.error);
