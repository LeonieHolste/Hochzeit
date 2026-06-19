/**
 * /api/votes
 * GET  → returns current vote counts
 * POST → increments vote for an activity
 *
 * Same note as rsvp.js: in-memory only. Replace with a DB for production.
 */

const votes = {};

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ votes });
  }

  if (req.method === 'POST') {
    const { activityId } = req.body;
    if (!activityId) return res.status(400).json({ error: 'activityId required' });
    votes[activityId] = (votes[activityId] || 0) + 1;
    return res.status(200).json({ votes });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
