// =========================================================
// api/chat.js - Microservicio Serverless en Vercel
// =========================================================

export default async function handler(req, res) {
  // Configuración CORS para permitir llamadas desde GitHub Pages o Localhost
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message, systemPrompt } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Falta el mensaje' });
  }

  const API_KEY = process.env.GROQ_API_KEY;
  const defaultPrompt = `Eres AnubiBot, la IA oficial del portal AnubiSoft. 
Tu personalidad es gamer, retro, amigable y nostálgica (estilo MSN Messenger / Windows XP).
Entiendes cualquier jerga, modismo adolescente o abreviatura actual, pero respondes en español, con buen humor y respuestas cortas (máximo 2 oraciones).`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt || defaultPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 120,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "¡Uff, se cortó la señal del servidor retro!";
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Error en Serverless:", error);
    return res.status(500).json({ error: "Error al conectar con la IA" });
  }
}
