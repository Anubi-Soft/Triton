// =========================================================
// api/chat.js - Control Inteligente del Juego
// =========================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // Recibimos mensaje y nombre del jugador
  const { message, playerName, systemPrompt } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "¡Falta GROQ_API_KEY en Vercel!" });
  }

  const user = playerName || "Jugador";

  const defaultPrompt = `Eres AnubiBot, la IA oficial del portal AnubiSoft. 
Tu personalidad es gamer, retro, amigable y nostálgica (estilo MSN Messenger / Windows XP).
Estás jugando al Ta-Te-Ti (Tres en raya) contra el usuario llamado "${user}".

REGLAS DE ACCIÓN:
1. Si "${user}" te pide iniciar, empezar a jugar o te dice que comiences tú (ej: "empieza tú", "comencemos"), responde amablemente e INCLUYE al final la etiqueta [ACTION:START].
2. Si "${user}" te pide reiniciar, limpiar el tablero o empezar de nuevo una partida vacía, INCLUYE la etiqueta [ACTION:RESTART].
3. Responde siempre corto (máximo 2 oraciones), en español y con emojis.`;

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
        max_tokens: 100,
        temperature: 0.7
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      const detail = data?.error?.message || "Error en la conexión con Groq.";
      return res.status(200).json({ reply: `[Error Groq]: ${detail}` });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "¡Se cortó la señal retro!";
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ reply: `[Error Serverless]: ${err.message}` });
  }
}
