export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const API_KEY = process.env.STACKER_API_KEY;
  if (!API_KEY) { res.status(500).json({ error: 'STACKER_API_KEY not configured' }); return; }

  // Build the full Stacker URL from the path param
  const pathParam = req.query.path || '';
  const stackerUrl = `https://stacker.ai/api/v1/${pathParam}`;

  // Forward all query params except 'path'
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') params.append(k, v);
  }
  const qs = params.toString();
  const url = qs ? `${stackerUrl}?${qs}` : stackerUrl;

  console.log('→ Proxying to:', url);

  try {
    const opts = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    if (req.method !== 'GET' && req.body) {
      opts.body = JSON.stringify(req.body);
    }
    const r = await fetch(url, opts);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
