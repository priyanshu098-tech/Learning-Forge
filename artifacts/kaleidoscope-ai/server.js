import "dotenv/config";

import cors from "cors";
import express from "express";
import Groq from "groq-sdk";
import { fileURLToPath } from "node:url";
import path from "node:path";

const app = express();
const port = Number(process.env.PORT || 3000);
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const publicDirectory = path.join(currentDirectory, "public");
const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

if (!groq) {
  console.error(
    "GROQ_API_KEY is missing. Add it to the server environment before generating learning content.",
  );
}

app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN
      ? process.env.ALLOWED_ORIGIN.split(",").map((origin) => origin.trim())
      : false,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(express.static(publicDirectory, { extensions: ["html"] }));

const generationPrompt = (topic) => `Generate a JSON object for the topic "${topic}" with keys: "mermaid", "analogy", "rap", "questions".

Use this exact JSON structure:
{
  "mermaid": "A Mermaid graph LR flowchart with 5-8 meaningful nodes about the topic",
  "analogy": "An exactly 2-sentence everyday comparison",
  "rap": "A catchy 4-line rhyming verse with newline characters between lines",
  "questions": [
    {
      "question": "A question testing the topic",
      "options": ["Wrong option", "Wrong option", "Correct option (Correct)", "Wrong option"]
    },
    {
      "question": "A second question testing the topic",
      "options": ["Wrong option", "Correct option (Correct)", "Wrong option", "Wrong option"]
    },
    {
      "question": "A third question testing the topic",
      "options": ["Correct option (Correct)", "Wrong option", "Wrong option", "Wrong option"]
    }
  ]
}

The "mermaid" value must contain only valid Mermaid diagram syntax beginning with "graph LR". The "questions" value must contain exactly 3 objects, each with exactly 4 options. Exactly one option per question must end with "(Correct)"; the other three must not contain "(Correct)".`;

const isLearningPayload = (payload) => {
  if (!payload || typeof payload !== "object") return false;
  if (typeof payload.mermaid !== "string" || !payload.mermaid.trim()) return false;
  if (typeof payload.analogy !== "string" || !payload.analogy.trim()) return false;
  if (typeof payload.rap !== "string" || !payload.rap.trim()) return false;
  if (!Array.isArray(payload.questions) || payload.questions.length !== 3) {
    return false;
  }

  return payload.questions.every((item) => {
    if (!item || typeof item !== "object") return false;
    if (typeof item.question !== "string" || !item.question.trim()) return false;
    if (!Array.isArray(item.options) || item.options.length !== 4) return false;
    return (
      item.options.every(
        (option) => typeof option === "string" && option.trim(),
      ) &&
      item.options.filter((option) => option.endsWith("(Correct)")).length === 1
    );
  });
};

const parseModelJson = (text) => {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  if (!isLearningPayload(parsed)) {
    throw new Error("Groq returned an incomplete learning payload.");
  }
  return parsed;
};

app.post("/api/generate", async (request, response) => {
  const topic =
    typeof request.body?.topic === "string" ? request.body.topic.trim() : "";

  if (!topic) {
    return response.status(400).json({ error: "Please enter a topic to learn." });
  }

  if (topic.length > 160) {
    return response
      .status(400)
      .json({ error: "Keep the topic under 160 characters." });
  }

  if (!groq) {
    return response.status(500).json({
      error:
        "Groq is not configured yet. Add GROQ_API_KEY to the server environment.",
    });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational architect. Output ONLY valid JSON. No markdown, no explanations.",
        },
        { role: "user", content: generationPrompt(topic) },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Groq returned an empty response.");
    }
    const learningPayload = parseModelJson(content);

    return response.json(learningPayload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown generation error";
    console.error("Kaleidoscope Groq generation failed:", message);
    return response.status(500).json({
      error:
        "We couldn't weave that learning set right now. Please try again in a moment.",
    });
  }
});

app.get("/", (_request, response) => {
  response.sendFile(path.join(publicDirectory, "index.html"));
});

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found." });
});

app.listen(port, "0.0.0.0", () => {
  console.info(`Kaleidoscope AI listening on port ${port}`);
});