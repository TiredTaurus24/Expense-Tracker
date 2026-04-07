# PHASE 2: Module Breakdown + Checkpoint Plan

## Expense Sharing PWA - Detailed Module Design

---

## 1. Module Breakdown

### Module Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MODULE OVERVIEW                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Auth Module   │     │   User Module   │     │   Home Module   │
│                 │     │                 │     │                 │
│ - Register      │     │ - Profile CRUD  │     │ - Home CRUD     │
│ - Login         │     │ - Preferences   │     │ - Invite codes  │
│ - Logout        │     │ - Avatar        │     │ - Settings      │
│ - Token Refresh │     │ - Settings      │     │                 │
│ - Password Reset│     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Membership     │     │  Expense Core   │     │  Split Engine   │
│  Module         │     │  Module         │     │  Module         │
│                 │     │                 │     │                 │
│ - Join requests │     │ - Expense CRUD  │     │ - Equal split   │
│ - Approvals     │     │ - Items CRUD    │     │ - % split       │
│ - Role mgmt     │     │ - Attachments   │     │ - Exact split   │
│ - Member list   │     │ - Categories    │     │ - Ratio split   │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Receipt       │     │   Voice         │     │   LLM Parser    │
│   Module        │     │   Module        │     │   Module        │
│                 │     │                 │     │                 │
│ - Upload        │     │ - Record        │     │ - Text parse    │
│ - Storage (S3)  │     │ - Transcribe    │     │ - Voice parse   │
│ - Vision parse  │     │ - STT API       │     │ - Receipt parse │
│ - Preview       │     │ - Preview       │     │ - Intent detect │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Math Engine   │     │   Dashboard     │     │  Notification   │
│   Module        │     │   Module        │     │   Module        │
│                 │     │                 │     │                 │
│ - Calculate     │     │ - Summaries     │     │ - Push notify   │
│ - Split calc    │     │ - Balances      │     │ - In-app notify │
│ - Percentage    │     │ - Activity feed │     │ - Email notify  │
│ - Ratios        │     │ - Charts        │     │ - Preferences   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 2. Detailed Module Specifications

### Module 1: Auth Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AUTH MODULE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Handle user authentication, authorization, and session mgmt │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── auth_service.py      - Core authentication logic                   │
│  ├── jwt_handler.py       - JWT token generation/validation             │
│  ├── password_handler.py  - Password hashing/verification               │
│  └── auth_middleware.py   - Request authentication middleware           │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── POST /api/v1/auth/register         - Create new account            │
│  ├── POST /api/v1/auth/login            - Authenticate user             │
│  ├── POST /api/v1/auth/logout           - Invalidate session            │
│  ├── POST /api/v1/auth/refresh          - Refresh access token          │
│  ├── POST /api/v1/auth/forgot-password  - Request password reset        │
│  ├── POST /api/v1/auth/reset-password   - Reset with token              │
│  └── POST /api/v1/auth/verify-email     - Verify email address          │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  ├── users               - User accounts                                │
│  └── refresh_tokens      - Refresh token storage                        │
│                                                                          │
│  DEPENDENCIES: None (Base module)                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 2: User Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER MODULE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Manage user profiles, preferences, and settings             │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── user_service.py      - User business logic                         │
│  ├── user_repository.py   - User data access                            │
│  └── avatar_handler.py    - Avatar upload/management                    │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── GET    /api/v1/users/me            - Get current user              │
│  ├── PATCH  /api/v1/users/me            - Update profile                │
│  ├── DELETE /api/v1/users/me            - Delete account                │
│  ├── GET    /api/v1/users/me/homes      - Get user's homes              │
│  └── POST   /api/v1/users/me/avatar     - Upload avatar                 │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  └── users               - User accounts                                │
│                                                                          │
│  DEPENDENCIES: Auth Module                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 3: Home Management Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HOME MODULE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Create, manage, and configure expense sharing homes         │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── home_service.py      - Home business logic                         │
│  ├── home_repository.py   - Home data access                            │
│  ├── invite_service.py    - Invite code generation/validation           │
│  └── home_settings.py     - Home configuration                          │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── GET    /api/v1/homes               - List user's homes             │
│  ├── POST   /api/v1/homes               - Create home                   │
│  ├── GET    /api/v1/homes/:id           - Get home details              │
│  ├── PATCH  /api/v1/homes/:id           - Update home                   │
│  ├── DELETE /api/v1/homes/:id           - Delete home                   │
│  ├── POST   /api/v1/homes/:id/regenerate - New invite code              │
│  └── GET    /api/v1/homes/:id/balances  - Balance summary               │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  ├── homes               - Home entities                                │
│  └── home_profiles       - Per-home user settings                       │
│                                                                          │
│  DEPENDENCIES: Auth Module, User Module                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 4: Membership & Approval Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       MEMBERSHIP MODULE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Handle home membership, join requests, and approvals        │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── membership_service.py - Membership business logic                  │
│  ├── approval_service.py   - Approval workflow                          │
│  ├── role_service.py       - Role management                            │
│  └── member_repository.py  - Member data access                         │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── POST   /api/v1/homes/join                    - Join by code        │
│  ├── GET    /api/v1/homes/:id/members             - List members        │
│  ├── PATCH  /api/v1/homes/:id/members/:uid        - Update role         │
│  ├── DELETE /api/v1/homes/:id/members/:uid        - Remove member       │
│  ├── GET    /api/v1/homes/:id/requests            - Pending requests    │
│  ├── POST   /api/v1/homes/:id/requests/:rid/approve - Approve request  │
│  └── POST   /api/v1/homes/:id/requests/:rid/reject  - Reject request   │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  └── home_memberships    - User-home relationships                      │
│                                                                          │
│  DEPENDENCIES: Auth Module, User Module, Home Module                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 5: Expense Core Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXPENSE CORE MODULE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Create, manage, and track expenses within homes             │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── expense_service.py   - Expense business logic                      │
│  ├── expense_repository.py- Expense data access                         │
│  ├── item_service.py      - Expense items management                    │
│  └── category_service.py  - Category management                         │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── GET    /api/v1/homes/:id/expenses   - List expenses                │
│  ├── POST   /api/v1/homes/:id/expenses   - Create expense               │
│  ├── GET    /api/v1/expenses/:id         - Get expense                  │
│  ├── PATCH  /api/v1/expenses/:id         - Update expense               │
│  ├── DELETE /api/v1/expenses/:id         - Delete expense               │
│  └── POST   /api/v1/expenses/:id/settle  - Settle splits                │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  ├── expenses             - Expense records                              │
│  └── expense_items        - Itemized expense entries                    │
│                                                                          │
│  DEPENDENCIES: Auth Module, Home Module, Membership Module               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 6: Expense Split Engine

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SPLIT ENGINE MODULE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Calculate and manage expense splits among members           │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── split_engine.py      - Core split calculations                     │
│  ├── equal_split.py       - Equal split logic                           │
│  ├── percentage_split.py  - Percentage-based split                      │
│  ├── exact_split.py       - Exact amount split                          │
│  ├── ratio_split.py       - Ratio-based split                           │
│  └── split_repository.py  - Split data access                           │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── POST   /api/v1/expenses/:id/splits  - Create splits                │
│  ├── GET    /api/v1/expenses/:id/splits  - Get splits                   │
│  ├── PATCH  /api/v1/splits/:id           - Update split                 │
│  └── POST   /api/v1/splits/:id/settle    - Settle split                 │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  └── expense_splits       - Individual split records                    │
│                                                                          │
│  DEPENDENCIES: Expense Core Module, Membership Module                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 7: Receipt Processing Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       RECEIPT MODULE                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Upload, store, and parse receipt images                     │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── receipt_service.py   - Receipt business logic                      │
│  ├── storage_service.py   - S3-compatible storage                       │
│  ├── vision_service.py    - Vision API integration                      │
│  └── receipt_parser.py    - Receipt data extraction                     │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── POST   /api/v1/receipts/upload      - Upload receipt               │
│  ├── GET    /api/v1/receipts/:id         - Get receipt                  │
│  ├── GET    /api/v1/receipts/:id/parse   - Parse receipt                │
│  └── DELETE /api/v1/receipts/:id         - Delete receipt               │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  └── receipts             - Receipt records                              │
│                                                                          │
│  DEPENDENCIES: Auth Module, Home Module, LLM Parser Module               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 8: Voice Processing Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VOICE MODULE                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Record, transcribe, and process voice input                 │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── voice_service.py     - Voice business logic                        │
│  ├── stt_service.py       - Speech-to-text API                          │
│  ├── audio_processor.py   - Audio preprocessing                         │
│  └── transcription_repo.py- Transcription storage                       │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── POST   /api/v1/voice/transcribe     - Transcribe audio             │
│  └── POST   /api/v1/voice/parse          - Parse to expense             │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  └── (Optional) transcriptions - Transcription history                  │
│                                                                          │
│  DEPENDENCIES: Auth Module, LLM Parser Module                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 9: LLM Parsing Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       LLM PARSER MODULE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Parse natural language into structured expense data         │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── llm_service.py       - LLM API integration                         │
│  ├── text_parser.py       - Text input parsing                          │
│  ├── voice_parser.py      - Voice transcription parsing                 │
│  ├── receipt_parser.py    - Receipt JSON parsing                        │
│  ├── intent_classifier.py - Intent detection                            │
│  └── entity_extractor.py  - Entity extraction                           │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── POST   /api/v1/ai/parse-text        - Parse text input             │
│  ├── POST   /api/v1/ai/parse-receipt     - Parse receipt JSON           │
│  └── POST   /api/v1/ai/suggest-split     - Smart split suggestion       │
│                                                                          │
│  DATABASE TABLES: None (Stateless)                                       │
│                                                                          │
│  DEPENDENCIES: Auth Module, Home Module (for context)                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 10: Math Engine Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       MATH ENGINE MODULE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Perform calculations for splits, percentages, and ratios    │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── math_engine.py       - Core calculation engine                     │
│  ├── calculator.py        - Basic arithmetic operations                 │
│  ├── percentage_calc.py   - Percentage calculations                     │
│  ├── ratio_calc.py        - Ratio calculations                          │
│  └── currency_utils.py    - Currency formatting/conversion              │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  └── (Internal service - no direct API)                                  │
│                                                                          │
│  DATABASE TABLES: None (Stateless)                                       │
│                                                                          │
│  DEPENDENCIES: None (Utility module)                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 11: Dashboard & Analytics Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DASHBOARD MODULE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Provide summaries, balances, and activity feeds             │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── dashboard_service.py - Dashboard business logic                    │
│  ├── summary_service.py   - Summary calculations                        │
│  ├── balance_service.py   - Balance calculations                        │
│  ├── activity_service.py  - Activity feed generation                    │
│  └── chart_service.py     - Chart data preparation                      │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── GET    /api/v1/homes/:id/summary    - Home summary                 │
│  ├── GET    /api/v1/homes/:id/balances   - Balance overview             │
│  ├── GET    /api/v1/homes/:id/activity   - Activity feed                │
│  └── GET    /api/v1/homes/:id/charts     - Chart data                   │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  └── (Reads from expenses, splits, settlements)                         │
│                                                                          │
│  DEPENDENCIES: Auth Module, Home Module, Expense Core Module            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module 12: Notification Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION MODULE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Send push, in-app, and email notifications                  │
│                                                                          │
│  COMPONENTS:                                                             │
│  ├── notification_service.py - Notification business logic              │
│  ├── push_service.py     - Push notification sending                    │
│  ├── email_service.py    - Email sending                                │
│  └── notification_repo.py- Notification storage                         │
│                                                                          │
│  API ENDPOINTS:                                                          │
│  ├── GET    /api/v1/notifications        - List notifications           │
│  ├── POST   /api/v1/notifications/:id/read - Mark as read               │
│  └── POST   /api/v1/notifications/read-all - Mark all read              │
│                                                                          │
│  DATABASE TABLES:                                                        │
│  └── notifications        - Notification records                         │
│                                                                          │
│  DEPENDENCIES: Auth Module, User Module                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       MODULE DEPENDENCY GRAPH                            │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │ Auth Module │
                              │   (BASE)    │
                              └──────┬──────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
           ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
           │ User Module │  │ Math Engine │  │Notification │
           │             │  │  (Utility)  │  │   Module    │
           └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
                  │                │                │
                  └────────────────┼────────────────┘
                                   │
                                   ▼
                          ┌─────────────┐
                          │ Home Module │
                          └──────┬──────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
           ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
           │ Membership  │ │ LLM Parser  │ │  Dashboard  │
           │   Module    │ │   Module    │ │   Module    │
           └──────┬──────┘ └──────┬──────┘ └─────────────┘
                  │               │
                  │    ┌──────────┴──────────┐
                  │    │                     │
                  │    ▼                     ▼
                  │ ┌─────────────┐  ┌─────────────┐
                  │ │ Voice Module│  │ Receipt Mod │
                  │ └─────────────┘  └─────────────┘
                  │
                  ▼
         ┌─────────────┐
         │  Expense    │
         │ Core Module │
         └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │ Split Engine│
         │   Module    │
         └─────────────┘


EXECUTION ORDER (Topological Sort):
=====================================

Layer 0 (No dependencies):
  1. Auth Module
  2. Math Engine Module

Layer 1 (Depends on Layer 0):
  3. User Module
  4. Notification Module

Layer 2 (Depends on Layer 1):
  5. Home Module

Layer 3 (Depends on Layer 2):
  6. Membership Module
  7. LLM Parser Module
  8. Dashboard Module

Layer 4 (Depends on Layer 3):
  9. Voice Module
  10. Receipt Module

Layer 5 (Depends on Layer 3):
  11. Expense Core Module

Layer 6 (Depends on Layer 5):
  12. Split Engine Module
```

---

## 4. Checkpoint Plan

### Checkpoint 1: Auth System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CHECKPOINT 1: AUTH SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement complete authentication system with JWT           │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── FastAPI app setup with async support                           │
│  │   ├── Database connection (PostgreSQL + SQLAlchemy async)            │
│  │   ├── User model (SQLAlchemy)                                        │
│  │   ├── Refresh token model                                            │
│  │   ├── Auth service (register, login, logout, refresh)                │
│  │   ├── JWT handler (generate, validate, decode)                       │
│  │   ├── Password handler (bcrypt hashing)                              │
│  │   ├── Auth routes (all endpoints)                                    │
│  │   └── Auth middleware                                                │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── React + Vite + TypeScript setup                                │
│      ├── Tailwind CSS configuration                                     │
│      ├── Auth store (Zustand)                                           │
│      ├── Login page                                                     │
│      ├── Register page                                                  │
│      └── Protected route wrapper                                        │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend (25+ files)                                                │
│  │   ├── app/main.py                                                    │
│  │   ├── app/config.py                                                  │
│  │   ├── app/core/database.py                                           │
│  │   ├── app/core/security.py                                           │
│  │   ├── app/models/base.py                                             │
│  │   ├── app/models/user.py                                             │
│  │   ├── app/models/refresh_token.py                                    │
│  │   ├── app/schemas/auth.py                                            │
│  │   ├── app/schemas/user.py                                            │
│  │   ├── app/services/auth_service.py                                   │
│  │   ├── app/api/v1/router.py                                           │
│  │   ├── app/api/v1/auth.py                                             │
│  │   ├── app/api/middleware/auth.py                                     │
│  │   └── ...                                                            │
│  │                                                                       │
│  └── Frontend (15+ files)                                               │
│      ├── src/main.tsx                                                   │
│      ├── src/App.tsx                                                    │
│      ├── src/stores/authStore.ts                                        │
│      ├── src/services/api.ts                                            │
│      ├── src/services/authService.ts                                    │
│      ├── src/pages/auth/LoginPage.tsx                                   │
│      ├── src/pages/auth/RegisterPage.tsx                                │
│      ├── src/components/auth/LoginForm.tsx                              │
│      ├── src/components/auth/RegisterForm.tsx                           │
│      └── ...                                                            │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── POST /api/v1/auth/register                                         │
│  ├── POST /api/v1/auth/login                                            │
│  ├── POST /api/v1/auth/logout                                           │
│  ├── POST /api/v1/auth/refresh                                          │
│  └── GET  /api/v1/users/me (for testing auth)                           │
│                                                                          │
│  DB TABLES:                                                              │
│  ├── users                                                               │
│  └── refresh_tokens                                                      │
│                                                                          │
│  DELIVERABLE: Working auth system with login/register UI                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 2: User Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CHECKPOINT 2: USER MODULE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement user profile management                            │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── User service (profile CRUD)                                    │
│  │   ├── User repository                                                │
│  │   ├── Avatar upload handler                                          │
│  │   └── User routes                                                    │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── Profile page                                                   │
│      ├── Settings page                                                  │
│      └── Avatar component                                               │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/services/user_service.py                                   │
│  │   ├── app/repositories/user_repo.py                                  │
│  │   ├── app/api/v1/users.py                                            │
│  │   └── app/core/storage.py                                            │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/pages/profile/ProfilePage.tsx                              │
│      ├── src/pages/settings/SettingsPage.tsx                            │
│      └── src/components/common/Avatar.tsx                               │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── GET    /api/v1/users/me                                            │
│  ├── PATCH  /api/v1/users/me                                            │
│  ├── DELETE /api/v1/users/me                                            │
│  └── POST   /api/v1/users/me/avatar                                     │
│                                                                          │
│  DB TABLES: users (extend)                                               │
│                                                                          │
│  DELIVERABLE: Complete user profile management                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 3: Home Management Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CHECKPOINT 3: HOME MODULE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement home creation and management                       │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── Home model                                                     │
│  │   ├── HomeProfile model                                              │
│  │   ├── Home service                                                   │
│  │   ├── Invite code generator                                          │
│  │   └── Home routes                                                    │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── Home list page                                                 │
│      ├── Home detail page                                               │
│      ├── Create home form                                               │
│      └── Home card component                                            │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/models/home.py                                             │
│  │   ├── app/models/home_profile.py                                     │
│  │   ├── app/schemas/home.py                                            │
│  │   ├── app/services/home_service.py                                   │
│  │   ├── app/repositories/home_repo.py                                  │
│  │   └── app/api/v1/homes.py                                            │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/stores/homeStore.ts                                        │
│      ├── src/pages/home/HomePage.tsx                                    │
│      ├── src/pages/home/HomeDetailPage.tsx                              │
│      ├── src/pages/home/CreateHomePage.tsx                              │
│      ├── src/components/home/HomeCard.tsx                               │
│      └── src/components/home/CreateHomeForm.tsx                          │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── GET    /api/v1/homes                                               │
│  ├── POST   /api/v1/homes                                               │
│  ├── GET    /api/v1/homes/:id                                           │
│  ├── PATCH  /api/v1/homes/:id                                           │
│  ├── DELETE /api/v1/homes/:id                                           │
│  └── POST   /api/v1/homes/:id/regenerate                                │
│                                                                          │
│  DB TABLES:                                                              │
│  ├── homes                                                               │
│  └── home_profiles                                                       │
│                                                                          │
│  DELIVERABLE: Working home management system                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 4: Membership & Approval Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CHECKPOINT 4: MEMBERSHIP MODULE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement membership and approval workflow                   │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── HomeMembership model                                           │
│  │   ├── Membership service                                             │
│  │   ├── Approval workflow                                              │
│  │   └── Membership routes                                              │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── Join home page                                                 │
│      ├── Member list component                                          │
│      ├── Pending requests page                                          │
│      └── Role management UI                                             │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/models/membership.py                                       │
│  │   ├── app/schemas/membership.py                                      │
│  │   ├── app/services/membership_service.py                             │
│  │   └── app/api/v1/memberships.py                                      │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/pages/home/JoinHomePage.tsx                                │
│      ├── src/components/home/MemberList.tsx                             │
│      ├── src/components/home/PendingRequests.tsx                        │
│      └── src/components/home/JoinHomeForm.tsx                           │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── POST   /api/v1/homes/join                                          │
│  ├── GET    /api/v1/homes/:id/members                                   │
│  ├── PATCH  /api/v1/homes/:id/members/:uid                              │
│  ├── DELETE /api/v1/homes/:id/members/:uid                              │
│  ├── GET    /api/v1/homes/:id/requests                                  │
│  ├── POST   /api/v1/homes/:id/requests/:rid/approve                     │
│  └── POST   /api/v1/homes/:id/requests/:rid/reject                      │
│                                                                          │
│  DB TABLES: home_memberships                                             │
│                                                                          │
│  DELIVERABLE: Complete membership system with approval workflow          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 5: Expense Core Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CHECKPOINT 5: EXPENSE CORE MODULE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement expense creation and management                    │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── Expense model                                                  │
│  │   ├── ExpenseItem model                                              │
│  │   ├── Expense service                                                │
│  │   └── Expense routes                                                 │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── Expense list page                                              │
│      ├── Create expense page                                            │
│      ├── Expense detail page                                            │
│      └── Quick add component                                            │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/models/expense.py                                          │
│  │   ├── app/schemas/expense.py                                         │
│  │   ├── app/services/expense_service.py                                │
│  │   ├── app/repositories/expense_repo.py                               │
│  │   └── app/api/v1/expenses.py                                         │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/stores/expenseStore.ts                                     │
│      ├── src/pages/expense/ExpensesPage.tsx                             │
│      ├── src/pages/expense/CreateExpensePage.tsx                        │
│      ├── src/pages/expense/ExpenseDetailPage.tsx                        │
│      ├── src/components/expense/ExpenseCard.tsx                         │
│      ├── src/components/expense/ExpenseForm.tsx                         │
│      └── src/components/expense/QuickAddExpense.tsx                     │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── GET    /api/v1/homes/:id/expenses                                  │
│  ├── POST   /api/v1/homes/:id/expenses                                  │
│  ├── GET    /api/v1/expenses/:id                                        │
│  ├── PATCH  /api/v1/expenses/:id                                        │
│  └── DELETE /api/v1/expenses/:id                                        │
│                                                                          │
│  DB TABLES:                                                              │
│  ├── expenses                                                            │
│  └── expense_items                                                       │
│                                                                          │
│  DELIVERABLE: Working expense management system                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 6: Expense Split Engine

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CHECKPOINT 6: SPLIT ENGINE MODULE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement split calculations and management                  │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── ExpenseSplit model                                             │
│  │   ├── Split engine (equal, %, exact, ratio)                          │
│  │   ├── Split service                                                  │
│  │   └── Split routes                                                   │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── Split form component                                           │
│      ├── Split preview component                                        │
│      └── Balance display component                                      │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/models/split.py                                            │
│  │   ├── app/services/split_engine.py                                   │
│  │   ├── app/services/split_service.py                                  │
│  │   ├── app/schemas/split.py                                           │
│  │   └── app/api/v1/splits.py                                           │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/components/expense/SplitForm.tsx                           │
│      ├── src/components/expense/SplitPreview.tsx                        │
│      └── src/components/expense/BalanceDisplay.tsx                      │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── POST   /api/v1/expenses/:id/splits                                 │
│  ├── GET    /api/v1/expenses/:id/splits                                 │
│  ├── PATCH  /api/v1/splits/:id                                          │
│  └── POST   /api/v1/splits/:id/settle                                   │
│                                                                          │
│  DB TABLES: expense_splits                                               │
│                                                                          │
│  DELIVERABLE: Working split calculation system                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 7: Receipt Processing Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CHECKPOINT 7: RECEIPT MODULE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement receipt upload and parsing                         │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── Receipt model                                                  │
│  │   ├── S3 storage service                                             │
│  │   ├── Vision API integration                                         │
│  │   └── Receipt routes                                                 │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── Camera capture component                                       │
│      ├── Receipt preview                                                │
│      └── Parsed result display                                          │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/models/receipt.py                                          │
│  │   ├── app/services/receipt_service.py                                │
│  │   ├── app/services/storage_service.py                                │
│  │   ├── app/services/vision_service.py                                 │
│  │   ├── app/schemas/receipt.py                                         │
│  │   └── app/api/v1/receipts.py                                         │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/components/receipt/CameraCapture.tsx                       │
│      ├── src/components/receipt/ReceiptPreview.tsx                      │
│      └── src/components/receipt/ParsedReceipt.tsx                       │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── POST   /api/v1/receipts/upload                                     │
│  ├── GET    /api/v1/receipts/:id                                        │
│  ├── GET    /api/v1/receipts/:id/parse                                  │
│  └── DELETE /api/v1/receipts/:id                                        │
│                                                                          │
│  DB TABLES: receipts                                                     │
│                                                                          │
│  DELIVERABLE: Working receipt upload and parsing                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 8: Voice Processing Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CHECKPOINT 8: VOICE MODULE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement voice recording and transcription                  │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── STT service (Whisper API)                                      │
│  │   ├── Audio processor                                                │
│  │   └── Voice routes                                                   │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── Voice recorder component                                       │
│      └── Transcription preview                                          │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/services/voice_service.py                                  │
│  │   ├── app/services/stt_service.py                                    │
│  │   ├── app/schemas/voice.py                                           │
│  │   └── app/api/v1/voice.py                                            │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/components/voice/VoiceRecorder.tsx                         │
│      └── src/components/voice/TranscriptionPreview.tsx                  │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── POST   /api/v1/voice/transcribe                                    │
│  └── POST   /api/v1/voice/parse                                         │
│                                                                          │
│  DB TABLES: None (stateless)                                             │
│                                                                          │
│  DELIVERABLE: Working voice input system                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 9: LLM Parsing Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CHECKPOINT 9: LLM PARSER MODULE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement AI-powered expense parsing                         │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── LLM service (OpenAI/Anthropic)                                 │
│  │   ├── Text parser                                                    │
│  │   ├── Intent classifier                                              │
│  │   └── AI routes                                                      │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── AI input component                                             │
│      └── Parsed result editor                                           │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/services/llm_service.py                                    │
│  │   ├── app/services/text_parser.py                                    │
│  │   ├── app/services/intent_classifier.py                              │
│  │   ├── app/schemas/ai.py                                              │
│  │   └── app/api/v1/ai.py                                               │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/components/ai/AIInput.tsx                                  │
│      └── src/components/ai/ParsedResultEditor.tsx                       │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── POST   /api/v1/ai/parse-text                                       │
│  ├── POST   /api/v1/ai/parse-receipt                                    │
│  └── POST   /api/v1/ai/suggest-split                                    │
│                                                                          │
│  DB TABLES: None (stateless)                                             │
│                                                                          │
│  DELIVERABLE: Working AI expense parsing                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 10: Math Engine Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CHECKPOINT 10: MATH ENGINE MODULE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement calculation utilities                              │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── Math engine core                                               │
│  │   ├── Percentage calculator                                          │
│  │   ├── Ratio calculator                                               │
│  │   └── Currency utilities                                             │
│  │                                                                       │
│  └── Frontend                                                            │
│      └── Calculator component (if needed)                               │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/services/math_engine.py                                    │
│  │   ├── app/utils/calculations.py                                      │
│  │   └── app/utils/currency.py                                          │
│  │                                                                       │
│  └── Frontend                                                            │
│      └── src/utils/calculations.ts                                      │
│                                                                          │
│  APIs INVOLVED: None (internal service)                                  │
│                                                                          │
│  DB TABLES: None                                                         │
│                                                                          │
│  DELIVERABLE: Working calculation utilities                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 11: Dashboard & Analytics Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CHECKPOINT 11: DASHBOARD MODULE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement dashboard and analytics                            │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── Dashboard service                                              │
│  │   ├── Summary service                                                │
│  │   ├── Balance service                                                │
│  │   └── Dashboard routes                                               │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── Dashboard page                                                 │
│      ├── Summary cards                                                  │
│      ├── Balance overview                                               │
│      └── Activity feed                                                  │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/services/dashboard_service.py                              │
│  │   ├── app/services/summary_service.py                                │
│  │   ├── app/services/balance_service.py                                │
│  │   └── app/api/v1/dashboard.py                                        │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/pages/dashboard/DashboardPage.tsx                          │
│      ├── src/components/dashboard/SummaryCard.tsx                       │
│      ├── src/components/dashboard/BalanceOverview.tsx                   │
│      └── src/components/dashboard/ActivityFeed.tsx                      │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── GET    /api/v1/homes/:id/summary                                   │
│  ├── GET    /api/v1/homes/:id/balances                                  │
│  └── GET    /api/v1/homes/:id/activity                                  │
│                                                                          │
│  DB TABLES: None (reads from existing)                                   │
│                                                                          │
│  DELIVERABLE: Working dashboard with analytics                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint 12: Notification Module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 CHECKPOINT 12: NOTIFICATION MODULE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OBJECTIVE: Implement notification system                                │
│                                                                          │
│  COMPONENTS TO BUILD:                                                    │
│  ├── Backend                                                             │
│  │   ├── Notification model                                             │
│  │   ├── Notification service                                           │
│  │   ├── Push service (optional)                                        │
│  │   └── Notification routes                                            │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── Notification bell component                                    │
│      ├── Notification list                                              │
│      └── Notification preferences                                       │
│                                                                          │
│  FILES TO CREATE:                                                        │
│  ├── Backend                                                             │
│  │   ├── app/models/notification.py                                     │
│  │   ├── app/services/notification_service.py                           │
│  │   ├── app/schemas/notification.py                                    │
│  │   └── app/api/v1/notifications.py                                    │
│  │                                                                       │
│  └── Frontend                                                            │
│      ├── src/components/notification/NotificationBell.tsx               │
│      ├── src/components/notification/NotificationList.tsx               │
│      └── src/components/notification/NotificationPrefs.tsx              │
│                                                                          │
│  APIs INVOLVED:                                                          │
│  ├── GET    /api/v1/notifications                                       │
│  ├── POST   /api/v1/notifications/:id/read                              │
│  └── POST   /api/v1/notifications/read-all                              │
│                                                                          │
│  DB TABLES: notifications                                                │
│                                                                          │
│  DELIVERABLE: Working notification system                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Checkpoint Execution Summary

| Checkpoint | Module | Dependencies | Estimated Files | DB Tables |
|------------|--------|--------------|-----------------|-----------|
| 1 | Auth System | None | 40+ | users, refresh_tokens |
| 2 | User Module | Auth | 15+ | users (extend) |
| 3 | Home Module | Auth, User | 20+ | homes, home_profiles |
| 4 | Membership | Auth, User, Home | 15+ | home_memberships |
| 5 | Expense Core | Auth, Home, Membership | 25+ | expenses, expense_items |
| 6 | Split Engine | Expense Core | 15+ | expense_splits |
| 7 | Receipt | Auth, Home, LLM | 15+ | receipts |
| 8 | Voice | Auth, LLM | 10+ | None |
| 9 | LLM Parser | Auth, Home | 15+ | None |
| 10 | Math Engine | None | 5+ | None |
| 11 | Dashboard | Auth, Home, Expense | 15+ | None |
| 12 | Notification | Auth, User | 15+ | notifications |

---

## Summary

This checkpoint plan provides:

1. **Clear Module Boundaries**: Each module has defined responsibilities
2. **Dependency Order**: Modules are built in correct dependency order
3. **Incremental Delivery**: Each checkpoint delivers working functionality
4. **Comprehensive Coverage**: All system components are covered

---

**Next Phase**: PHASE 3 - Incremental Implementation (Starting with Checkpoint 1: Auth System)

**IMPORTANT**: Each checkpoint will be generated ONE AT A TIME. After each checkpoint, I will STOP and wait for your approval before proceeding to the next checkpoint.
