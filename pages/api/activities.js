/**
 * /api/activities
 * GET  → returns current activities config
 * POST → updates activities config (admin only)
 */

let activities = [
  { id: 'ceremony', day: 'Mittwoch, 03. Sept.', title: 'Trauung & Empfang', time: '15:00 Uhr', icon: '💍', desc: 'Standesamtliche & freie Trauung im Ehrenhof des Château, gefolgt von Sekt & Canapés im Park.', capacity: null, required: true },
  { id: 'dinner',   day: 'Mittwoch, 03. Sept.', title: 'Festdinner & Tanz',  time: '19:00 Uhr', icon: '🥂', desc: 'Mehrgängiges Dinner im großen Saal, anschließend Musik & Tanz bis in die Nacht.', capacity: null, required: true },
  { id: 'brunch',   day: 'Donnerstag, 04. Sept.', title: 'Brunch im Garten', time: '11:00 Uhr', icon: '🌿', desc: 'Entspanntes Brunch mit frischen Produkten aus der Region auf der Château-Terrasse.', capacity: 60, required: false },
  { id: 'wine',     day: 'Donnerstag, 04. Sept.', title: 'Weinverkostung', time: '16:00 Uhr', icon: '🍷', desc: 'Geführte Verkostung burgundischer Weine mit einem lokalen Sommelierteam.', capacity: 30, required: false },
  { id: 'cycling',  day: 'Freitag, 05. Sept.', title: "Radtour durch die Côte d'Or", time: '09:00 Uhr', icon: '🚴', desc: 'Geführte Radtour durch die Weinberge des Burgunds, ca. 25 km, leichtes Gelände.', capacity: 20, required: false },
  { id: 'cooking',  day: 'Freitag, 05. Sept.', title: 'Kochkurs: Cuisine Bourguignonne', time: '14:00 Uhr', icon: '🍳', desc: 'Lernt gemeinsam mit einem Chefkoch klassische burgundische Rezepte zuzubereiten.', capacity: 16, required: false },
  { id: 'market',   day: 'Samstag, 06. Sept.', title: 'Marktbesuch Beaune', time: '08:30 Uhr', icon: '🧺', desc: 'Ausflug zum Wochenmarkt in der historischen Altstadt von Beaune, ca. 30 Min. Fahrt.', capacity: 40, required: false },
  { id: 'picnic',   day: 'Samstag, 06. Sept.', title: 'Picknick im Château-Park', time: '13:00 Uhr', icon: '🌸', desc: 'Großes Gartenpicknick mit Spielen, Musik und entspanntem Beisammensein.', capacity: null, required: false },
  { id: 'farewell', day: 'Sonntag, 07. Sept.', title: 'Abschiedsbrunch', time: '10:00 Uhr', icon: '👋', desc: 'Gemütlicher letzter Morgen zusammen bevor alle die Heimreise antreten.', capacity: null, required: false },
];

export default function handler(req, res) {
  const { secret } = req.method === 'GET' ? req.query : req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ activities });
  }

  if (req.method === 'POST') {
    const { activities: updated } = req.body;
    if (!Array.isArray(updated)) return res.status(400).json({ error: 'Invalid data' });
    activities = updated;
    return res.status(200).json({ success: true, activities });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
