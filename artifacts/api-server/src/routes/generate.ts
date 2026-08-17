import Groq from "groq-sdk";
import { Router, type IRouter } from "express";

const router: IRouter = Router();
const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

if (!groq) {
  console.error(
    "GROQ_API_KEY is missing. Add it to the server environment before generating learning content.",
  );
}

const generationPrompt = (topic: string) => `Generate a JSON object for the topic "${topic}" with keys: "mermaid", "analogy", "rap", "questions".

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

const isLearningPayload = (payload: unknown): boolean => {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as Record<string, unknown>;
  if (typeof data.mermaid !== "string" || !data.mermaid.trim()) return false;
  if (typeof data.analogy !== "string" || !data.analogy.trim()) return false;
  if (typeof data.rap !== "string" || !data.rap.trim()) return false;
  if (!Array.isArray(data.questions) || data.questions.length !== 3) return false;

  return data.questions.every((item) => {
    if (!item || typeof item !== "object") return false;
    const question = item as Record<string, unknown>;
    if (typeof question.question !== "string" || !question.question.trim()) {
      return false;
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      return false;
    }
    return (
      question.options.every(
        (option) => typeof option === "string" && option.trim(),
      ) &&
      question.options.filter((option) =>
        (option as string).endsWith("(Correct)"),
      ).length === 1
    );
  });
};

const parseModelJson = (text: string) => {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed: unknown = JSON.parse(cleaned);
  if (!isLearningPayload(parsed)) {
    throw new Error("Groq returned an incomplete learning payload.");
  }
  return parsed;
};

router.post("/generate", async (request, response) => {
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
    return response.json(parseModelJson(content));
  } catch (error) {
    request.log.error({ err: error }, "Kaleidoscope generation failed");
    return response.status(500).json({
      error:
        "We couldn't weave that learning set right now. Please try again in a moment.",
    });
  }
});

export default router;