const SUPABASE_URL = 'https://ehcicrjejumaijedvslc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoY2ljcmplanVtYWlqZWR2c2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mzc2NjMsImV4cCI6MjA2NTMxMzY2M30.b6wLQ_K6AtI0reOvt2313Pseo5l6KV-iIiRUOYre488';

async function signIn(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  const data = await response.json();
  if (data.access_token) {
    console.log('Access token:', data.access_token);
  } else {
    console.error('Error:', data);
  }
}

signIn('jane.doe@gmail.com', 'SecurePassw0rd!'); 