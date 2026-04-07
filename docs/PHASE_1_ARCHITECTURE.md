# PHASE 1: System Architecture Design

## Expense Sharing PWA - Production-Grade Architecture

---

## 1. High-Level System Design

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER (Mobile-First PWA)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   React + TS    │  │   Service       │  │   PWA Cache     │                  │
│  │   Vite Build    │  │   Worker        │  │   IndexedDB     │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY / LOAD BALANCER                         │
│                              (Nginx / Traefik)                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER (FastAPI)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Auth      │  │   User      │  │   Home      │  │   Expense   │            │
│  │   Module    │  │   Module    │  │   Module    │  │   Module    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Receipt   │  │   Voice     │  │   LLM       │  │   Math      │            │
│  │   Module    │  │   Module    │  │   Module    │  │   Engine    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│      PostgreSQL         │ │     Redis       │ │    S3-Compatible        │
│      (Primary DB)       │ │    (Cache)      │ │    (Receipt Storage)    │
└─────────────────────────┘ └─────────────────┘ └─────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AI/ML PIPELINE                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Vision Model  │  │   Speech-to-    │  │   LLM Service   │                  │
│  │   (Receipt)     │  │   Text          │  │   (Parsing)     │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Textual Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + TypeScript)                   │
├──────────────────────────────────────────────────────────────────────────┤
│  Components:                                                              │
│  ├── Auth/                                                               │
│  │   ├── LoginForm                                                       │
│  │   ├── RegisterForm                                                    │
│  │   └── ForgotPassword                                                  │
│  ├── Home/                                                               │
│  │   ├── HomeList                                                        │
│  │   ├── HomeDetails                                                     │
│  │   ├── CreateHome                                                      │
│  │   └── JoinHome                                                        │
│  ├── Expense/                                                            │
│  │   ├── ExpenseList                                                     │
│  │   ├── ExpenseForm                                                     │
│  │   ├── ExpenseDetail                                                   │
│  │   ├── QuickAdd                                                        │
│  │   └── SplitCalculator                                                 │
│  ├── Receipt/                                                            │
│  │   ├── CameraCapture                                                   │
│  │   ├── ReceiptPreview                                                  │
│  │   └── ParsedResult                                                    │
│  ├── Voice/                                                              │
│  │   ├── VoiceRecorder                                                   │
│  │   └── TranscriptionPreview                                            │
│  ├── Dashboard/                                                          │
│  │   ├── SummaryCards                                                   │
│  │   ├── BalanceOverview                                                 │
│  │   └── ActivityFeed                                                    │
│  └── Common/                                                             │
│      ├── BottomNav                                                       │
│      ├── Header                                                          │
│      ├── Modal                                                           │
│      ├── Button                                                          │
│      └── Input                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│  State Management: Zustand / React Query                                 │
│  PWA: Service Worker + IndexedDB (offline support)                       │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTP/WebSocket
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI)                               │
├──────────────────────────────────────────────────────────────────────────┤
│  Routes (API Layer):                                                      │
│  ├── /api/v1/auth/*                                                      │
│  ├── /api/v1/users/*                                                     │
│  ├── /api/v1/homes/*                                                     │
│  ├── /api/v1/expenses/*                                                  │
│  ├── /api/v1/receipts/*                                                  │
│  ├── /api/v1/voice/*                                                     │
│  └── /api/v1/ai/*                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│  Services (Business Logic):                                               │
│  ├── AuthService                                                         │
│  ├── UserService                                                         │
│  ├── HomeService                                                         │
│  ├── MembershipService                                                   │
│  ├── ExpenseService                                                      │
│  ├── SplitEngine                                                         │
│  ├── ReceiptService                                                      │
│  ├── VoiceService                                                        │
│  ├── LLMParserService                                                    │
│  └── MathEngine                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  Models (SQLAlchemy):                                                     │
│  ├── User, Home, HomeMembership, HomeProfile                             │
│  ├── Expense, ExpenseItem, ExpenseSplit                                  │
│  └── Receipt                                                             │
├──────────────────────────────────────────────────────────────────────────┤
│  External Integrations:                                                   │
│  ├── OpenAI / Anthropic API (LLM)                                        │
│  ├── Google Cloud Vision / AWS Textract (Receipt)                        │
│  ├── OpenAI Whisper / Google STT (Voice)                                 │
│  └── S3-Compatible Storage (MinIO / AWS S3)                              │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Architecture (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Routes (FastAPI Routers)                                        │   │
│  │  - Request validation (Pydantic schemas)                        │   │
│  │  - Response serialization                                        │   │
│  │  - Authentication middleware                                     │   │
│  │  - Error handling                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Services (Business Logic)                                       │   │
│  │  - Use case orchestration                                        │   │
│  │  - Domain rules enforcement                                      │   │
│  │  - Transaction management                                        │   │
│  │  - Cross-entity operations                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Schemas (Pydantic Models)                                       │   │
│  │  - Input validation                                              │   │
│  │  - Output serialization                                          │   │
│  │  - API contracts                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DOMAIN LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Domain Models (Entities)                                        │   │
│  │  - User, Home, Expense, Receipt                                  │   │
│  │  - Business rules embedded                                       │   │
│  │  - Domain events                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Repository Interfaces (Abstract)                                │   │
│  │  - Data access contracts                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         INFRASTRUCTURE LAYER                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Repository Implementations                                       │   │
│  │  - SQLAlchemy ORM models                                         │   │
│  │  - Database queries                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  External Services                                               │   │
│  │  - AI/ML API clients                                            │   │
│  │  - Storage clients (S3)                                         │   │
│  │  - Cache clients (Redis)                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry
│   ├── config.py                  # Settings (env vars)
│   ├── dependencies.py            # DI container
│   │
│   ├── api/                       # PRESENTATION LAYER
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py          # Aggregated router
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── homes.py
│   │   │   ├── expenses.py
│   │   │   ├── receipts.py
│   │   │   ├── voice.py
│   │   │   └── ai.py
│   │   └── middleware/
│   │       ├── auth.py
│   │       └── error_handler.py
│   │
│   ├── services/                  # APPLICATION LAYER
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── home_service.py
│   │   ├── membership_service.py
│   │   ├── expense_service.py
│   │   ├── split_engine.py
│   │   ├── receipt_service.py
│   │   ├── voice_service.py
│   │   ├── llm_parser_service.py
│   │   └── math_engine.py
│   │
│   ├── schemas/                   # PYDANTIC SCHEMAS
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── home.py
│   │   ├── expense.py
│   │   ├── receipt.py
│   │   ├── voice.py
│   │   └── ai.py
│   │
│   ├── models/                    # DOMAIN LAYER (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── base.py                # Base model class
│   │   ├── user.py
│   │   ├── home.py
│   │   ├── membership.py
│   │   ├── expense.py
│   │   └── receipt.py
│   │
│   ├── repositories/              # DATA ACCESS LAYER
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user_repo.py
│   │   ├── home_repo.py
│   │   ├── expense_repo.py
│   │   └── receipt_repo.py
│   │
│   ├── core/                      # CORE UTILITIES
│   │   ├── __init__.py
│   │   ├── security.py            # JWT, password hashing
│   │   ├── database.py            # Async DB session
│   │   ├── cache.py               # Redis client
│   │   └── storage.py             # S3 client
│   │
│   └── utils/                     # HELPERS
│       ├── __init__.py
│       ├── validators.py
│       └── helpers.py
│
├── alembic/                       # DATABASE MIGRATIONS
│   ├── versions/
│   └── env.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_homes.py
│   └── test_expenses.py
│
├── .env.example
├── requirements.txt
├── pyproject.toml
└── Dockerfile
```

---

## 4. Frontend Architecture (Mobile-First PWA)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PWA SHELL                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Service Worker                                                  │   │
│  │  - Offline caching strategy                                      │   │
│  │  - Background sync                                               │   │
│  │  - Push notifications                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                         APP SHELL (React)                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Root Layout                                                     │   │
│  │  ├── Header (contextual)                                         │   │
│  │  ├── Main Content Area                                           │   │
│  │  └── Bottom Navigation (mobile)                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                         FEATURE MODULES                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   Auth      │ │   Home      │ │   Expense   │ │   Receipt   │      │
│  │   Module    │ │   Module    │ │   Module    │ │   Module    │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   Voice     │ │   Dashboard │ │   Settings  │ │   Profile   │      │
│  │   Module    │ │   Module    │ │   Module    │ │   Module    │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Zustand (Global State)                                          │   │
│  │  - Auth store                                                    │   │
│  │  - Home store                                                    │   │
│  │  - UI store                                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  React Query (Server State)                                      │   │
│  │  - API data caching                                              │   │
│  │  - Optimistic updates                                            │   │
│  │  - Background refetching                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  IndexedDB (Offline Storage)                                     │   │
│  │  - Expense drafts                                                │   │
│  │  - Cached data                                                   │   │
│  │  - Pending sync queue                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Axios / Fetch wrapper                                           │   │
│  │  - Request interceptors (auth headers)                           │   │
│  │  - Response interceptors (error handling)                        │   │
│  │  - Retry logic                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Frontend Directory Structure

```
frontend/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── icons/                     # App icons
│   └── favicon.ico
│
├── src/
│   ├── main.tsx                   # Entry point
│   ├── App.tsx                    # Root component
│   ├── vite-env.d.ts
│   │
│   ├── components/                # REUSABLE COMPONENTS
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── BottomNav.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── PageLayout.tsx
│   │   │   └── MobileShell.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── HomeCard.tsx
│   │   │   ├── HomeList.tsx
│   │   │   ├── CreateHomeForm.tsx
│   │   │   ├── JoinHomeForm.tsx
│   │   │   └── MemberList.tsx
│   │   │
│   │   ├── expense/
│   │   │   ├── ExpenseCard.tsx
│   │   │   ├── ExpenseList.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── QuickAddExpense.tsx
│   │   │   ├── SplitForm.tsx
│   │   │   └── ExpenseDetail.tsx
│   │   │
│   │   ├── receipt/
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── ReceiptPreview.tsx
│   │   │   └── ParsedReceipt.tsx
│   │   │
│   │   ├── voice/
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── TranscriptionPreview.tsx
│   │   │
│   │   └── dashboard/
│   │       ├── SummaryCard.tsx
│   │       ├── BalanceOverview.tsx
│   │       └── ActivityFeed.tsx
│   │
│   ├── pages/                     # PAGE COMPONENTS
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── HomePage.tsx
│   │   │   ├── HomeDetailPage.tsx
│   │   │   ├── CreateHomePage.tsx
│   │   │   └── JoinHomePage.tsx
│   │   │
│   │   ├── expense/
│   │   │   ├── ExpensesPage.tsx
│   │   │   ├── CreateExpensePage.tsx
│   │   │   └── ExpenseDetailPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   │
│   │   └── profile/
│   │       └── ProfilePage.tsx
│   │
│   ├── hooks/                     # CUSTOM HOOKS
│   │   ├── useAuth.ts
│   │   ├── useHome.ts
│   │   ├── useExpenses.ts
│   │   ├── useReceipt.ts
│   │   ├── useVoice.ts
│   │   ├── useOffline.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── stores/                    # ZUSTAND STORES
│   │   ├── authStore.ts
│   │   ├── homeStore.ts
│   │   ├── uiStore.ts
│   │   └── expenseStore.ts
│   │
│   ├── services/                  # API SERVICES
│   │   ├── api.ts                 # Axios instance
│   │   ├── authService.ts
│   │   ├── homeService.ts
│   │   ├── expenseService.ts
│   │   ├── receiptService.ts
│   │   └── voiceService.ts
│   │
│   ├── types/                     # TYPESCRIPT TYPES
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── home.types.ts
│   │   ├── expense.types.ts
│   │   ├── receipt.types.ts
│   │   └── api.types.ts
│   │
│   ├── utils/                     # UTILITIES
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── styles/                    # STYLES
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── animations.css
│   │
│   └── db/                        # INDEXEDDB (OFFLINE)
│       ├── index.ts
│       └── schemas.ts
│
├── sw/                            # SERVICE WORKER
│   └── service-worker.ts
│
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── Dockerfile
```

---

## 5. Database Schema (Detailed Relational Design)

### Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  email           VARCHAR(255) UNIQUE NOT NULL                            │
│  password_hash   VARCHAR(255) NOT NULL                                   │
│  full_name       VARCHAR(255)                                            │
│  phone           VARCHAR(20)                                             │
│  avatar_url      VARCHAR(500)                                            │
│  is_verified     BOOLEAN DEFAULT FALSE                                   │
│  is_active       BOOLEAN DEFAULT TRUE                                    │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
│  updated_at      TIMESTAMP DEFAULT NOW()                                 │
│  last_login_at   TIMESTAMP                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ 1:N
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         HOME_MEMBERSHIPS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  user_id         UUID FK → users.id                                      │
│  home_id         UUID FK → homes.id                                      │
│  role            ENUM('owner', 'admin', 'member')                        │
│  status          ENUM('pending', 'approved', 'rejected')                 │
│  joined_at       TIMESTAMP                                               │
│  invited_by      UUID FK → users.id                                      │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
│  UNIQUE(user_id, home_id)                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ N:1
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              HOMES                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  name            VARCHAR(255) NOT NULL                                   │
│  description     TEXT                                                    │
│  invite_code     VARCHAR(20) UNIQUE NOT NULL                             │
│  currency        VARCHAR(3) DEFAULT 'INR'                                │
│  avatar_url      VARCHAR(500)                                            │
│  created_by      UUID FK → users.id                                      │
│  is_active       BOOLEAN DEFAULT TRUE                                    │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
│  updated_at      TIMESTAMP DEFAULT NOW()                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ 1:N
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         HOME_PROFILES                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  user_id         UUID FK → users.id                                      │
│  home_id         UUID FK → homes.id                                      │
│  display_name    VARCHAR(255)                                            │
│  notification_pref JSONB                                                 │
│  settings        JSONB                                                   │
│  balance         DECIMAL(12,2) DEFAULT 0                                 │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
│  updated_at      TIMESTAMP DEFAULT NOW()                                 │
│  UNIQUE(user_id, home_id)                                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                             EXPENSES                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  home_id         UUID FK → homes.id                                      │
│  paid_by         UUID FK → users.id                                      │
│  title           VARCHAR(255) NOT NULL                                   │
│  description     TEXT                                                    │
│  total_amount    DECIMAL(12,2) NOT NULL                                  │
│  currency        VARCHAR(3) DEFAULT 'INR'                                │
│  expense_type    ENUM('single', 'itemized')                              │
│  split_type      ENUM('equal', 'percentage', 'exact', 'ratio')           │
│  status          ENUM('draft', 'pending', 'settled')                     │
│  expense_date    DATE                                                    │
│  receipt_id      UUID FK → receipts.id                                   │
│  created_by      UUID FK → users.id                                      │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
│  updated_at      TIMESTAMP DEFAULT NOW()                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ 1:N
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXPENSE_ITEMS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  expense_id      UUID FK → expenses.id                                   │
│  name            VARCHAR(255) NOT NULL                                   │
│  amount          DECIMAL(12,2) NOT NULL                                  │
│  quantity        INT DEFAULT 1                                           │
│  category        VARCHAR(100)                                            │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          EXPENSE_SPLITS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  expense_id      UUID FK → expenses.id                                   │
│  expense_item_id UUID FK → expense_items.id (nullable)                   │
│  user_id         UUID FK → users.id                                      │
│  amount          DECIMAL(12,2) NOT NULL                                  │
│  percentage      DECIMAL(5,2)                                            │
│  ratio_value     INT                                                     │
│  is_settled      BOOLEAN DEFAULT FALSE                                   │
│  settled_at      TIMESTAMP                                               │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            RECEIPTS                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  home_id         UUID FK → homes.id                                      │
│  uploaded_by     UUID FK → users.id                                      │
│  file_url        VARCHAR(500) NOT NULL                                   │
│  file_key        VARCHAR(255) NOT NULL                                   │
│  file_size       INT                                                     │
│  mime_type       VARCHAR(100)                                            │
│  parsed_data     JSONB                                                   │
│  parsing_status  ENUM('pending', 'processing', 'completed', 'failed')    │
│  raw_text        TEXT                                                    │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           SETTLEMENTS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  home_id         UUID FK → homes.id                                      │
│  from_user_id    UUID FK → users.id                                      │
│  to_user_id      UUID FK → users.id                                      │
│  amount          DECIMAL(12,2) NOT NULL                                  │
│  currency        VARCHAR(3) DEFAULT 'INR'                                │
│  status          ENUM('pending', 'completed', 'cancelled')               │
│  settled_at      TIMESTAMP                                               │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          NOTIFICATIONS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  user_id         UUID FK → users.id                                      │
│  type            ENUM('expense', 'settlement', 'invite', 'reminder')     │
│  title           VARCHAR(255) NOT NULL                                   │
│  message         TEXT                                                    │
│  data            JSONB                                                   │
│  is_read         BOOLEAN DEFAULT FALSE                                   │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         REFRESH_TOKENS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                                        │
│  user_id         UUID FK → users.id                                      │
│  token_hash      VARCHAR(255) NOT NULL                                   │
│  expires_at      TIMESTAMP NOT NULL                                      │
│  revoked         BOOLEAN DEFAULT FALSE                                   │
│  created_at      TIMESTAMP DEFAULT NOW()                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Homes
CREATE INDEX idx_homes_invite_code ON homes(invite_code);
CREATE INDEX idx_homes_created_by ON homes(created_by);

-- Memberships
CREATE INDEX idx_memberships_user_id ON home_memberships(user_id);
CREATE INDEX idx_memberships_home_id ON home_memberships(home_id);
CREATE INDEX idx_memberships_status ON home_memberships(status);

-- Expenses
CREATE INDEX idx_expenses_home_id ON expenses(home_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_status ON expenses(status);

-- Expense Splits
CREATE INDEX idx_splits_user_id ON expense_splits(user_id);
CREATE INDEX idx_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX idx_splits_settled ON expense_splits(is_settled);

-- Receipts
CREATE INDEX idx_receipts_home_id ON receipts(home_id);
CREATE INDEX idx_receipts_status ON receipts(parsing_status);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

---

## 6. AI Pipeline Architecture

### 6.1 Receipt Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     RECEIPT PROCESSING PIPELINE                          │
└─────────────────────────────────────────────────────────────────────────┘

Input: Receipt Image (JPEG/PNG)
        │
        ▼
┌─────────────────────┐
│  Image Preprocessing│
│  - Resize/Compress  │
│  - Enhance contrast │
│  - Deskew           │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Vision Model       │
│  (GPT-4 Vision /    │
│   Google Cloud      │
│   Vision API)       │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Raw Text/JSON      │
│  Extraction         │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  LLM Structuring    │
│  - Parse items      │
│  - Extract amounts  │
│  - Identify dates   │
│  - Detect merchant  │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Validation Layer   │
│  - Amount checks    │
│  - Date parsing     │
│  - Currency detect  │
└─────────────────────┘
        │
        ▼
Output: Structured JSON
```

### Receipt Output Schema

```json
{
  "merchant": {
    "name": "string",
    "address": "string",
    "phone": "string"
  },
  "transaction": {
    "date": "YYYY-MM-DD",
    "time": "HH:MM:SS",
    "receipt_number": "string"
  },
  "items": [
    {
      "name": "string",
      "quantity": 1,
      "unit_price": 0.00,
      "total_price": 0.00,
      "category": "string"
    }
  ],
  "totals": {
    "subtotal": 0.00,
    "tax": 0.00,
    "discount": 0.00,
    "total": 0.00
  },
  "payment": {
    "method": "string",
    "amount_paid": 0.00,
    "change": 0.00
  },
  "currency": "INR",
  "confidence_score": 0.95
}
```

### 6.2 Voice Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      VOICE PROCESSING PIPELINE                           │
└─────────────────────────────────────────────────────────────────────────┘

Input: Audio (WebM/WAV/MP3)
        │
        ▼
┌─────────────────────┐
│  Audio Preprocessing│
│  - Format convert   │
│  - Noise reduction  │
│  - Normalize volume │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Speech-to-Text     │
│  (OpenAI Whisper /  │
│   Google STT)       │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Transcribed Text   │
│  "1200 rupees for   │
│   dinner split      │
│   between 3 people" │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  LLM Parser         │
│  - Intent detection │
│  - Entity extraction│
│  - Context resolve  │
└─────────────────────┘
        │
        ▼
Output: Structured JSON
```

### 6.3 Text/LLM Parsing Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      TEXT PARSING PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────┘

Input: Natural Language Text
        │
        ▼
┌─────────────────────┐
│  Intent Classifier  │
│  - expense_creation │
│  - split_operation  │
│  - math_operation   │
│  - summary_request  │
│  - clarification    │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Entity Extractor   │
│  - Amounts          │
│  - Users            │
│  - Items            │
│  - Dates            │
│  - Split types      │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Context Resolver   │
│  - Current home     │
│  - Available users  │
│  - Recent expenses  │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Validation &       │
│  Clarification      │
│  - Missing info?    │
│  - Ambiguous?       │
└─────────────────────┘
        │
        ▼
Output: Structured JSON
```

### LLM Prompt Template

```
SYSTEM PROMPT:
You are an expense parsing assistant for a mobile expense sharing app.
Parse user input into structured JSON format for expense creation.

CONTEXT:
- Current Home: {home_name}
- Available Members: {member_list}
- Currency: {currency}

RULES:
1. NEVER hallucinate users not in the member list
2. If user mentions "split between X", assume equal split
3. If specific users mentioned, use exact split
4. If amounts seem wrong, ask for clarification
5. Always return valid JSON, no additional text

INPUT: {user_input}

OUTPUT FORMAT:
{
  "type": "expense_creation | split_operation | math_operation | summary_request | clarification",
  "data": {
    "title": "string",
    "total_amount": number,
    "currency": "INR",
    "items": [...],
    "split_metadata": {...},
    "detected_users": ["usernames"],
    "requires_clarification": boolean,
    "clarification_question": "string"
  }
}
```

---

## 7. Authentication & Authorization Flow

### 7.1 JWT-Based Authentication

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  API     │     │  Auth    │     │ Database │
│          │     │ Gateway  │     │ Service  │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ POST /auth/login               │                │
     │ {email, password}              │                │
     │───────────────>│                │                │
     │                │ validate()     │                │
     │                │───────────────>│                │
     │                │                │ find user      │
     │                │                │───────────────>│
     │                │                │<───────────────│
     │                │                │ verify hash    │
     │                │                │                │
     │                │                │ generate JWT   │
     │                │                │ + refresh      │
     │                │<───────────────│                │
     │ {access_token, refresh_token}   │                │
     │<───────────────│                │                │
     │                │                │                │
     │ API Request    │                │                │
     │ Authorization: Bearer <token>   │                │
     │───────────────>│                │                │
     │                │ verify JWT     │                │
     │                │ extract user_id│                │
     │                │                │                │
     │                │ process request                │
     │                │───────────────────────────────>│
     │                │<───────────────────────────────│
     │<───────────────│                │                │
     │                │                │                │
```

### 7.2 Token Structure

```json
// Access Token (15 min expiry)
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "exp": 1712345678,
  "iat": 1712345678,
  "type": "access"
}

// Refresh Token (7 days expiry)
{
  "sub": "user_uuid",
  "exp": 1712950478,
  "iat": 1712345678,
  "type": "refresh",
  "jti": "unique_token_id"
}
```

### 7.3 Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ROLE PERMISSIONS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OWNER                                                                   │
│  ├── All admin permissions                                               │
│  ├── Delete home                                                         │
│  ├── Transfer ownership                                                  │
│  └── Manage all expenses                                                 │
│                                                                          │
│  ADMIN                                                                   │
│  ├── All member permissions                                              │
│  ├── Approve/reject join requests                                        │
│  ├── Remove members                                                      │
│  ├── Edit home settings                                                  │
│  └── Regenerate invite code                                              │
│                                                                          │
│  MEMBER                                                                  │
│  ├── View home details                                                   │
│  ├── Create expenses                                                     │
│  ├── Edit own expenses                                                   │
│  ├── View all expenses                                                   │
│  ├── Settle expenses                                                     │
│  └── Upload receipts                                                     │
│                                                                          │
│  PENDING (Awaiting Approval)                                             │
│  └── No permissions until approved                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.4 Home Join Approval Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HOME JOIN APPROVAL FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

User                    System                  Admin
  │                       │                       │
  │ 1. Enter invite code  │                       │
  │──────────────────────>│                       │
  │                       │                       │
  │                       │ 2. Validate code      │
  │                       │    Create membership  │
  │                       │    status=pending     │
  │                       │                       │
  │                       │ 3. Notify admins      │
  │                       │──────────────────────>│
  │                       │                       │
  │                       │ 4. Admin reviews      │
  │                       │<──────────────────────│
  │                       │    Approve/Reject     │
  │                       │                       │
  │ 5. Notify user        │                       │
  │<──────────────────────│                       │
  │                       │                       │
  │ 6. If approved:       │                       │
  │    - Access granted   │                       │
  │    - Home profile     │                       │
  │      created          │                       │
  │                       │                       │
```

---

## 8. Real-Time Capabilities

### WebSocket Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      WEBSOCKET ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  WS      │     │  Redis   │
│          │     │  Server  │     │  Pub/Sub │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │ WS Connect     │                │
     │ /ws?token=xxx  │                │
     │───────────────>│                │
     │                │                │
     │                │ Subscribe to   │
     │                │ user channels  │
     │                │───────────────>│
     │                │                │
     │                │ On Event       │
     │                │<───────────────│
     │                │                │
     │ Push Update    │                │
     │<───────────────│                │
     │                │                │

EVENTS:
├── expense_created
├── expense_updated
├── expense_deleted
├── settlement_created
├── member_joined
├── member_left
└── notification
```

### WebSocket Message Format

```json
{
  "event": "expense_created",
  "data": {
    "expense_id": "uuid",
    "home_id": "uuid",
    "title": "Dinner at Restaurant",
    "amount": 1500.00,
    "created_by": "user_name"
  },
  "timestamp": "2024-04-06T12:00:00Z"
}
```

### Fallback: Polling Strategy

If WebSocket unavailable:
- Long polling every 30 seconds for updates
- Cache last sync timestamp
- Fetch only new data

---

## 9. API Design Strategy

### RESTful API Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         API ENDPOINTS                                    │
└─────────────────────────────────────────────────────────────────────────┘

AUTH
├── POST   /api/v1/auth/register          # Create account
├── POST   /api/v1/auth/login             # Login
├── POST   /api/v1/auth/logout            # Logout
├── POST   /api/v1/auth/refresh           # Refresh tokens
├── POST   /api/v1/auth/forgot-password   # Request reset
├── POST   /api/v1/auth/reset-password    # Reset password
└── POST   /api/v1/auth/verify-email      # Verify email

USERS
├── GET    /api/v1/users/me               # Current user
├── PATCH  /api/v1/users/me               # Update profile
├── DELETE /api/v1/users/me               # Delete account
└── GET    /api/v1/users/me/homes         # User's homes

HOMES
├── GET    /api/v1/homes                  # List homes
├── POST   /api/v1/homes                  # Create home
├── GET    /api/v1/homes/:id              # Get home
├── PATCH  /api/v1/homes/:id              # Update home
├── DELETE /api/v1/homes/:id              # Delete home
├── POST   /api/v1/homes/:id/regenerate   # New invite code
└── GET    /api/v1/homes/:id/balances     # Balance summary

MEMBERSHIPS
├── POST   /api/v1/homes/join             # Join by invite code
├── GET    /api/v1/homes/:id/members      # List members
├── PATCH  /api/v1/homes/:id/members/:uid # Update role
├── DELETE /api/v1/homes/:id/members/:uid # Remove member
├── GET    /api/v1/homes/:id/requests     # Pending requests
├── POST   /api/v1/homes/:id/requests/:rid/approve  # Approve
└── POST   /api/v1/homes/:id/requests/:rid/reject   # Reject

EXPENSES
├── GET    /api/v1/homes/:id/expenses     # List expenses
├── POST   /api/v1/homes/:id/expenses     # Create expense
├── GET    /api/v1/expenses/:id           # Get expense
├── PATCH  /api/v1/expenses/:id           # Update expense
├── DELETE /api/v1/expenses/:id           # Delete expense
└── POST   /api/v1/expenses/:id/settle    # Settle splits

RECEIPTS
├── POST   /api/v1/receipts/upload        # Upload receipt
├── GET    /api/v1/receipts/:id           # Get receipt
├── GET    /api/v1/receipts/:id/parse     # Parse receipt
└── DELETE /api/v1/receipts/:id           # Delete receipt

VOICE
├── POST   /api/v1/voice/transcribe       # Transcribe audio
└── POST   /api/v1/voice/parse            # Parse to expense

AI
├── POST   /api/v1/ai/parse-text          # Parse text input
├── POST   /api/v1/ai/parse-receipt       # Parse receipt JSON
└── POST   /api/v1/ai/suggest-split       # Smart split suggestion

SETTLEMENTS
├── GET    /api/v1/homes/:id/settlements  # List settlements
├── POST   /api/v1/homes/:id/settlements  # Create settlement
└── POST   /api/v1/settlements/:id/confirm # Confirm settlement

NOTIFICATIONS
├── GET    /api/v1/notifications          # List notifications
├── POST   /api/v1/notifications/:id/read # Mark as read
└── POST   /api/v1/notifications/read-all # Mark all read

WEBSOCKET
└── WS     /ws?token=xxx                  # Real-time updates
```

### API Response Format

```json
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Pagination

```
GET /api/v1/homes/:id/expenses?page=1&limit=20&sort=created_at&order=desc

Response:
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  },
  "links": {
    "first": "/api/v1/homes/:id/expenses?page=1",
    "prev": null,
    "next": "/api/v1/homes/:id/expenses?page=2",
    "last": "/api/v1/homes/:id/expenses?page=8"
  }
}
```

---

## 10. Security Considerations

### Security Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────┘

1. TRANSPORT SECURITY
   ├── HTTPS only (TLS 1.3)
   ├── HSTS headers
   └── CORS configuration

2. AUTHENTICATION
   ├── JWT with short expiry (15 min)
   ├── Refresh token rotation
   ├── Token blacklisting on logout
   └── Rate limiting on auth endpoints

3. AUTHORIZATION
   ├── Role-based access control
   ├── Resource ownership checks
   └── Home membership validation

4. INPUT VALIDATION
   ├── Pydantic schema validation
   ├── SQL injection prevention (ORM)
   ├── XSS prevention
   └── File upload validation

5. DATA PROTECTION
   ├── Password hashing (bcrypt)
   ├── Sensitive data encryption
   ├── PII handling compliance
   └── Audit logging

6. API SECURITY
   ├── Rate limiting
   ├── Request size limits
   ├── API versioning
   └── Request signing (optional)
```

---

## 11. Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CACHING ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────┘

REDIS CACHE STRUCTURE:

1. USER SESSIONS
   Key: session:{user_id}
   TTL: 7 days
   Data: { last_active, preferences }

2. HOME DATA
   Key: home:{home_id}:members
   TTL: 1 hour
   Data: [member list]

3. EXPENSE SUMMARIES
   Key: home:{home_id}:summary
   TTL: 5 minutes
   Data: { balances, totals }

4. RATE LIMITING
   Key: ratelimit:{ip}:{endpoint}
   TTL: 1 minute
   Data: request count

CACHE INVALIDATION:
- On expense create/update/delete
- On member join/leave
- On settlement
```

---

## 12. Error Handling Strategy

### Error Codes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ERROR CODES                                      │
└─────────────────────────────────────────────────────────────────────────┘

AUTH_001: Invalid credentials
AUTH_002: Token expired
AUTH_003: Token invalid
AUTH_004: Email not verified
AUTH_005: Account deactivated

USER_001: User not found
USER_002: Email already exists
USER_003: Invalid email format

HOME_001: Home not found
HOME_002: Invalid invite code
HOME_003: Already a member
HOME_004: Membership pending
HOME_005: Not authorized for this home

EXPENSE_001: Expense not found
EXPENSE_002: Invalid amount
EXPENSE_003: Split calculation error
EXPENSE_004: Cannot delete settled expense

RECEIPT_001: Upload failed
RECEIPT_002: Invalid file type
RECEIPT_003: Parsing failed

AI_001: Parsing failed
AI_002: Insufficient context
AI_003: Clarification needed

SYSTEM_001: Internal server error
SYSTEM_002: Database error
SYSTEM_003: External service unavailable
```

---

## Summary

This architecture provides:

1. **Scalability**: Clean separation of concerns, stateless API design
2. **Mobile-First**: PWA support, offline capabilities, responsive design
3. **AI-Powered**: Multi-modal input processing (text, voice, receipt)
4. **Security**: JWT auth, RBAC, input validation, encryption
5. **Real-Time**: WebSocket support for live updates
6. **Maintainability**: Clean architecture, modular design, type safety

---

**Next Phase**: PHASE 2 - Module Breakdown + Checkpoint Plan
