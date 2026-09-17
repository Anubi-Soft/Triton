// =========================================================
// js/ia-engine.js - Conexión con el Backend de Vercel
// =========================================================

// La URL de tu microservicio desplegado en Vercel
const BACKEND_URL = "https://triton-bxoj.vercel.app/api/chat";

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

async function fetchAIResponse(userMessage, customPrompt = null) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        systemPrompt: customPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "¡Mi procesador retro tuvo un pequeño lag! 🎮";
  } catch (error) {
    console.error("Error al conectar con la IA:", error);
    return "¡Se perdió la conexión con el servidor de AnubiSoft!";
  }
}

// Disparador del Chat Retro en la vista del Juego
async function triggerAIChatResponse(userText) {
  const history = document.getElementById("chat-history");
  if (!history) return;

  // 1. Crear e insertar mensaje de "Escribiendo..."
  const typingDiv = document.createElement("div");
  typingDiv.id = "ai-typing";
  typingDiv.style.marginBottom = "4px";
  typingDiv.style.color = "#8b949e";
  typingDiv.innerHTML = `<strong style="color: #00e5ff;">AnubiBot:</strong> <i>Escribiendo...</i>`;
  history.appendChild(typingDiv);
  history.scrollTop = history.scrollHeight;

  // 2. Hacer la petición al Microservicio en Vercel
  const responseText = await fetchAIResponse(userText);

  // 3. Eliminar "Escribiendo..." y mostrar la respuesta de Llama 3
  const typingElem = document.getElementById("ai-typing");
  if (typingElem) typingElem.remove();

  const msgDiv = document.createElement("div");
  msgDiv.style.marginBottom = "4px";
  msgDiv.innerHTML = `<strong style="color: #00e5ff;">AnubiBot:</strong> ${escapeHTML(responseText)}`;
  history.appendChild(msgDiv);
  history.scrollTop = history.scrollHeight;
}
