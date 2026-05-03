# TaskFlow — Team Task Manager

A full-stack team task management app with role-based access control (Admin/Member), built with Node.js, React, PostgreSQL, and deployable on Railway.

## Live Demo
**API:** https://taskflow-backend.up.railway.app  
**Frontend:** https://taskflow-frontend.vercel.app

---

## Features

- **Authentication** — Signup/Login with JWT tokens (7-day expiry)
- **Role-based access** — Admin can create projects, assign tasks, manage team; Members update task status only
- **Projects** — Create, manage, invite team members per project
- **Task Board** — Kanban-style board with To Do / In Progress / Done columns
- **Dashboard** — Live stats: total tasks, overdue, by status, recent activity
- **Users panel** — Admin can promote/demote users

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Deployment | Railway (backend + DB), Vercel (frontend) |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # JWT auth + role guards
│   │   ├── routes/             # Express routers
│   │   ├── utils/
│   │   │   └── prisma.js       # Prisma client singleton
│   │   └── index.js            # App entry point
│   ├── .env.example
│   ├── package.json
│   └── railway.toml            # Railway deployment config
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/         # Sidebar + Layout
    │   ├── context/
    │   │   └── AuthContext.jsx  # Auth state + JWT storage
    │   ├── pages/              # All page components
    │   ├── utils/
    │   │   └── api.js          # Axios instance
    │   └── App.jsx             # Router + protected routes
    ├── .env.example
    └── package.json
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Auth | List all projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Auth | Get project + tasks + members |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Auth | List tasks (filtered) |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/:id` | Auth | Get task |
| PUT | `/api/tasks/:id` | Auth | Update (members: status only) |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard` | Auth | Stats + recent/my tasks |

### Users (Admin only)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| PATCH | `/api/users/:id/role` | Admin | Update user role |

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or use Railway free tier)
- Git

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/taskflow"
JWT_SECRET="any-long-random-string-here"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

Run migrations and start:
```bash
npx prisma migrate dev --name init
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Set up the frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```

`.env` should have:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Deployment Guide

### Step 1: Push to GitHub
```bash
cd taskflow
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/taskflow.git
git push -u origin main
```

### Step 2: Deploy Backend on Railway

1. Go to **https://railway.app** → Sign up/in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `taskflow` repo
4. Railway auto-detects Node.js. Set **Root Directory** to `backend`
5. Click **Add Plugin** → **PostgreSQL** (Railway creates the DB and sets `DATABASE_URL` automatically)
6. Go to **Variables** tab → Add:
   ```
   JWT_SECRET = your-super-secret-key-at-least-32-chars
   FRONTEND_URL = https://your-vercel-app.vercel.app
   NODE_ENV = production
   ```
7. Railway runs `npm install && npx prisma generate && npx prisma migrate deploy` then `npm start`
8. Copy your Railway backend URL (e.g. `https://taskflow-backend.up.railway.app`)

### Step 3: Deploy Frontend on Vercel

1. Go to **https://vercel.com** → New Project → Import your repo
2. Set **Root Directory** to `frontend`
3. Set **Environment Variable**:
   ```
   VITE_API_URL = https://your-railway-backend.up.railway.app/api
   ```
4. Deploy → Get your live URL

### Step 4: Update CORS
Back in Railway, update:
```
FRONTEND_URL = https://your-actual-vercel-url.vercel.app
```
Redeploy the backend.

---

## Environment Variables Reference

### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `PORT` | No | Server port (default: 5000) |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |
| `NODE_ENV` | No | `development` or `production` |

### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API base URL |

---

## Default Roles

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks only) |
| Delete tasks/projects | ✅ | ❌ |
| View dashboard | ✅ | ✅ |
| View users page | ✅ | ❌ |

---

## Author
Built for the Full-Stack Assignment — 2024
