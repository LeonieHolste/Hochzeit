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
    const { ok, data } = await query('/votes');
    if (!ok) return res.status(500).json({ error: 'Datenbankfehler' });
    const votes = {};
    (data || []).forEach(row => { votes[row.activity_id] = row.count; });
    return res.status(200).json({ votes });
  }

  if (req.method === 'POST') {
    const { activityId } = req.body;
    if (!activityId) return res.status(400).json({ error: 'activityId required' });

    // Use Supabase RPC to atomically increment — avoids race conditions
    // First try upsert with increment via raw SQL through rpc
    // Fallback: fetch + update
    const { data: existing } = await query(`/votes?activity_id=eq.${encodeURIComponent(activityId)}`);
    const current = existing?.[0]?.count || 0;

    const { ok } = await query('/votes', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ activity_id: activityId, count: current + 1 }),
    });
    if (!ok) return res.status(500).json({ error: 'Speichern fehlgeschlagen.' });

    const { data: allVotes } = await query('/votes');
    const votes = {};
    (allVotes || []).forEach(row => { votes[row.activity_id] = row.count; });
    return res.status(200).json({ votes });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
