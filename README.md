# 🏪 Store Rating Platform

A full-stack role-based web application where users can rate stores (1–5 stars), administrators manage the system, and store owners monitor their ratings.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| Auth | JWT (Access Token) |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
store-rating-platform/
├── backend/                        # NestJS API
│   ├── src/
│   │   ├── auth/                   # Auth module (login, register, JWT)
│   │   │   ├── dto/auth.dto.ts
│   │   │   ├── strategies/jwt.strategy.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── admin/                  # Admin module
│   │   │   ├── dto/admin.dto.ts
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   └── admin.module.ts
│   │   ├── stores/                 # Stores module (user-facing)
│   │   │   ├── stores.controller.ts
│   │   │   ├── stores.service.ts
│   │   │   └── stores.module.ts
│   │   ├── ratings/                # Ratings module
│   │   │   ├── dto/rating.dto.ts
│   │   │   ├── ratings.controller.ts
│   │   │   ├── ratings.service.ts
│   │   │   └── ratings.module.ts
│   │   ├── owner/                  # Store Owner module
│   │   │   ├── owner.controller.ts
│   │   │   ├── owner.service.ts
│   │   │   └── owner.module.ts
│   │   ├── common/
│   │   │   ├── guards/             # JWT + Roles guards
│   │   │   ├── decorators/         # @CurrentUser, @Roles, @Public
│   │   │   └── filters/            # Global exception filter
│   │   ├── prisma/                 # Prisma service + module
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── seed.ts                 # Demo seed data
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── components/
│   │   │   └── common/             # Reusable UI components
│   │   │       ├── Navbar.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── StarRating.jsx
│   │   │       ├── StatCard.jsx
│   │   │       ├── SortableTable.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── ChangePasswordForm.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── admin/AdminDashboard.jsx
│   │   │   ├── user/UserDashboard.jsx
│   │   │   └── owner/OwnerDashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── StoreRatingPlatform.postman_collection.json
└── README.md
```

---

## 🚀 Quick Start

### Option A — Local Development (Recommended)

#### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

#### 1. Clone the repository
```bash
git clone <repo-url>
cd store-rating-platform
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npm run prisma:seed

# Start development server
npm run start:dev
```

Backend runs at: **http://localhost:3000/api**  
Swagger docs at: **http://localhost:3000/api/docs**

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Option B — Docker (One Command)

```bash
# From project root
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Swagger Docs | http://localhost:3000/api/docs |

---

## 🔐 Demo Credentials

All demo accounts use password: **`Admin@123`**

| Role | Email |
|------|-------|
| Admin | admin@storerating.com |
| Normal User | alice@example.com |
| Store Owner | owner1@coffeehouse.com |

---

## 🌍 Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://username:password@localhost:5432/store_rating_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| PUT | `/api/auth/update-password` | Any | Update password |

### Admin (requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats overview |
| POST | `/api/admin/users` | Create any user |
| POST | `/api/admin/stores` | Create a store |
| GET | `/api/admin/users` | List users (filterable) |
| GET | `/api/admin/stores` | List stores (filterable) |
| GET | `/api/admin/users/:id` | Get user details |
| GET | `/api/admin/store-owners/available` | Owners without stores |

### Stores (requires USER role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | All stores |
| GET | `/api/stores/search?name=&address=` | Search stores |

### Ratings (requires USER role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ratings` | Submit rating |
| PUT | `/api/ratings/:id` | Update rating |

### Store Owner (requires STORE_OWNER role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owner/dashboard` | Store stats |
| GET | `/api/owner/ratings` | All ratings received |

---

## ✅ Validation Rules

| Field | Rule |
|-------|------|
| Name | 20–60 characters |
| Email | Valid email format |
| Address | Max 400 characters |
| Password | 8–16 chars, ≥1 uppercase, ≥1 special character |
| Rating | Integer 1–5 |

---

## 👥 User Roles & Permissions

### System Administrator
- Add users (any role) and stores
- View dashboard stats
- Filter and sort all user/store listings
- View user details (with store rating for owners)

### Normal User
- Register and login
- Browse and search stores
- Submit and update ratings (one per store)
- Update password

### Store Owner
- Login only (no self-registration)
- View their store's average rating
- See list of all users who rated their store
- Update password

---

## 🚢 Deployment

### Backend → Render
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect GitHub repo, set root directory to `backend`
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `npx prisma migrate deploy && node dist/main`
5. Add environment variables from `.env.example`

### Database → Neon
1. Create a free project on [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy!

---

## 📮 Postman Collection

Import `StoreRatingPlatform.postman_collection.json` into Postman.

The **Login** requests automatically save the JWT token to `{{token}}` via a test script, so all authenticated requests work immediately after logging in.

---

## 🛡️ Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- **JWT** authentication with configurable expiry
- **Role-based guards** on every protected endpoint
- **Global validation pipe** with `whitelist: true`
- CORS restricted to the configured frontend URL
- Prisma prevents SQL injection by design

---
