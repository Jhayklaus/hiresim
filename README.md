## HireSim – AI-Powered Technical Interview Simulator

HireSim is a Next.js app that simulates a live technical interview based on your actual CV and target role. It:

- Parses your uploaded CV (PDF) into text
- Uses a DeepSeek-powered AI interviewer to ask context-aware questions
- Lets you interact over voice using browser speech recognition
- Generates structured feedback, scoring, and a downloadable PDF report at the end of the session

The main flow:

1. Upload your CV and enter a target job role on the home page.
2. Join a live, voice-first AI interview tailored to your background.
3. Receive detailed feedback with strengths, improvement areas, and a learning roadmap on the feedback page.

---

## Tech Stack

- **Framework**: Next.js App Router
- **Language**: TypeScript, React
- **Styling**: Tailwind-style utility classes
- **State Management**: Zustand
- **AI Backend**: DeepSeek (via OpenAI-compatible client)
- **Voice**:
  - Speech recognition in the browser
  - Text-to-speech via a server-side TTS API
- **PDF**:
  - CV parsing from PDF
  - Feedback report export to PDF on the client

---

## Prerequisites

To run this project on another machine you need:

- Node.js 18 or newer
- npm (recommended, but yarn/pnpm/bun also work)
- A modern browser (Google Chrome recommended for speech recognition)
- API keys for the external services listed below

---

## Environment Variables

Create a `.env.local` file in the project root and add the following variables as needed:

- `NEXT_DEEPSEEK_API_KEY` or `DEEPSEEK_API_KEY`  
  Used by the server actions in [deepseek.ts] to call the DeepSeek chat API for:
  - Generating interview questions and follow‑ups
  - Producing structured feedback JSON after each interview

- `VOICERSS_API_KEY`  
  Used by the TTS route in [route.ts] to generate audio responses from text.

- `GEMINI_API_KEY` or `NEXT_GEMINI_API_KEY` (optional)  
  Used by [auth.ts] in case Gemini-based features are enabled.

Do **not** commit `.env.local` to version control.

---

## Local Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>.git
   cd hiresim
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   - Create `.env.local` in the project root.
   - Add the required API keys described in the _Environment Variables_ section.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser.

---

## How to Use

1. Open the home page (`/`):
   - Enter the target job role (e.g., “Senior Frontend Engineer”).
   - Upload your CV as a PDF.
   - Optionally paste the job description for extra context.

2. Click **Start Interview**:
   - You will be redirected to `/interview`.
   - Grant microphone access when prompted.
   - The AI interviewer will:
     - Greet you and start with an introduction
     - Ask questions based on your CV and role
     - Adapt based on your spoken answers

3. Speak naturally:
   - Your speech is transcribed in the browser.
   - When you stop speaking, the transcript is sent to the server.
   - The AI generates the next question and the response is read aloud via TTS.

4. End the interview:
   - Click **End Interview** any time.
   - You’ll be redirected to `/feedback`.

5. Review feedback:
   - See your overall score and category (e.g., “Strong potential”).
   - Review metric breakdowns (clarity, technical accuracy, confidence, relevance, depth).
   - Browse strengths, improvement areas, and a learning roadmap.
   - Download a PDF performance report for the session.

If your browser does not support speech recognition (non‑Chrome browsers, private modes, or some devices), the app will show a fallback screen asking you to use Google Chrome.

---

## Production Build

To create an optimized production build and run it locally:

```bash
npm run build
npm start
```

This will start the app in production mode on the default port (3000) unless configured otherwise.

---

## Linting

This project is configured with ESLint. To check for lint issues:

```bash
npm run lint
```

Fix any reported issues before deploying to ensure consistent code quality.
