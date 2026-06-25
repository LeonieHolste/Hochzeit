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
  return { ok: res.ok, data: text ? JSON.parse(text) : null };
}

export const DEFAULTS = {
  dateRange: '31.08.–06.09.2026',
  deadline: '01. Juli 2026',
  contactEmail: 'heiraten@leonie-und-moritz.de',
  contactPhone: '',
  venue: 'Château de Veullerot',
  location: 'Liernais, Bourgogne, France',
  heroText: 'Wir freuen uns von Herzen, eine ganze Woche mit euch feiern zu dürfen — im Herzen des Burgunds, umgeben von Weinbergen und dem Zauber eines alten Château.',
  info_sections: '',
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { ok, data } = await query('/settings');
    if (!ok) return res.status(200).json({ settings: DEFAULTS });
    const settings = { ...DEFAULTS };
    (data || []).forEach(row => { settings[row.key] = row.value; });
    return res.status(200).json({ settings });
  }

  if (req.method === 'POST') {
    const { secret, settings } = req.body;
    if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'Invalid data' });
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value: String(value) }));
    const { ok } = await query('/settings', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(rows),
    });
    if (!ok) return res.status(500).json({ error: 'Speichern fehlgeschlagen.' });
    return res.status(200).json({ success: true, settings });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
