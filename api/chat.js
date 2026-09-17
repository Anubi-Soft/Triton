// =========================================================
// api/chat.js - Diagnóstico Directo de Groq
// =========================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { message } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;

  // 1. Diagnóstico de Key local en Vercel
  if (!API_KEY) {
    return res.status(500).json({ 
      reply: "DEBUG: La variable GROQ_API_KEY no existe en Vercel." 
    });
  }

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Responde en 1 frase retro estilo chat de juegos." },
          { role: "user", content: message || "Hola" }
        ],
        max_tokens: 80
      })
    });

    const data = await groqResponse.json();

    // 2. Si Groq devuelve error, lo mostramos en el chat en vez de ocultarlo
    if (!groqResponse.ok) {
      const errorDetail = data?.error?.message || JSON.stringify(data);
      return res.status(200).json({ 
        reply: `DEBUG GROQ (${groqResponse.status}): ${errorDetail}` 
      });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ reply: reply || "Sin respuesta devuelta por el modelo." });

  } catch (err) {
    return res.status(500).json({ reply: `DEBUG ERROR: ${err.message}` });
  }
}
