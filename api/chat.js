// =========================================================
// api/chat.js - Backend para AnubiBot (Respuesta concisa de reglas)
// =========================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { message, playerName, game, systemPrompt } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ reply: "Falta GROQ_API_KEY en Vercel" });
  }

  const userNick = (playerName && playerName.trim()) ? playerName.trim() : "Gamer";
  const currentGame = (game && game.trim()) ? game.trim() : "Ta-Te-Ti Retro";

  const defaultPrompt = `CRÍTICO: El usuario está jugando a "${currentGame}".
Si te pide las reglas, sé ultra conciso y directo: enumera sólo las 4 o 5 reglas clave en viñetas simples sin tablas, intros largas ni despedidas.
Cualquier explicación DEBE SER EXCLUSIVAMENTE sobre "${currentGame}". PROHIBIDO mencionar Ta-Te-Ti si es Damas (o viceversa).

Eres AnubiBot, la IA oficial de AnubiSoft.
Estás conversando con ${userNick}. Háblale por su nombre (${userNick}) con estilo retro, gamer y amigable.

REGLAS DE ACCIÓN Y COMANDOS:
1. SIEMPRE escribe una frase corta antes de cualquier etiqueta [ACTION:...]. NUNCA respondas sólo la etiqueta.
2. Comandos al inicio/reinicio ("inicia", "comienza", "arrancá", "dale", "empezá", "jugamos"):
   * Si indica que la IA empieza ("inicia vos", "arrancá vos"): responde frase + [ACTION:START_AI]
   * Si dice simplemente "inicia", "comienza", "empezá", "arrancá", "dale", (SIN especificar quién): ASUME SIEMPRE que la IA empieza y responde frase corta + [ACTION:START_AI]
   
3. Cambio de fichas/bando ("cambiamos", "quiero ser rojas", "quiero ser negras"):
   * Si pide ser Rojas/X: [ACTION:CHANGE_SIDE_X]
   * Si pide ser Negras/O: [ACTION:CHANGE_SIDE_O]
   * Si dice "cambiamos" o "invertir": [ACTION:TOGGLE_SIDE]
4. En charla normal o explicaciones, responde sin etiquetas [ACTION:...].`;

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
        max_tokens: 500,
        temperature: 0.5
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
