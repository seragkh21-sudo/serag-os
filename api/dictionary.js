const BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const WORD_PATTERN = /^[A-Za-z][A-Za-z'’ -]*$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const raw = Array.isArray(req.query?.word) ? req.query.word[0] : req.query?.word;
  const word = String(raw || '').trim().replace(/\s+/g, ' ');
  if (!word || word.length > 80 || word.split(' ').length > 6 || !WORD_PATTERN.test(word)) {
    return res.status(400).json({ error: 'Enter a valid English word or short phrase.' });
  }

  try {
    const upstream = await fetch(BASE + encodeURIComponent(word), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (upstream.status === 404) {
      return res.status(404).json({ title: 'No Definitions Found', message: 'No matching dictionary entry.' });
    }
    if (!upstream.ok) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).json({ error: 'Dictionary provider is temporarily unavailable.' });
    }
    const data = await upstream.json();
    if (!Array.isArray(data)) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).json({ error: 'Unexpected dictionary response.' });
    }
    return res.status(200).json(data);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    console.error('Dictionary upstream request failed', error);
    return res.status(502).json({ error: 'Dictionary provider is temporarily unavailable.' });
  }
}