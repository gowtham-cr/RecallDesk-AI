# RecallDesk AI 🧠⚡

> **A memory-powered customer support agent built with React + Vite, Node.js + Express, Google Gemini, and Vectorize Hindsight.**

RecallDesk AI solves one of the biggest frustrations in customer service: **context loss**. Traditional support agents and chatbots treat every conversation as a blank slate, forcing customers to repeat their device specs, error codes, and troubleshooting steps they've already tried.

With **Vectorize Hindsight**, RecallDesk AI maintains persistent, isolated memory banks for every customer. When a customer returns—even in a completely new session—the agent instantly recalls past issues, known hardware, and failed troubleshooting steps, guaranteeing it never suggests a fix that already failed.

---

## Key Features

- **Isolated Customer Memory Banks**: Each customer's context and observations are strictly isolated in Hindsight memory banks (`customer-<id>`).
- **Grounded AI Generation**: Powered by Google Gemini (`@google/genai`) using `gemini-3.5-flash-lite`, guided by strict operating principles to prevent hallucination, fake refund claims, or repeated failed steps.
- **Live Memory Inspector**: Real-time right-hand dashboard sidebar displaying actual retrieved Hindsight memories, world facts, semantic relevance scores, and extracted entity graphs (`Dell`, `Windows 11`, `Customer`).
- **Session Continuity**: Starting a "New Session" clears the active chat view for clarity while deliberately preserving the customer identity, ensuring long-term memory retrieval across visits.
- **Native Embedded Database**: Zero Docker and zero virtualization overhead; utilizes lightweight native Python embedded PostgreSQL (`pg0`).
- **Modern Responsive Dashboard**: Clean SaaS UI built with React 18, Vite, and Lucide icons with real-time service health monitoring for Backend, Gemini, and Hindsight.

---

## System Architecture

```
                          ┌───────────────────────────┐
                          │    React + Vite Client    │
                          │   (http://localhost:3000) │
                          └─────────────┬─────────────┘
                                        │ /api/chat
                                        ▼
                          ┌───────────────────────────┐
                          │    Express 5 Backend      │
                          │   (http://localhost:5000) │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
  ┌─────────────────────────────┐               ┌─────────────────────────────┐
  │      Google Gemini AI       │               │ Vectorize Hindsight Engine  │
  │   (@google/genai SDK)       │               │    (http://localhost:8888)  │
  │ Model: gemini-3.5-flash-lite│               │ Embedded pg0 + Google Embed │
  └─────────────────────────────┘               └─────────────────────────────┘
```

---

## Tech Stack

- **Frontend**: React 18, Vite 6, Lucide React
- **Backend**: Node.js, Express 5 (CommonJS)
- **Persistent Memory Engine**: Vectorize Hindsight (`@vectorize-io/hindsight-client` 1.2.0, `hindsight-api` 1.2.0)
- **AI / LLM Provider**: Google Gemini (`@google/genai` 3.0.0)
- **Embeddings**: Google Embeddings (`gemini-embedding-001`, 768 dimensions)
- **Database**: Embedded PostgreSQL (`pg0-embedded`)

---

## 🎬 Live Demo & Evaluation Walkthrough

Follow this step-by-step scenario to evaluate RecallDesk AI's persistent memory in action:

### Step 1: Session 1 — Initial Problem Report
1. Select customer **`Alex Rivera (demo_customer_01)`**.
2. Send:
   > *"Customer uses a Dell Windows 11 laptop. The laptop restarts unexpectedly, and a driver update was attempted but failed."*
3. Observe the **Live Memory Inspector** on the right sidebar update with:
   - Entity Graph: `Dell`, `Windows 11`, `Customer`
   - Stored Facts: Hardware specs, unexpected restart observation, failed driver update record.

### Step 2: Clear Session (Simulating Return Later)
1. Click the **`+ New Session`** button in the left sidebar.
2. The active conversation screen clears completely.
3. Note that the customer identity (`demo_customer_01`) remains active.

### Step 3: Session 2 — Persistent Memory Verification
1. Send the follow-up message:
   > *"My laptop is restarting again."*
2. **Observe the AI Response**:
   - The agent greets the user and immediately acknowledges their **Dell Windows 11 laptop**.
   - The agent remembers that **driver updates already failed** and explicitly states it will bypass driver troubleshooting.
   - The agent provides the next logical diagnostic tier (e.g. checking **Windows Event Viewer / Minidump logs** for `Event ID 41`).
3. Click the **`⚡ Memories Recalled`** pill on the AI bubble to view the exact Hindsight facts injected into Gemini's context.

---

## Quickstart Guide

### 1. Clone & Setup Environment

```bash
git clone https://github.com/gowtham-cr/RecallDesk-AI.git
cd RecallDesk-AI
```

Create `backend/.env` from `.env.example`:
```bash
cp .env.example backend/.env
```
Add your **Google Gemini API Key** to `GEMINI_API_KEY` in `backend/.env`.

### 2. Install Dependencies

**Backend & Python Hindsight:**
```bash
cd backend
npm install
# Setup Python 3.12 virtual environment & install hindsight-api
python -m venv .venv
.\.venv\Scripts\pip install "hindsight-api==1.2.0" "pg0-embedded==0.16.1"
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Run the Services

**Terminal 1 — Local Hindsight API Server:**
```powershell
cd backend
.\.venv\Scripts\hindsight-api.exe --host 127.0.0.1 --port 8888
```

**Terminal 2 — Express Backend:**
```powershell
cd backend
npm start
```

**Terminal 3 — React + Vite UI:**
```powershell
cd frontend
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## Verification & Testing

RecallDesk AI includes an automated end-to-end integration test suite verifying backend health, Gemini AI connectivity, Hindsight engine status, and multi-customer bank isolation:

```bash
node scripts/test-e2e.js
```

---

## License

MIT License. Built for modern, context-aware AI support engineering.
