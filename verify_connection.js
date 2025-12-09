
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Manually load .env.local because dotenv default is .env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log(`Checking connection to: ${SUPABASE_URL}`);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing keys in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    // 1. Check if we can connect and list tables (or just try to select from applications)
    console.log("Attempting to select from 'applications' table...");

    const { data, error } = await supabase
        .from('applications')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error("Connection Failed or Table Missing:", error);
        if (error.code === '42P01') {
            console.error("Hint: The table 'applications' does not exist. You need to run schema.sql.");
        }
    } else {
        console.log("Success! Connected to 'applications' table.");
        console.log("Row count:", data); // data is null for head:true usually, count is in count
        // Try INSERT
        console.log("Attempting to INSERT a test record...");
        const { data: insertData, error: insertError } = await supabase
            .from('applications')
            .insert([{
                position: 'Test Position',
                department: 'Test Dept',
                full_name: 'Test User',
                email: 'test@example.com',
                phone: '1234567890',
                form_data: { test: true }
            }])
            .select();

        if (insertError) {
            console.error("INSERT Failed:", insertError);
            console.error("Hint: RLS policies might be blocking insert. Did you run the 'Enable insert for everyone' policy?");
        } else {
            console.log("INSERT Success!", insertData);
            // Clean up
            if (insertData && insertData[0] && insertData[0].id) {
                await supabase.from('applications').delete().eq('id', insertData[0].id);
                console.log("Test record deleted.");
            }
        }
    }

    // 2. Check Storage
    console.log("Attempting to list buckets...");
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.error("Storage Error:", bucketError);
    } else {
        console.log("Buckets found:", buckets.map(b => b.name));
        if (!buckets.find(b => b.name === 'applicants')) {
            console.error("Warning: 'applicants' bucket not found.");
        } else {
            console.log("'applicants' bucket exists.");
        }
    }
}

check();
