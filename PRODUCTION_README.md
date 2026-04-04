# ATXEP - Production Ready Freelance Marketplace

A full-stack Next.js 14 freelance marketplace application built with:

- **Next.js 14** - React framework with App Router
- **NextAuth.js** - Complete authentication system (OAuth + Email/Password)
- **Prisma** - Type-safe ORM with PostgreSQL
- **Stripe** - Payment processing
- **Tailwind CSS** - Utility-first CSS
- **TypeScript** - Full type safety

## ✨ Features

- **Modern Authentication**
  - Email & Password registration/login with bcrypt hashing
  - Google OAuth integration
  - GitHub OAuth integration
  - Role-based access control (CLIENT, FREELANCER)
  - Secure JWT session handling

- **Freelancer Management**
  - Browse and search freelancers
  - View profiles and ratings
  - Send work requests
  - Track project status

- **Client Dashboard**
  - Create and manage projects
  - Track spending and wallet balance
  - View pending requests
  - Payment history

- **Payment System**
  - Stripe integration for secure payments
  - 5% platform commission
  - Wallet system for freelancers
  - Transaction tracking

- **Performance & Security**
  - Database indexes for optimal queries
  - Rate limiting on APIs
  - Input validation and sanitization
  - Error boundaries and global error handling
  - CORS protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Npm or pnpm package manager

### 1. Installation

```bash
# Clone repository
git clone <repository-url>
cd atxep

# Install dependencies
npm install
# or
pnpm install
```

### 2. Environment Setup

```bash
# Copy example env file
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/atxep_db

# NextAuth
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# GitHub OAuth (get from https://github.com/settings/developers)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Or create migration
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Server runs at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
atxep-main/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── payments/      # Payment processing
│   │   ├── projects/      # Project management
│   │   ├── requests/      # Request handling
│   │   └── wallet/        # Wallet operations
│   ├── (auth)/            # Auth pages (login/register)
│   ├── (client)/          # Client dashboard
│   ├── (freelancer)/      # Freelancer dashboard
│   └── (marketing)/       # Marketing pages
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   └── error-boundary.tsx # Global error handling
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── auth.ts           # NextAuth config
│   ├── auth-middleware.ts # Auth verification
│   ├── api-utils.ts      # API response helpers
│   ├── rate-limit.ts     # Rate limiting
│   ├── stripe.ts         # Stripe integration
│   └── db.ts             # Prisma client
├── prisma/               # Database schema
│   └── schema.prisma     # Data models
└── types/                # TypeScript definitions
```

## 🔐 Authentication Flow

### Email/Password Signup
1. User fills signup form
2. Password hashed with bcrypt (12 rounds)
3. User created in database
4. Automatic redirect to login

### Email/Password Login
1. Email normalized and validated
2. User lookup in database
3. Password comparison
4. JWT token generated
5. Session established

### OAuth (Google/GitHub)
1. User clicks OAuth button
2. Redirected to provider
3. User grants permissions
4. User created/updated if new
5. JWT token generated
6. Automatic redirect to onboard

## 💳 Payment System

### Stripe Checkout Process
1. User initiates payment
2. Checkout session created with Stripe
3. Transaction record created (PENDING)
4. User redirected to Stripe Checkout
5. Payment completed
6. Webhook processes payment
7. Transaction marked COMPLETED
8. Wallet updated

### Commission Calculation
- Base commission: 5%
- For $100 payment: $95 to freelancer, $5 to platform
- Tracked in Transaction model

## 🧪 API Endpoints

### Authentication
- `POST /api/register` - Create account
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (CLIENT only)
- `PATCH /api/projects` - Update project status

### Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Send request
- `PATCH /api/requests` - Update request status

### Payments
- `POST /api/payments/checkout` - Create checkout session
- `GET /api/payments/checkout` - Get session status

### Wallet
- `GET /api/wallet` - Get wallet details
- `POST /api/wallet` - Add funds

## 🚨 Error Handling

### Global Error Boundary
All errors are caught and displayed in user-friendly UI via `ErrorBoundary` component.

### API Error Responses
```json
{
  "success": false,
  "message": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Server Error

## 🔒 Security Features

- ✅ Bcrypt password hashing (12 rounds)
- ✅ JWT tokens with secure cookies
- ✅ CSRF protection via NextAuth
- ✅ Input validation and sanitization
- ✅ Rate limiting (5 req/15min auth, 100 req/min API)
- ✅ SQL injection prevention via Prisma
- ✅ Environment variable validation
- ✅ Account suspension support

## ⚡ Performance Optimizations

- ✅ Database indexes on frequently queried fields
- ✅ Server-side rendering where applicable
- ✅ Lazy loading of components
- ✅ Suspense boundaries
- ✅ Skeleton loaders during loading states
- ✅ Pagination for large datasets
- ✅ Parallel data fetching

## 📈 Database Schema

### Core Models
- **User** - Accounts with roles (CLIENT, FREELANCER)
- **Project** - Work listings created by clients
- **Request** - Work offers sent by freelancers
- **Transaction** - Payment records with commission tracking
- **Wallet** - User balances
- **ActivityLog** - User action tracking

### Indexes
- User: email, role, isSuspended, createdAt
- Project: creatorId, submiterId, status, category, createdAt
- Request: senderId, receiverId, status, createdAt
- Transaction: userId, type, status, senderId, receiverId, createdAt
- ActivityLog: userId, action, createdAt

## 🐛 Debugging

### Enable Debug Logs
```env
LOG_LEVEL=debug
NODE_ENV=development
```

### View Logs
- Browser console: `console.log()` statements
- Terminal: Server-side errors
- Prisma Studio: `npx prisma studio`

## 📦 Production Deployment

### Build
```bash
npm run build
```

### Run Production
```bash
npm run start
```

### Environment Variables (Production)
Ensure all `.env.local` variables are set in production:
- `NEXTAUTH_SECRET` (generate new for production)
- `NEXTAUTH_URL` (your production domain)
- `DATABASE_URL` (production database)
- All OAuth credentials
- All Stripe keys

### Database Migration
```bash
npx prisma migrate deploy
```

## 📝 License

MIT License - See [License.md](License.md)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Submit pull request

## 📞 Support

For issues or questions, please open an issue on GitHub.
