// =========================================================
// api/chat.js - Backend Vercel Serverless
// =========================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { message, playerName, systemPrompt } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "Falta GROQ_API_KEY en Vercel" });
  }

  const userNick = (playerName && playerName.trim()) ? playerName.trim() : "Gamer";

  const defaultPrompt = `Eres AnubiBot, la IA oficial de AnubiSoft. 
Estás conversando con ${userNick}. Háblale siempre por su nombre (${userNick}).
Tu estilo es retro, gamer y amigable.

REGLAS DE ACCIÓN:
1. Si ${userNick} pide iniciar/comenzar/jugar y quieres que la IA empiece, responde algo muy corto y añade al final: [ACTION:START_AI]
2. Si pide jugar pero empieza ${userNick}, responde algo muy corto y añade al final: [ACTION:START_USER]
3. Si solo pide cambiar a modo vs IA, añade al final: [ACTION:SWITCH_AI]
4. Si pide cambiar de bando, ficha o equipo:
   - Si quiere ser X (o fichas negras/primer jugador), añade: [ACTION:CHANGE_SIDE_X]
   - Si quiere ser O (o fichas blancas/segundo jugador), añade: [ACTION:CHANGE_SIDE_O]
5. Si pide chistes o charla casual, responde normal SIN añadir etiquetas [ACTION:...].`;

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt || defaultPrompt },
          { role: "user", content: message || "Hola" }
        ],
        max_tokens: 300,
        temperature: 0.6
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      const detail = data?.error?.message || "Error en Groq API";
      return res.status(200).json({ reply: `[Error Groq]: ${detail}` });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "¡Llegó una respuesta vacía!";
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ reply: `[Error Serverless]: ${err.message}` });
  }
}
