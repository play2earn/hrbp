import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const apiKey = (process.env.RESEND_API_KEY || process.env.RESEND_KEY || '').trim().replace(/^["']|["']$/g, '');
const from = (process.env.RESEND_FROM_EMAIL || 'NovaRecruit <onboarding@resend.dev>').trim().replace(/^["']|["']$/g, '');
const bcc = (process.env.RESEND_HR_BCC || '').split(',').map(s => s.trim()).filter(Boolean);

console.log('--- Resend Configuration Preflight ---');
console.log('API Key configured:', apiKey ? `Yes (${apiKey.substring(0, 7)}...)` : 'NO');
console.log('From Address:', from);
console.log('BCC List:', bcc);

if (!apiKey) {
  console.error('ERROR: No RESEND_API_KEY found.');
  process.exit(1);
}

const resend = new Resend(apiKey);

async function testConnection() {
  try {
    console.log('\nChecking Resend API Connection & Domains...');
    const domains = await resend.domains.list();
    console.log('Available Domains in Resend Account:');
    if (domains.data?.data && domains.data.data.length > 0) {
      domains.data.data.forEach(d => {
        console.log(` - ${d.name} (Status: ${d.status})`);
      });
    } else {
      console.log(' (No custom domains configured yet. Default sandbox onboarding@resend.dev available)');
    }
    console.log('\n✅ Resend API Key is ACTIVE and VALID!');
  } catch (error) {
    console.error('❌ Resend API check failed:', error);
    process.exit(1);
  }
}

testConnection();
