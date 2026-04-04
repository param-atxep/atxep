# 🚀 ATXEP - Quick Start (5 Minutes)

Your freelance marketplace is **NOW PRODUCTION-READY!** Here's how to get running immediately.

## ⚡ Quick Start

### Option 1: Windows Users
```bash
# Run setup script
.\setup-db.bat

# Then start development server
npm run dev

# Open http://localhost:3000
```

### Option 2: macOS/Linux Users
```bash
# Run setup script
chmod +x setup-db.sh
./setup-db.sh

# Then start development server
npm run dev

# Open http://localhost:3000
```

### Option 3: Manual Setup
```bash
# 1. Install dependencies (if needed)
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local and add your database URL

# 3. Initialize database
npx prisma db push

# 4. Run development server
npm run dev
```

## 📋 Initial Configuration

Edit `.env.local` with your values:

```env
# Database (required)
DATABASE_URL=postgresql://user:password@localhost:5432/atxep_db

# Auth (generate: openssl rand -base64 32)
NEXTAUTH_SECRET=<generated-random-string>
NEXTAUTH_URL=http://localhost:3000

# OAuth (optional for testing)
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret

# Stripe (optional for testing)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## 🧪 Test Accounts

### Create First Account
1. Go to http://localhost:3000/register
2. Fill in form:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
3. Click "Create Account"
4. Login with email/password

### Test OAuth (Optional)
1. Click "Login with Google" or "Login with GitHub"
2. Follow OAuth provider flow

## ✨ What's Working

✅ **Authentication**
- Email/Password registration and login
- Google OAuth integration
- GitHub OAuth integration
- Session persistence

✅ **Dashboard**
- Client dashboard with stats
- Wallet balance
- Project management
- Request tracking

✅ **APIs**
- All endpoints protected
- Input validation
- Rate limiting
- Error handling

✅ **Database**
- Optimized schema with indexes
- Transaction tracking
- Activity logging
- Account management

## 📚 Read These First

1. [PRODUCTION_README.md](./PRODUCTION_README.md) - Features & Architecture
2. [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Security Overview
3. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common Issues

## 🔥 Common Tasks

### View Database
```bash
npx prisma studio
```
Opens visual database editor at http://localhost:5555

### Reset Database
```bash
npm run db:reset
```
⚠️ WARNING: Deletes all data - use for development only

### Check Types
```bash
npm run type-check
```

### View Logs
```bash
npm run dev
```
Server logs show in terminal

## 🚀 Next: Deployment

### For Vercel (Recommended)
1. Push code to GitHub
2. Go to https://vercel.com/import
3. Connect repository
4. Add environment variables
5. Deploy! ✨

### For Self-Hosted
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🆘 Issues?

### Can't connect to database?
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test PostgreSQL
psql $DATABASE_URL
```

### Can't see data?
```bash
# Open Prisma Studio
npx prisma studio

# View schema
npx prisma introspect
```

### Port 3000 already in use?
```bash
# Use different port
PORT=3001 npm run dev
```

More issues? See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📞 Feature Overview

| Feature | Status | Location |
|---------|--------|----------|
| Email/Password Auth | ✅ Ready | `/login`, `/register` |
| OAuth (Google/GitHub) | ✅ Ready | `/login` |
| Client Dashboard | ✅ Ready | `/client` |
| Freelancer Dashboard | 🏗️ Ready to implement | `/freelancer` |
| Projects | ✅ Ready | `/api/projects` |
| Requests | ✅ Ready | `/api/requests` |
| Payments | ✅ Ready (Stripe) | `/api/payments` |
| Wallet | ✅ Ready | `/api/wallet` |
| Error Handling | ✅ Ready | Global |
| Rate Limiting | ✅ Ready | All APIs |

## 🎓 Learning Path

1. **Start Here:** Run application locally
2. **Create Account:** Test auth flow
3. **Explore Dashboard:** View stats and data
4. **Make API Call:** Test endpoints
5. **Read Docs:** Understand architecture
6. **Deploy:** Get to production

## 💡 Pro Tips

- Use Prisma Studio (`npx prisma studio`) instead of pgAdmin
- Check browser DevTools Network tab to debug API issues
- Server logs show in terminal when running `npm run dev`
- Database URL format: `postgresql://user:pass@host:port/dbname`

## 🎉 Ready?

```bash
npm install
npm run dev
```

**That's it!** Application running at http://localhost:3000

---

**Built for production.** Deploy with confidence! 🚀
