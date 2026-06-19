/**
 * /api/rsvp
 * GET  → returns all RSVPs (for admin use)
 * POST → saves a new RSVP and sends a confirmation email via mailto link
 *
 * For production: replace the in-memory store with Supabase, Airtable, or
 * any other database. The interface stays the same.
 *
 * Note: On Vercel's serverless functions the filesystem is read-only, so
 * we use an in-memory store per cold-start. For a persistent solution,
 * connect a database (see README.md).
 */

const rsvps = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Simple password protection — change this value!
    const { secret } = req.query;
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ rsvps });
  }

  if (req.method === 'POST') {
    const { name, email, guests, message, activities } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name und E-Mail sind erforderlich.' });
    }

    const entry = {
      id: Date.now(),
      name,
      email,
      guests: parseInt(guests) || 1,
      message: message || '',
      activities: activities || [],
      createdAt: new Date().toISOString(),
    };

    rsvps.push(entry);

    // In production: send a confirmation email here via Resend, Sendgrid, etc.
    console.log('New RSVP:', entry);

    return res.status(200).json({ success: true, entry });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
