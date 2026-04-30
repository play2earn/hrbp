
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkData() {
    console.log('--- Verifying Data Seeding (Part 1) ---');

    // Check Provinces
    const { count: provinceCount, error: pError } = await supabase
        .from('provinces')
        .select('*', { count: 'exact', head: true });

    if (pError) console.error('Error fetching provinces:', pError);
    else console.log(`Provinces Count: ${provinceCount}`);

    // Check Specific Province (Bangkok)
    const { data: bkk, error: bkkError } = await supabase
        .from('provinces')
        .select('id, name_en')
        .eq('name_th', 'กรุงเทพมหานคร')
        .single();

    if (bkkError) console.error('Error fetching Bangkok:', bkkError);
    else console.log(`Bangkok Found: ID ${bkk.id}, Name: ${bkk.name_en}`);

    // Check Districts
    const { count: districtCount, error: dError } = await supabase
        .from('districts')
        .select('*', { count: 'exact', head: true });

    if (dError) console.error('Error fetching districts:', dError);
    else console.log(`Districts Count: ${districtCount}`);

    // Check Subdistricts
    const { count: subCount, error: sError } = await supabase
        .from('subdistricts')
        .select('*', { count: 'exact', head: true });

    if (sError) console.error('Error fetching subdistricts:', sError);
    else console.log(`Subdistricts Count: ${subCount}`);

    console.log('---------------------------------------');
}

checkData();
