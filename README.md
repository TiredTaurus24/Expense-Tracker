# Expense Tracker - Checkpoint 1: Auth System

A mobile-first expense sharing PWA with AI-powered expense parsing.

## Project Structure

```
.
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── middleware/ # Auth middleware
│   │   │   └── v1/         # API v1 routes
│   │   ├── core/           # Core utilities (database, security)
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic services
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── stores/        # Zustand stores
│   │   ├── styles/        # CSS styles
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── Dockerfile.dev
│
├── docs/                   # Architecture documentation
├── docker-compose.yml      # Docker Compose configuration
└── README.md
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL 15+ (or use Docker)

### Option 1: Docker Compose (Recommended)

1. Clone the repository and navigate to the project directory.

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials.

5. Start PostgreSQL (using Docker):
```bash
docker run -d --name expense_tracker_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=expense_tracker \
  -p 5432:5432 \
  postgres:15-alpine
```

6. Run the backend:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
npm run dev
```

4. Access the frontend at http://localhost:5173

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| POST | `/api/v1/auth/refresh` | Refresh access token |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user |
| PATCH | `/api/v1/users/me` | Update user profile |
| DELETE | `/api/v1/users/me` | Delete user account |

## Features Implemented

### Checkpoint 1: Auth System ✅

- [x] User registration with email/password
- [x] User login with JWT tokens
- [x] Access token (15 min expiry)
- [x] Refresh token (7 days expiry)
- [x] Token refresh flow
- [x] User logout (token revocation)
- [x] Protected routes
- [x] Mobile-first login/register UI
- [x] Password validation (min 8 chars, letter + number)

## Tech Stack

### Backend
- FastAPI (Python 3.11)
- SQLAlchemy (async)
- PostgreSQL
- JWT authentication
- Pydantic validation

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- React Query
- React Router

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/expense_tracker

# JWT
JWT_SECRET_KEY=your-super-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Development

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

## Next Steps

The following checkpoints will be implemented:

- [ ] Checkpoint 2: User Module
- [ ] Checkpoint 3: Home Management Module
- [ ] Checkpoint 4: Membership & Approval Module
- [ ] Checkpoint 5: Expense Core Module
- [ ] Checkpoint 6: Expense Split Engine
- [ ] Checkpoint 7: Receipt Processing Module
- [ ] Checkpoint 8: Voice Processing Module
- [ ] Checkpoint 9: LLM Parsing Module
- [ ] Checkpoint 10: Math Engine Module
- [ ] Checkpoint 11: Dashboard & Analytics Module
- [ ] Checkpoint 12: Notification Module

## License

MIT License
