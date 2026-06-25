const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

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

const mapRow = (a) => ({
  id: a.id, day: a.day, title: a.title, time: a.time,
  icon: a.icon, desc: a.description, capacity: a.capacity, required: a.required,
});

export default async function handler(req, res) {
  // GET — public, no auth needed
  if (req.method === 'GET') {
    const { data, ok } = await query('/activities?order=sort_order.asc');
    if (!ok) return res.status(500).json({ error: 'Datenbankfehler' });
    return res.status(200).json({ activities: (data || []).map(mapRow) });
  }

  // POST — admin only, upsert all activities
  if (req.method === 'POST') {
    const { secret, activities } = req.body;
    if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    if (!Array.isArray(activities)) return res.status(400).json({ error: 'Invalid data' });

    const rows = activities.map((a, i) => ({
      id: a.id, day: a.day, title: a.title, time: a.time,
      icon: a.icon, description: a.desc, capacity: a.capacity || null,
      required: !!a.required, sort_order: i,
    }));

    const { ok, data } = await query('/activities', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(rows),
    });
    if (!ok) return res.status(500).json({ error: 'Speichern fehlgeschlagen.' });
    return res.status(200).json({ success: true, activities: (data || []).map(mapRow) });
  }

  // DELETE — admin only, remove single activity
  if (req.method === 'DELETE') {
    const { secret, id } = req.body;
    if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const { ok } = await query(`/activities?id=eq.${id}`, { method: 'DELETE' });
    if (!ok) return res.status(500).json({ error: 'Löschen fehlgeschlagen.' });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
