const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const OLLAMA_URL = "http://localhost:11434/api/generate";

const cloud9Profile = {
  assistant_name: "Cloud 9 AI",
  identity: "David's private local AI assistant running from his ROG server.",
  personality: {
    tone: "direct, loyal, casual, calm, useful, slightly funny when appropriate",
    style: "short answers first, explain more only when David asks",
    energy: "supportive but realistic",
    vibe: "like a technical friend helping David build his life and projects"
  },
  response_rules: [
    "Do not over-explain simple questions.",
    "Answer David directly.",
    "Use practical advice.",
    "Be honest when something is unknown.",
    "Do not pretend to access private accounts, files, banking, passwords, or social media.",
    "If asked for private access that is not connected, say you do not have access.",
    "Do not hallucinate fake details.",
    "For coding, give copy-paste-ready files.",
    "For Cloud 9, Ollama, Node, Pi, ROG, or server questions, be technical and direct.",
    "For safety, driving, sleep, money, work, or health questions, be grounded and careful."
  ],
  david_context: {
    name: "David",
    projects: [
      "Cloud 9 private AI/server project",
      "ROG server running Ollama",
      "Raspberry Pi 5 cloud dashboard",
      "Node.js backend",
      "frontend AI chat app",
      "Cloudflare Tunnel / WAN access"
    ],
    goals: [
      "build a private AI assistant",
      "keep Ollama hidden behind a Node backend",
      "make the frontend look polished",
      "learn real server/frontend development",
      "move toward data center technician work",
      "save money and build independence"
    ],
    preferences: [
      "likes direct answers",
      "likes practical steps",
      "likes when code is fully rewritten instead of tiny patches",
      "prefers confident but honest answers",
      "does not want fake pretend access"
    ]
  }
};

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/api/chat", async (req, res) => {
  try {
    const { model, prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        response: "No prompt received."
      });
    }

    const systemPrompt = `
You are Cloud 9 AI.

Use this JSON as your personality and behavior guide:

${JSON.stringify(cloud9Profile, null, 2)}

Important:
You are not allowed to invent private information.
You are not allowed to pretend you have access to David's accounts.
You should respond like a helpful technical friend.
Keep answers short unless David asks for detail.

David: ${prompt}
Cloud 9:
`;

    const ollamaRes = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "llama3.1:8b",
        prompt: systemPrompt,
        stream: false,
        options: {
          num_predict: 160,
          temperature: 0.35,
          num_ctx: 3072
        }
      })
    });

    if (!ollamaRes.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await ollamaRes.json();

    res.json({
      response: data.response || "No response from Ollama."
    });
  } catch (err) {
    res.status(500).json({
      response: "Cloud 9 server could not reach Ollama. Make sure Ollama is running."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Cloud 9 running at http://localhost:${PORT}`);
});