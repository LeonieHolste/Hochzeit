const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function query(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
}

const mapRsvp = (r) => ({ ...r, activities: r.activities || [], createdAt: r.created_at });

async function getSettings() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/settings`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    const data = await res.json();
    const s = {};
    (data || []).forEach(row => { s[row.key] = row.value; });
    return s;
  } catch { return {}; }
}

async function sendNotificationEmail({ name, email, guests, activities, message, toEmail }) {
  if (!RESEND_API_KEY) return;
  const activityList = activities?.length > 0 ? activities.join(', ') : 'nur Hauptevents';
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #3a3228;">
      <div style="border-bottom: 1px solid #d4c4b0; padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <h1 style="font-size: 1.4rem; font-weight: 400; color: #5c4130; margin: 0;">Neue Anmeldung 💍</h1>
        <p style="color: #9a8a7a; font-size: 0.85rem; margin: 0.25rem 0 0;">Leonie &amp; Moritz · 03.09.2026</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
        <tr><td style="padding: 0.5rem 0; color: #9a8a7a; width: 140px;">Name</td><td style="padding: 0.5rem 0; font-weight: bold;">${name}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9a8a7a;">E-Mail</td><td style="padding: 0.5rem 0;">${email}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9a8a7a;">Personen</td><td style="padding: 0.5rem 0;">${guests}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #9a8a7a;">Aktivitäten</td><td style="padding: 0.5rem 0;">${activityList}</td></tr>
        ${message ? `<tr><td style="padding: 0.5rem 0; color: #9a8a7a; vertical-align: top;">Nachricht</td><td style="padding: 0.5rem 0; font-style: italic;">${message}</td></tr>` : ''}
      </table>
      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #d4c4b0;">
        <p style="font-size: 0.8rem; color: #9a8a7a; margin: 0;">Diese E-Mail wurde automatisch von der Hochzeitswebseite versendet.</p>
      </div>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Hochzeit Leonie & Moritz <onboarding@resend.dev>',
        to: [toEmail],
        subject: `Neue Anmeldung: ${name} (${guests} Pers.)`,
        html,
      }),
    });
  } catch (e) {
    console.error('Email send failed:', e);
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { secret } = req.query;
    if (secret) {
      if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
      const { ok, data } = await query('/rsvps?order=created_at.desc');
      if (!ok) return res.status(500).json({ error: 'Datenbankfehler' });
      return res.status(200).json({ rsvps: (data || []).map(mapRsvp) });
    }
    const { ok, data } = await query('/rsvps?select=guests,activities');
    if (!ok) return res.status(500).json({ rsvps: [] });
    return res.status(200).json({ rsvps: (data || []).map(r => ({ guests: r.guests, activities: r.activities || [] })) });
  }

  if (req.method === 'POST') {
    const { name, email, guests, message, activities } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name und E-Mail sind erforderlich.' });

    const { ok, data } = await query('/rsvps', {
      method: 'POST',
      body: JSON.stringify({ name, email, guests: parseInt(guests) || 1, message: message || '', activities: activities || [] }),
    });
    if (!ok) return res.status(500).json({ error: 'Speichern fehlgeschlagen.' });

    // Send notification email to admin — non-blocking
    const settings = await getSettings();
    const toEmail = settings.contactEmail || 'heiraten@leonie-und-moritz.de';
    sendNotificationEmail({ name, email, guests: parseInt(guests) || 1, activities, message, toEmail });

    return res.status(200).json({ success: true, entry: { ...(data?.[0] || {}), createdAt: data?.[0]?.created_at } });
  }

  if (req.method === 'PATCH') {
    const { secret, id, ...fields } = req.body;
    if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    if (!id) return res.status(400).json({ error: 'id required' });
    const allowed = ['name', 'email', 'guests', 'message', 'activities'];
    const update = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)));
    if (update.guests) update.guests = parseInt(update.guests);
    const { ok, data } = await query(`/rsvps?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(update) });
    if (!ok) return res.status(500).json({ error: 'Aktualisierung fehlgeschlagen.' });
    return res.status(200).json({ success: true, entry: data?.[0] });
  }

  if (req.method === 'DELETE') {
    const { secret, id } = req.body;
    if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    if (!id) return res.status(400).json({ error: 'id required' });
    const { ok } = await query(`/rsvps?id=eq.${id}`, { method: 'DELETE' });
    if (!ok) return res.status(500).json({ error: 'Löschen fehlgeschlagen.' });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
