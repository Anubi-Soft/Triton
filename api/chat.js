// =========================================================
// api/chat.js - Prompt Corregido y Estricto
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

REGLAS CRÍTICAS DE COMANDOS OCULTOS:
Las etiquetas [ACTION:...] son COMANDOS DE SISTEMA para el juego. NUNCA las expliques ni las uses dentro de tus frases. Agrégalas SIEMPRE al FINAL de tu respuesta según lo que pida ${userNick}:

1. INICIAR / EMPEZAR PARIDA:
   - Si la IA debe hacer el primer movimiento, responde amigablemente y agrega al final: [ACTION:START_AI]
   - Si ${userNick} empieza la partida, responde amigablemente y agrega al final: [ACTION:START_USER]

2. CAMBIAR DE BANDO / FICHA / "CAMBIAMOS":
   - Si pide ser X, o dice "cambiamos a X" o "cambiamos" (asumiendo cambiar a la ficha principal X), agrega al final: [ACTION:CHANGE_SIDE_X]
   - Si pide ser O o "cambiamos a O", agrega al final: [ACTION:CHANGE_SIDE_O]

3. MODO VS IA:
   - Si solo pide cambiar el modo a vs IA sin reiniciar, agrega al final: [ACTION:SWITCH_AI]

4. CHARLA CASUAL / CHISTES:
   - Responde normal SIN agregar ninguna etiqueta [ACTION:...].`;

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
        temperature: 0.5 // Bajamos un poco la temperatura para que sea más obediente con los comandos
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
