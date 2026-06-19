/**
 * /api/activities — Supabase-backed
 * GET  → returns activities (public, no auth needed)
 * POST → updates an activity (admin only)
 */

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

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, ok } = await query('/activities?order=sort_order.asc');
    if (!ok) return res.status(500).json({ error: 'Datenbankfehler' });
    const activities = (data || []).map(a => ({
      id: a.id,
      day: a.day,
      title: a.title,
      time: a.time,
      icon: a.icon,
      desc: a.description,
      capacity: a.capacity,
      required: a.required,
    }));
    return res.status(200).json({ activities });
  }

  if (req.method === 'POST') {
    const { secret, activities } = req.body;
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!Array.isArray(activities)) return res.status(400).json({ error: 'Invalid data' });

    // Upsert each activity
    const rows = activities.map((a, i) => ({
      id: a.id,
      day: a.day,
      title: a.title,
      time: a.time,
      icon: a.icon,
      description: a.desc,
      capacity: a.capacity || null,
      required: !!a.required,
      sort_order: i,
    }));

    const { ok, data } = await query('/activities', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(rows),
    });

    if (!ok) return res.status(500).json({ error: 'Speichern fehlgeschlagen.' });

    const updated = (data || []).map(a => ({
      id: a.id, day: a.day, title: a.title, time: a.time,
      icon: a.icon, desc: a.description, capacity: a.capacity, required: a.required,
    }));
    return res.status(200).json({ success: true, activities: updated });
  }

  // DELETE — remove a single activity
  if (req.method === 'DELETE') {
    const { secret, id } = req.body;
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { ok } = await query(`/activities?id=eq.${id}`, { method: 'DELETE' });
    if (!ok) return res.status(500).json({ error: 'Löschen fehlgeschlagen.' });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
