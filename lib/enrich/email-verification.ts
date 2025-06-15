function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function generateEmailPatterns(firstName: string, lastName: string, domain: string): string[] {
  const f = normalize(firstName);
  const l = normalize(lastName);
  const d = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return [
    `${f}.${l}@${d}`,
    `${f}${l}@${d}`,
    `${f[0]}${l}@${d}`,
    `${f}@${d}`,
    `${l}@${d}`,
    `${l}${f[0]}@${d}`,
    `${f[0]}.${l}@${d}`,
    `${f}${l[0]}@${d}`
  ];
}

export async function verifyEmail(email: string): Promise<boolean> {
  const apiKey = process.env.MV_API_KEY;
  if (!apiKey) throw new Error('MV_API_KEY not set');
  const url = `https://api.millionverifier.com/api/v2/email/verify?key=${apiKey}&email=${encodeURIComponent(email)}`;
  const res = await fetch(url);
  if (!res.ok) return false;
  const data = await res.json();
  // Accept only if status is 'ok' or 'good'
  return data.status === 'ok' || data.status === 'good';
}

export async function tryPatternGuessEmail(lead: any): Promise<void> {
  if (!lead.owner_name || !lead.website) return;
  const [firstName, ...rest] = lead.owner_name.split(' ');
  const lastName = rest.join(' ') || '';
  const domain = lead.website.replace(/^https?:\/\//, '').split('/')[0];
  const patterns = generateEmailPatterns(firstName, lastName, domain);
  for (const email of patterns) {
    const verified = await verifyEmail(email);
    if (verified) {
      lead.email = email;
      lead.email_verified = true;
      // Optionally, update lead in DB here
      return;
    }
  }
  lead.email_verified = false;
}

export async function verifyAllEmails() {} 