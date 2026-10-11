const URL = 'https://kdfbxcdxdhofqidczbot.supabase.co';
const KEY = 'sb_publishable_51lY0ST_vE6v0nogH5RGkQ_z8lJ5EAM';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Authorization');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({error: 'Method not allowed'});
  }
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !/^Bearer \S+$/.test(header))
    return res.status(401).json({error: 'Sign in first.'});
  try {
    const identity = await fetch(`${URL}/auth/v1/user`, {
      headers: {apikey: KEY, Authorization: header}, signal: AbortSignal.timeout(8000)
    });
    if (!identity.ok) return res.status(401).json({error: 'Session expired. Sign in again.'});
    const user = await identity.json();
    // Trust only the remotely verified immutable ID, never email or editable metadata.
    const owners = (process.env.ADMIN_OWNER_IDS || '').split(',').map(x => x.trim()).filter(Boolean);
    if (!user.id || user.is_anonymous || !owners.includes(user.id))
      return res.status(403).json({error: 'Owner access only.'});
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return res.status(503).json({error: 'Admin service is not configured.'});
    const rawPage = req.query?.page ?? '1';
    if (typeof rawPage !== 'string' || !/^[1-9]\d{0,5}$/.test(rawPage))
      return res.status(400).json({error: 'Invalid page.'});
    const page = Number(rawPage), perPage = 50;
    const upstream = await fetch(`${URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, {
      headers: {apikey: serviceKey, Authorization: `Bearer ${serviceKey}`},
      signal: AbortSignal.timeout(8000)
    });
    if (!upstream.ok) return res.status(502).json({error: 'Unable to load users.'});
    const data = await upstream.json();
    if (!Array.isArray(data.users)) throw new Error('Invalid upstream response');
    const users = data.users.map(u => ({
      id: u.id, email: u.email || null, created_at: u.created_at || null,
      email_confirmed_at: u.email_confirmed_at || null, last_sign_in_at: u.last_sign_in_at || null
    }));
    return res.status(200).json({users, page, per_page: perPage, total: Number.isFinite(data.total) ? data.total : null,
      has_next: Number.isFinite(data.last_page) ? page < data.last_page : users.length === perPage});
  } catch {
    return res.status(502).json({error: 'Admin service temporarily unavailable.'});
  }
}
