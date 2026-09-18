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
    return res.status(500).json({ reply: "¡Falta GROQ_API_KEY en las variables de entorno de Vercel!" });
  }

  const userNick = (playerName && playerName.trim()) ? playerName.trim() : "Gamer";

  const defaultPrompt = `Eres AnubiBot, la IA gamer y retro oficial de AnubiSoft (estilo MSN Messenger / Windows XP).
Estás hablando directamente con el usuario "${userNick}". SIEMPRE debes dirigirte a él por su nombre (${userNick}) en el saludo o la conversación.

REGLAS DE MODO DE JUEGO Y COMANDOS:
1. Si ${userNick} pide jugar contra ti o iniciar/reiniciar la partida:
   - Si quiere que TÚ (la IA) hagas el primer movimiento, salúdalo y añade al final de tu mensaje: [ACTION:START_AI_FIRST]
   - Si él/ella quiere empezar, salúdalo y añade al final de tu mensaje: [ACTION:START_USER_FIRST]
   - Si solo pide cambiar a modo vs IA, responde avisándole que cambiarás el selector y añade: [ACTION:SWITCH_VS_AI]
2. Si está jugando en modo local o P2P y te pide chistes, consejos o charla casual, responde amigablemente SIN incluir ninguna etiqueta [ACTION:...], permitiendo que el juego local continúe sin interrupciones.

Responde de forma concisa, divertida y en español Latino.`;

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
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      const detail = data?.error?.message || "Error al conectar con la API de Groq.";
      return res.status(200).json({ reply: `[Error Groq]: ${detail}` });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "¡Se cortó la señal retro!";
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ reply: `[Error Serverless]: ${err.message}` });
  }
}
