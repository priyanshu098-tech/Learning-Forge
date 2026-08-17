# 🌀 Kaleidoscope AI

> *One topic. Four lenses. Learn like a polymath.*

[![Live Demo] https://learning-forge--avasthishivam13.replit.app/
[![Hackathon](https://img.shields.io/badge/Suvidha_AI_Hackathon-2026-0a2c4e?style=for-the-badge)](https://suvidha-ai-virtual-hackathon.devpost.com)

---

## 🧠 The Problem

**Linear text is a barrier.** 

Students with ADHD, dyslexia, or low vision often suffer from **cognitive overload** when faced with dense textbook pages. They aren't locked out because they aren't smart—they are locked out because the *format* doesn't fit their brain.

We built **Kaleidoscope AI** for **Maya**, a 14-year-old with ADHD who shuts down when she sees a wall of text. She needs information broken down into **visuals**, **stories**, **rhythms**, and **interactive challenges** to truly learn.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **⌨️ Type Any Topic** | Type "Photosynthesis" or "Quantum Physics" → Get 4 dynamic artifacts instantly. |
| **📸 Scan Textbook Page** | Take a photo of any page. Gemini Vision extracts the main topic, summary, and key terms. |
| **🧠 Visual Mindmap** | Auto-generated Mermaid.js flowchart showing cause/effect and relationships. |
| **🔗 Everyday Analogy** | Complex topics explained using sports, cooking, or movies. (Click any word to drill down!) |
| **🎤 Memory Rap** | A catchy, rhyming 4-line verse to lock concepts into long-term memory. **Listen** with the built-in Text-to-Speech. |
| **❓ Interactive Quiz** | 3 multiple-choice questions with instant feedback. Active recall, not passive reading. |
| **🔍 Focus Mode (Infinite Drill-down)** | Click *any* word in the Analogy or Rap. The entire page regenerates to explain just *that* concept. Never get stuck again. |

---

## 🏗️ Architecture & Tech Stack

![Architecture Diagram](https://via.placeholder.com/800x300?text=Scan+%3E+Gemini+Vision+%3E+Groq+LLM+%3E+Mermaid+%2B+Quiz)

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML, CSS (Glassmorphism), JavaScript | User interface, rendering Mermaid charts, Web Speech API for TTS. |
| **Backend** | Node.js + Express.js | API routing, security (hiding API keys), serving static files. |
| **Vision AI** | Google Gemini 1.5 Flash | Extracts text structure, main topics, and key terms from uploaded images. |
| **Text Generation** | Groq (Mixtral-8x7b-32768) | Generates structured JSON (Mindmap code, Analogy, Rap, Quiz) with ultra-low latency. |
| **Visualization** | Mermaid.js | Renders dynamic flowcharts from the generated code. |

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the project on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
