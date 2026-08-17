# 🔥 Learning Forge

> *Scan a page. Type a topic. Unlock learning in 4 dimensions.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Try_Now-7c3aed?style=for-the-badge&logo=replit&logoColor=white)](https://learning-forge--avasthivisham13.replit.app/)
[![Hackathon](https://img.shields.io/badge/Suvidha_AI_Hackathon-2026-0a2c4e?style=for-the-badge)](https://suvidha-ai-virtual-hackathon.devpost.com)
[![Made with Node](https://img.shields.io/badge/Made_with-Node.js-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

---

## 🧠 The Real Problem

Textbooks are built for the *average* brain. But what if your brain isn't average? 

For students with **ADHD**, **Dyslexia**, or **Low Vision**, dense paragraphs aren't just boring—they are a **locked door**. These students can't filter signal from noise. They get lost before they even start.

**Learning Forge** removes that barrier. We turn one dense topic into **4 distinct weapons of learning**—so every student can finally find the key that fits their brain.

---

## ✨ The 4 Weapons of Learning

| Weapon | What it does | Why it wins |
| :--- | :--- | :--- |
| 🧠 **Visual Mindmap** | Auto-generates a flow-chart of the topic (using Mermaid.js) | Spatial/Visual learners finally see the "big picture" and cause/effect. |
| 🔗 **Everyday Analogy** | Explains the topic using sports, cooking, or movies | Relational thinkers connect new ideas to things they already know. |
| 🎤 **Memory Rap** | A catchy, rhyming 4-line verse. Press "Listen" to hear it. | Auditory/Musical learners lock it into long-term memory. |
| ❓ **Interactive Quiz** | 3 multiple-choice questions with instant feedback | Active recall solidifies knowledge instead of passive reading. |

---

## 📸 Bonus: The "Scan" Feature

We didn't stop at typing. 

If the student has a **physical textbook**, they just click **"📸 Scan Page"**, take a photo, and **Gemini Vision** reads the page, extracts the main topic and key terms, and automatically loads everything into the 4 weapons. 

**No typing required. No friction. Just learning.**

---

## 🔍 The "Focus Mode" (Infinite Drill-down)

Ever read a sentence, get stuck on one word, and just give up? 

In **Learning Forge**, you **click any word** in the Analogy or Rap. The entire app instantly regenerates a *brand new* Mindmap, Analogy, Rap, and Quiz for *just that word*. 

The user never gets stuck because they can drill down infinitely until they *actually* understand.

---

## ⚙️ How the Tech Works

```mermaid
graph LR
    A[User Input] --> B{Entry Method};
    B -->|Text| C[Groq LLM];
    B -->|Scan Image| D[Gemini Vision];
    D -->|Extracts Topic| C;
    C -->|Structured JSON| E[Frontend Renderer];
    E --> F[Mermaid.js Diagram];
    E --> G[Analogy + Rap Text];
    E --> H[Interactive Quiz];
    G --> I[Click Word → Focus Mode];
    I --> C;
