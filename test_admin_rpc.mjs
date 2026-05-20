/**
 * test_admin_rpc.mjs
 * End-to-end test of admin_update_user_status RPC
 * Simulates exactly what the frontend does: call via anon key with caller_user_id
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

const env = dotenv.parse(fs.readFileSync('.env'));
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Known admin users from DB
const ADMIN_RONNACHAI = '5e429f89-bcb0-42a3-9728-dbbc7f6b275e';

async function run() {
  console.log('=== admin_update_user_status RPC End-to-End Test ===\n');

  // 1. Get a mod user to test on
  console.log('1️⃣  Finding a test mod user...');
  const { data: mods, error: modsError } = await supabase
    .from('users')
    .select('id, full_name, status, role')
    .eq('role', 'mod')
    .eq('status', 'Active')
    .limit(1);

  if (modsError || !mods?.length) {
    console.error('❌ Could not find a mod user:', modsError);
    process.exit(1);
  }

  const testTargetId = mods[0].id;
  console.log(`   Target: ${mods[0].full_name} (${testTargetId}) — status: ${mods[0].status}`);

  // 2. Non-admin caller — should fail
  console.log('\n2️⃣  Testing with NON-ADMIN caller (mod calling as self — expect rejection)...');
  const { data: failData, error: failError } = await supabase.rpc('admin_update_user_status', {
    target_user_id: testTargetId,
    new_status: 'Inactive',
    caller_user_id: testTargetId,
  });

  if (failError) {
    console.log(`   ✅ Correctly rejected: "${failError.message}"`);
  } else if (failData && !failData.success) {
    console.log(`   ✅ Correctly rejected: "${failData.error}"`);
  } else {
    console.log('   ❌ UNEXPECTED SUCCESS — security issue!', failData);
  }

  // 3. Active admin caller — should succeed
  console.log('\n3️⃣  Testing with ACTIVE ADMIN caller (Ronnachai)...');
  const { data: okData, error: okError } = await supabase.rpc('admin_update_user_status', {
    target_user_id: testTargetId,
    new_status: 'Inactive',
    caller_user_id: ADMIN_RONNACHAI,
  });

  if (okError) {
    console.error('   ❌ Unexpected error:', okError.message);
  } else if (okData?.success) {
    console.log('   ✅ Status changed to Inactive successfully!');
  } else {
    console.error('   ❌ RPC returned failure:', okData?.error);
  }

  // 4. Restore
  console.log('\n4️⃣  Restoring original status to Active...');
  const { data: restoreData, error: restoreError } = await supabase.rpc('admin_update_user_status', {
    target_user_id: testTargetId,
    new_status: 'Active',
    caller_user_id: ADMIN_RONNACHAI,
  });

  if (restoreError) {
    console.error('   ❌ Failed to restore:', restoreError.message);
  } else if (restoreData?.success) {
    console.log('   ✅ Restored to Active!');
  }

  // 5. Non-existent caller UUID
  console.log('\n5️⃣  Testing with NON-EXISTENT caller UUID...');
  const fakeUUID = '00000000-0000-0000-0000-000000000000';
  const { data: fakeData, error: fakeError } = await supabase.rpc('admin_update_user_status', {
    target_user_id: testTargetId,
    new_status: 'Inactive',
    caller_user_id: fakeUUID,
  });

  if (fakeError) {
    console.log(`   ✅ Correctly rejected: "${fakeError.message}"`);
  } else if (fakeData && !fakeData.success) {
    console.log(`   ✅ Correctly rejected: "${fakeData.error}"`);
  } else {
    console.log('   ❌ UNEXPECTED SUCCESS — non-existent caller was accepted!', fakeData);
  }

  console.log('\n' + '═'.repeat(52));
  console.log('🎉 RPC Security Test Complete!');
}

run().catch(console.error);
