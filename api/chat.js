export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system } = req.body;

    if (!messages || !system) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    const data = await response.json();
    console.log('Claude status:', response.status);
    console.log('Claude response:', JSON.stringify(data).substring(0, 200));
    
    if (!response.ok) {
      return res.status(200).json({ reply: "Oops, j'ai eu un bug 😅 Réessaie !" });
    }

    const reply = data.content?.[0]?.text || "Oops, j'ai eu un bug 😅";
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Erreur:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
