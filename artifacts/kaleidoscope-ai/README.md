# Kaleidoscope AI

Kaleidoscope AI turns a topic into four memorable learning artifacts: a Mermaid visual mindmap, a two-sentence everyday analogy, a four-line memory rap, and a three-question active-recall quiz.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your Groq key to the server environment:

   ```env
   GROQ_API_KEY=your_key_here
   ```

   Keep this value on the server. It is never sent to the browser.

   In Replit, add `GROQ_API_KEY` as a Secret. For local development, you can
   place it in a local `.env` file that is not committed.

3. Start the server:

   ```bash
   npm start
   ```

The app runs on `http://localhost:3000` when started directly. In the Replit preview, the managed workflow supplies the port automatically.

## API

`POST /api/generate`

```json
{ "topic": "Photosynthesis" }
```

The response contains `mermaid`, `analogy`, `rap`, and `questions`.