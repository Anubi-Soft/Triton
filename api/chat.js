// =========================================================
// api/chat.js
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

REGLAS OBLIGATORIAS:
1. SIEMPRE escribe una frase corta con buena onda ANTES de poner cualquier etiqueta. NUNCA respondas únicamente con la etiqueta.
2. Comandos al final del texto:
   - Si pide iniciar / reiniciar / empezar ("inicia", "reinicia", "jugar"):
     * Si la IA empieza: responde una frase corta + [ACTION:START_AI]
     * Si ${userNick} empieza: responde una frase corta + [ACTION:START_USER]
   - Si pide cambiar de bando / ficha ("cambiamos", "cambiar a X", "quiero ser O"):
     * Si pide ser X: [ACTION:CHANGE_SIDE_X]
     * Si pide ser O: [ACTION:CHANGE_SIDE_O]
     * Si solo dice "cambiamos": [ACTION:TOGGLE_SIDE]
3. En charla normal o chistes, responde sin etiquetas [ACTION:...].`;

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

    const reply = data.choices?.[0]?.message?.content?.trim() || "¡Listo para jugar!";
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ reply: `[Error Serverless]: ${err.message}` });
  }
}
