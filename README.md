# AI Model Serving Project

FastAPI + Hugging Face + React (Vite) based end-to-end AI application.

## Project Highlights

- Multiple Hugging Face models served from one FastAPI backend
- Separate API endpoints for separate AI tasks
- React frontend built using Vite
- Styling done with raw CSS
- Frontend connected to backend APIs
- Deployment-ready setup for backend and frontend

## Architecture

React Frontend (Vite) -> FastAPI Backend -> Hugging Face Models

## Folder Structure

```text
ai-model-serving-project/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── App.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md
```

## AI Endpoints

- `POST /api/sentiment`
- `POST /api/summarize`
- `POST /api/generate`
- `POST /api/qa`
- `GET /api/health`

## 1) Run Backend (FastAPI)

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Backend runs on: `http://127.0.0.1:8000`

## 2) Run Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://127.0.0.1:5173`

## API Payload Examples

### Sentiment

```json
{
  "text": "I love using FastAPI with Hugging Face!"
}
```

### Summarization

```json
{
  "text": "Long paragraph here...",
  "max_length": 130,
  "min_length": 30
}
```

### Text Generation

```json
{
  "prompt": "Artificial intelligence in education can",
  "max_new_tokens": 90
}
```

### Question Answering

```json
{
  "context": "The Eiffel Tower is in Paris.",
  "question": "Where is Eiffel Tower?"
}
```

## Deployment

## Backend Deployment (Render or Railway)

Option A: Docker deploy using `backend/Dockerfile`.

Option B: Native deploy command:

```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port $PORT
```

## Frontend Deployment (Vercel or Netlify)

Build command:

```bash
npm run build
```

Publish directory:

```text
dist
```

If backend URL is different in production, set Vite proxy replacement using environment variables and call full backend URL in frontend.

## Live Project Submission

After deployment, add your live links below:

- Frontend Live URL: `ADD_FRONTEND_URL_HERE`
- Backend Live URL: `ADD_BACKEND_URL_HERE`

## Notes

- First API request may be slow because models are downloaded and loaded.
- Summarization models are heavy; decent internet and RAM are recommended.
