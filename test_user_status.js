
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars manually since we are running with node
const envLocal = fs.readFileSync(path.resolve('.env.local'), 'utf8');
const envConfig = {};
envLocal.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envConfig[key.trim()] = value.trim();
});

const supabaseUrl = envConfig['VITE_SUPABASE_URL'];
const supabaseAnonKey = envConfig['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase URL or Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function performTest() {
    console.log("Starting Backend User Logic Test...");

    const testEmail = `test_deactivate_${Date.now()}@example.com`;
    const testPassword = 'password123';

    // 1. Create User
    console.log(`\n1. Creating Test User: ${testEmail}`);
    const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
            full_name: 'Test Deactivate User',
            email: testEmail,
            password: testPassword,
            role: 'mod',
            status: 'Active' // Manually creating as Active first to simulate existing user, or normally pending then approved
        }])
        .select()
        .single();

    if (createError) {
        console.error("Failed to create user:", createError);
        return;
    }
    console.log("User created:", newUser.id);

    // 2. Simulate Login (Check 'Active' status)
    console.log("\n2. Simulating Login (Active Status)...");
    const { data: loginData, error: loginError } = await supabase
        .from('users')
        .select('*')
        .eq('email', testEmail)
        .eq('password', testPassword)
        .single();

    if (loginData && loginData.status === 'Active') {
        console.log("SUCCESS: User can log in (Status is Active).");
    } else {
        console.error("FAILURE: User cannot log in or status mismatch.", loginData);
    }

    // 3. Deactivate User (Set Status to 'Rejected') - Simulating Admin Action
    console.log("\n3. Deactivating User (Setting status to 'Rejected')...");
    const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ status: 'Rejected' })
        .eq('id', newUser.id)
        .select()
        .single();

    if (updateError) {
        console.error("FAILURE: Failed to update user status (Check RLS policies):", updateError);
    } else {
        console.log("User updated:", updateData.status);
    }

    // 4. Simulate Login Again (Should Fail/Return Rejected)
    console.log("\n4. Simulating Login again (Rejected Status)...");
    const { data: reLoginData } = await supabase
        .from('users')
        .select('*')
        .eq('email', testEmail)
        .eq('password', testPassword)
        .single();

    if (reLoginData && reLoginData.status !== 'Active') {
        console.log(`SUCCESS: User login blocked/flagged. Status is '${reLoginData.status}'. Login logic should reject this.`);
    } else if (reLoginData && reLoginData.status === 'Active') {
        console.error("FAILURE: User is still Active!");
    } else {
        // If no data returned (unlikely for simple select unless row deleted)
        console.log("User not found (or other error).");
    }

    // Cleanup
    console.log("\nCleaning up test user...");
    // Note: Delete might strictly require Delete Policy, we will see if we can delete.
    await supabase.from('users').delete().eq('id', newUser.id);
    console.log("Test Complete.");
}

performTest();
