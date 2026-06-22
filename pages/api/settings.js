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
  return { ok: res.ok, data: text ? JSON.parse(text) : null };
}

export const DEFAULTS = {
  dateRange: '31.08.–06.09.2026',
  deadline: '01. Juli 2026',
  contactEmail: 'heiraten@leonie-und-moritz.de',
  venue: 'Château de Veullerot',
  location: 'Liernais, Bourgogne, France',
  info_travel: 'TGV von Paris Gare de Lyon nach Dijon (1h35), dann Mietwagen oder Shuttle (~50 Min.) nach Liernais. Nächste Flughäfen: Lyon (LYS) oder Paris CDG. Wir organisieren Shuttles ab Dijon Bahnhof.',
  info_accommodation: 'Das Château bietet Zimmer für ~60 Gäste. Bitte bei der Anmeldung angeben, ob ihr vor Ort schlafen möchtet. Weitere Hotels in Arnay-le-Duc (15 Min.).',
  info_dresscode: 'Trauung & Dinner: Festlich – Abendkleid oder festlicher Anzug. Tagsüber: Smart Casual – bequem und sommerlich, aber gepflegt. Outdoor-Events: Sportliche Kleidung und festes Schuhwerk empfohlen.',
  info_practical: 'Wetter: Anfang September in Burgund ca. 22–28 °C tagsüber, kühle Abende – eine leichte Jacke empfiehlt sich. Alle Mahlzeiten und organisierten Aktivitäten sind für euch als Gäste kostenfrei.',
  info_contact: 'Bei Fragen meldet euch gern per E-Mail. Ein Link zur WhatsApp-Gästegruppe folgt mit der Bestätigungs-E-Mail. Wir freuen uns über jede Nachricht!',
  info_wishlist: 'Auf Reisen statt Geschenke – unsere Erlebnis-Wunschliste teilen wir gern auf Anfrage.',
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
