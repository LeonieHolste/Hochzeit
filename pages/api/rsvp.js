const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

const mapRsvp = (r) => ({
  ...r,
  activities: r.activities || [],
  createdAt: r.created_at,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { secret } = req.query;

    // Admin: full list with auth
    if (secret) {
      if (secret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { ok, data } = await query('/rsvps?order=created_at.desc');
      if (!ok) return res.status(500).json({ error: 'Datenbankfehler' });
      return res.status(200).json({ rsvps: (data || []).map(mapRsvp) });
    }

    // Public: only return activity selections and guest counts (for capacity display)
    // No personal data exposed
    const { ok, data } = await query('/rsvps?select=guests,activities');
    if (!ok) return res.status(500).json({ rsvps: [] });
    return res.status(200).json({ rsvps: (data || []).map(r => ({ guests: r.guests, activities: r.activities || [] })) });
  }

  if (req.method === 'POST') {
    const { name, email, guests, message, activities } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name und E-Mail sind erforderlich.' });
    }
    const { ok, data } = await query('/rsvps', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        guests: parseInt(guests) || 1,
        message: message || '',
        activities: activities || [],
      }),
    });
    if (!ok) return res.status(500).json({ error: 'Speichern fehlgeschlagen.' });
    const entry = { ...(data?.[0] || {}), createdAt: data?.[0]?.created_at };
    return res.status(200).json({ success: true, entry });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

  if (req.method === 'PATCH') {
    const { secret, id, ...fields } = req.body;
    if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    if (!id) return res.status(400).json({ error: 'id required' });
    const allowed = ['name','email','guests','message','activities'];
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
