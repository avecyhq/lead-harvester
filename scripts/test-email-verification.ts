import dotenv from 'dotenv';
dotenv.config();

import { verifyEmail } from '../lib/enrich/email-verification';

async function main() {
  const testEmail = 'support@millionverifier.com'; // Use a known good/bad email for testing
  try {
    const result = await verifyEmail(testEmail);
    console.log(`Verification result for ${testEmail}:`, result);
  } catch (err) {
    console.error('Error verifying email:', err);
  }
}

main(); 