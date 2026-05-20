# BoardIQ — AI Whiteboard Intelligence

> Turn messy whiteboards into structured intelligence.

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn main:app --reload
```

## Deployment

- **Frontend**: Deploy to Vercel (connect GitHub repo, set `NEXT_PUBLIC_API_URL`)
- **Backend**: Deploy to Railway (connect GitHub repo, set env vars)

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend (.env)
```
ANTHROPIC_API_KEY=your_key
GOOGLE_VISION_API_KEY=your_key (optional)
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```
