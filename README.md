# AI Chat Portal

A full-stack chat application with multi-AI provider support, conversation management, and intelligent analysis.

## 🚀 Live Links

- **Frontend**: [Chat Summarizer App](https://chat-summarizer-frontend-zeta.vercel.app)
- **Backend**: [API Server](https://chat-summarizer.onrender.com)


## 🚀 CI

![CI](https://github.com/amkr6207/chat-summarizer/actions/workflows/ci.yml/badge.svg)


## Features

- Multi-AI Provider Support (OpenAI, Claude, Gemini, LM Studio)
- Conversation storage and search
- AI-powered summaries and insights
- Natural language queries on chat history
- Modern UI with dark mode

## Tech Stack

**Backend**: Node.js, Express, MongoDB, JWT  
**Frontend**: React, Vite, Tailwind CSS  
**AI**: OpenAI, Anthropic, Google Gemini

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB

### Installation

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and AI API keys

# Frontend
cd frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:5000/api
```

### 🐳 Run with Docker (Recommended)

Run the entire app (Frontend + Backend + DB) with a single command:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000


### Run Locally (Manual)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173`

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-key        # Optional
ANTHROPIC_API_KEY=your-key     # Optional
GOOGLE_API_KEY=your-key        # Optional
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Backend (Render)
1. Create Web Service
2. Root Directory: `backend`
3. Build: `npm install`
4. Start: `npm start`
5. Add environment variables
6. Copy deployed URL

### Frontend (Vercel)
1. Import repository
2. Root Directory: `frontend`
3. Add `VITE_API_URL` with your Render URL + `/api`
4. Deploy

### Final Step
Add `FRONTEND_URL` (your Vercel URL) to Render backend environment variables.


