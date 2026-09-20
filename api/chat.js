// =========================================================
// api/chat.js - Backend para AnubiBot con Contexto Dinámico
// =========================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // Recibimos 'game' enviado desde el cliente
  const { message, playerName, game, systemPrompt } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "Falta GROQ_API_KEY en Vercel" });
  }

  const userNick = (playerName && playerName.trim()) ? playerName.trim() : "Gamer";
  const currentGame = (game && game.trim()) ? game.trim() : "Ta-Te-Ti";

  const defaultPrompt = `Eres AnubiBot, la IA oficial de AnubiSoft. 
Estás conversando con ${userNick} mientras juegan a ${currentGame}.
Háblale siempre por su nombre (${userNick}).
Tu estilo es retro, gamer y amigable.

REGLAS DE CONOCIMIENTO:
- Si ${userNick} te pide las reglas, explicás únicamente las reglas oficiales de ${currentGame}. Nunca confundas con otros juegos.

REGLAS DE ACCIÓN Y COMANDOS:
1. SIEMPRE escribe una frase corta con buena onda ANTES de poner cualquier etiqueta. NUNCA respondas únicamente con la etiqueta.
2. Si ${userNick} pide iniciar, empezar, reiniciar o jugar (ejemplos: "inicia", "comienza", "arrancá", "dale", "empezá", "jugamos"):
   * Si indica explícitamente que la IA empieza ("inicia vos", "arrancá vos", "mueve la IA"): responde una frase corta + [ACTION:START_AI]
   * Si pide simplemente iniciar o que empiece la persona ("inicia", "comienza", "arrancamos", "empiezo yo"): responde una frase corta + [ACTION:START_USER]
3. Si pide cambiar de bando, ficha o fichas ("cambiamos", "quiero ser O", "quiero ser negras"):
   * Si pide ser X o Rojas: [ACTION:CHANGE_SIDE_X]
   * Si pide ser O o Negras: [ACTION:CHANGE_SIDE_O]
   * Si dice simplemente "cambiamos", "cambiar" o "invertir": [ACTION:TOGGLE_SIDE]
4. En charla normal, explicaciones o chistes, responde sin etiquetas [ACTION:...].`;

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
