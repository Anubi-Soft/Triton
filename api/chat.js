// =========================================================
// api/chat.js - Serverless Function con Groq / Llama 3
// =========================================================

export default async function handler(req, res) {
  // Manejo de CORS
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

  if (!API_KEY) {
    console.error("Falta la GROQ_API_KEY en las variables de entorno de Vercel.");
    return res.status(500).json({ reply: "¡Configuración de API Key pendiente en Vercel!" });
  }

  const defaultPrompt = `Eres AnubiBot, la IA oficial del portal AnubiSoft. 
Tu personalidad es gamer, retro, amigable y nostálgica (estilo MSN Messenger / Windows XP).
Entiendes cualquier jerga o modismo actual, pero respondes corto, en español y con buena onda.`;

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
        max_tokens: 100,
        temperature: 0.7
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Error devuelto por Groq:", data);
      return res.status(500).json({ reply: "¡Uff, la API de Groq rechazó la conexión!" });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "¡Uff, se cortó la señal del servidor retro!";
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Error en la ejecución Serverless:", error);
    return res.status(500).json({ reply: "¡Error interno en el servidor retro!" });
  }
}
