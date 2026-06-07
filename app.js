const form = document.getElementById("chatForm");
const promptInput = document.getElementById("prompt");
const messages = document.getElementById("messages");
const modelSelect = document.getElementById("model");

// Ollama local API
const OLLAMA_URL = "http://localhost:11434/api/generate";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = promptInput.value.trim();
  if (!prompt) return;

  addMessage("user", "You", prompt);
  promptInput.value = "";

  const loading = addMessage("ai", "Cloud 9", "Thinking...");

  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelSelect.value,
        prompt: prompt,
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await res.json();

    loading.querySelector("p").textContent =
      data.response || "No response from Ollama.";
  } catch (err) {
    loading.querySelector("p").textContent =
      "Cannot reach Ollama. Make sure Ollama is running on http://localhost:11434";
  }
});

function addMessage(type, name, text) {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  div.innerHTML = `
    <strong>${escapeHtml(name)}</strong>
    <p>${escapeHtml(text)}</p>
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  return div;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}