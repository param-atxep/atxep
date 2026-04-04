# ATXEP Troubleshooting Guide

Solutions for common issues and errors.

## Installation & Setup Issues

### Node.js Version Error
**Error:** `npm error code ERR!`

**Solution:**
```bash
# Check Node.js version
node -v

# Required: Node.js 18+
# If outdated, install from https://nodejs.org
```

### Database Connection Error
**Error:** `"DATABASE_URL is not defined"` or `Unable to connect to database`

**Solution:**
```bash
# 1. Check .env.local file exists
ls -la .env.local

# 2. Verify DATABASE_URL format
cat .env.local | grep DATABASE_URL

# 3. Test connection manually
psql $DATABASE_URL

# 4. If PostgreSQL not running:
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS
```

### Prisma Generation Error
**Error:** `"@prisma/client could not be generated"`

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules .next
npm install

# Generate Prisma client
npx prisma generate

# Push schema
npx prisma db push
```

## Authentication Issues

### Login Page Shows 404
**Error:** Page not found when accessing /login

**Solution:**
1. Verify `app/(auth)/login/page.tsx` exists
2. Clear Next.js cache: `rm -rf .next`
3. Restart development server: `npm run dev`

### "Invalid email or password"
**Error:** Can't login even with correct credentials

**Solution:**
```bash
# 1. Check user exists in database
npx prisma studio
# Navigate to Users table and search for email

# 2. If user exists but password wrong:
# Use password reset feature or:
npx prisma db execute --stdin << 'EOF'
UPDATE users SET password = NULL WHERE email = 'user@example.com';
EOF

# 3. Restart development server
npm run dev
```

### Google/GitHub OAuth Not Working
**Error:** Redirect loop or "Callback URL mismatch"

**Solution:**
1. Check OAuth credentials in .env.local are correct:
   ```bash
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```

2. Verify redirect URIs in provider settings:
   - **Google Console:** https://console.cloud.google.com
   - **GitHub Settings:** https://github.com/settings/developers (Apps)
   - Add: `http://localhost:3000/api/auth/callback/google`
   - Add: `http://localhost:3000/api/auth/callback/github`

3. Clear browser cookies/cache and try again

### "NEXTAUTH_SECRET is not defined"
**Error:** Authentication not working

**Solution:**
```bash
# Generate secret
openssl rand -base64 32

# Add to .env.local
echo "NEXTAUTH_SECRET=<generated-value>" >> .env.local

# Restart server
npm run dev
```

## API Errors

### "Unauthorized (401)" After Login
**Error:** APIs returning 401 even after successful login

**Solution:**
1. Check session persistence:
   ```bash
   # Check cookies in browser DevTools
   # Should have __Secure-next-auth.session-token
   ```

2. Verify NEXTAUTH_URL matches current URL:
   ```bash
   echo $NEXTAUTH_URL
   # Should match http://localhost:3000
   ```

3. Clear browser cookies and login again

### "Too many requests (429)"
**Error:** Rate limiting triggered

**Solution:**
- Wait a few minutes before retrying
- If testing, temporarily increase rate limits:
  ```typescript
  // In lib/rate-limit.ts
  const DEFAULT_LIMIT = 1000  // Increase for testing
  ```

### "Bad Request (400)"
**Error:** API returns validation error

**Solution:**
1. Check request body format:
   ```javascript
   // Should be valid JSON
   const body = {
     title: "Project Title",
     description: "Description",
     budget: 5000
   }
   ```

2. Verify required fields:
   - Projects: title, description, budget, category
   - Requests: receiverId, title
   - Payments: freelancerId, amount

3. Check field types:
   - Amounts should be numbers, not strings
   - Dates should be ISO format strings

### "Not Found (404)"
**Error:** Resource doesn't exist

**Solution:**
```bash
# Verify resource exists in database
npx prisma studio
# Check the relevant table

# If resource should exist, verify:
# 1. User is owner/creator
# 2. ID is correct format (should be CUID)
```

## Database Issues

### "Too many connections"
**Error:** PostgreSQL connection pool exhausted

**Solution:**
```bash
# Check active connections
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Reduce connection limit in dev
# Check package.json for datasource limits

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Database Locked
**Error:** Cannot write to database

**Solution:**
```bash
# Check for long-running queries
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Kill long transaction if needed
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE duration > interval '1 hour';"

# Reset sequences (if inserts failing)
npx prisma db execute --stdin << 'EOF'
SELECT setval(c.oid, (SELECT max(id) FROM users) + 1)
FROM pg_class c WHERE c.relname = 'users_id_seq';
EOF
```

### Migrations Failed
**Error:** `npx prisma migrate dev` fails

**Solution:**
```bash
# 1. Check migration status
npx prisma migrate status

# 2. Resolve pending migrations
npx prisma migrate resolve --rolled-back <migration_name>

# 3. Or reset database (WARNING: loses data)
npx prisma migrate reset

# 4. If stuck, manually clear:
psql $DATABASE_URL
DROP TABLE IF EXISTS "_prisma_migrations";
\q
npx prisma migrate deploy
```

## Payment Issues

### Stripe Webhook Not Triggered
**Error:** Payments not completing despite Stripe confirmation

**Solution:**
1. Verify webhook endpoint in Stripe Dashboard:
   - Should be: `https://yourdomain.com/api/webhooks/stripe`
   - Check "Events to listen to"
   - Required: `checkout.session.completed`

2. Check webhook signature:
   ```bash
   # Verify in .env
   echo $STRIPE_WEBHOOK_SECRET
   ```

3. Test webhook manually:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"type":"checkout.session.completed","data":{"object":{"id":"cs_test_123"}}}'
   ```

4. View webhook logs in Stripe Dashboard:
   - Should show successful deliveries

### "Invalid API Key"
**Error:** Stripe API errors

**Solution:**
```bash
# Verify keys
echo "Secret: $STRIPE_SECRET_KEY"
echo "Publishable: $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"

# Make sure using correct environment (test vs live)
# Test keys start with: sk_test_ and pk_test_
```

## Performance Issues

### Slow Page Load
**Error:** Pages taking >3 seconds to load

**Solution:**
1. Check database query performance:
   ```bash
   # Enable Prisma query logs
   echo "DEBUG=* npm run dev"
   
   # Check for N+1 queries in logs
   ```

2. Add database indexes (already done in production schema)

3. Use pagination:
   ```javascript
   // Instead of fetching all
   ?limit=20&page=1
   ```

### High CPU Usage
**Error:** Server CPU at 100%

**Solution:**
1. Check active connections:
   ```bash
   pm2 monit  # On production
   ```

2. Check for infinite loops in code

3. Restart application:
   ```bash
   npm run dev  # Dev
   pm2 restart atxep  # Production
   ```

## Deployment Issues

### "Build failed"
**Error:** `npm run build` fails

**Solution:**
```bash
# 1. Check TypeScript errors
npm run type-check

# 2. Check for missing dependencies
npm install

# 3. Clear build cache
rm -rf .next
npm run build
```

### Application crashes on startup
**Error:** Port already in use or other startup errors

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Prisma schema out of sync
**Error:** Database schema doesn't match Prisma schema

**Solution:**
```bash
# Option 1: Push schema (destructive)
npx prisma db push --force-reset  # WARNING: loses data

# Option 2: Create migration
npx prisma migrate dev --name sync_schema

# Option 3: Introspect existing database
npx prisma introspect  # Auto-generates matching schema
```

## Browser/Client Issues

### Cookies not persisting
**Error:** Session lost after page refresh

**Solution:**
1. Check browser allows cookies:
   - Settings → Privacy → Cookies enabled

2. Check cookie settings:
   - In browser DevTools → Application → Cookies
   - Look for `__Secure-next-auth.session-token`

3. In development, cookies require secure context:
   - Use `http://localhost:3000` (not IP address)

### "Unhandled Promise Rejection"
**Error:** Console error about unhandled promise

**Solution:**
1. Check browser console for full error
2. Look for specific error message
3. Add error boundary wrapper:
   ```typescript
   try {
     const result = await fetch(...)
   } catch (err) {
     console.error('API Error:', err)
   }
   ```

### Form not submitting
**Error:** Form button doesn't work

**Solution:**
1. Check network tab in DevTools:
   - Verify API call is made
   - Check response status

2. Check form validation:
   - Required fields filled
   - Email format valid
   - Passwords match

3. Look for JavaScript errors in console

## Getting Help

If issue not in this guide:

1. **Check logs:**
   ```bash
   # Development
   npm run dev  # Watch console output
   
   # Production (Vercel)
   # Check Vercel Dashboard → Deployments → Logs
   
   # Production (Self-hosted)
   pm2 logs atxep
   tail -f /var/log/nginx/error.log
   ```

2. **Check database:**
   ```bash
   npx prisma studio  # Visual database browser
   ```

3. **Enable debug mode:**
   ```bash
   DEBUG=* npm run dev
   ```

4. **Search GitHub Issues:**
   - Provide error message and steps to reproduce

5. **Ask for help:**
   - Include error message, logs, and reproduction steps
   - Share OS, Node.js version, database version

---

**Still stuck?** Check the main README.md and PRODUCTION_README.md for comprehensive documentation.
