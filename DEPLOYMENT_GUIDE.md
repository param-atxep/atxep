# ATXEP Deployment Guide

Complete guide for deploying ATXEP to production.

## Deployment Options

### 1. Vercel (Recommended for Next.js)

#### Step 1: Prepare Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Production ready"
git push origin main
```

#### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Select "Import Project"
3. Connect your GitHub repository
4. Select the atxep project

#### Step 3: Environment Variables
In Vercel project settings, add environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production domain
- `GOOGLE_CLIENT_ID` - Google OAuth ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `GITHUB_CLIENT_ID` - GitHub OAuth ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret
- `STRIPE_SECRET_KEY` - Stripe test/live key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

#### Step 4: Deploy
1. Vercel auto-deploys on push
2. Database migrations run automatically
3. Check deployment status in Vercel dashboard

### 2. Self-Hosted (AWS, DigitalOcean, etc.)

#### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Node.js 18+ installed
- PostgreSQL 12+ installed
- Nginx or Apache (reverse proxy)
- SSL certificate (Let's Encrypt free)

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (for process management)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

#### Step 2: Application Setup
```bash
# Create application directory
mkdir -p /var/www/atxep
cd /var/www/atxep

# Clone repository
git clone <repository-url> .

# Install dependencies
npm install

# Create .env.local with production values
nano .env.local
# (Add all environment variables)

# Build application
npm run build

# Run migrations
npx prisma migrate deploy
```

#### Step 3: PM2 Setup
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'atxep',
    script: './node_modules/.bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monitor

# Save PM2 config to auto-start on reboot
pm2 startup
pm2 save
```

#### Step 4: Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/atxep
```

```nginx
upstream atxep {
    server 127.0.0.1:3000 max_fails=5 fail_timeout=60s;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }

    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (from Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Proxy to Next.js
    location / {
        proxy_pass http://atxep;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/atxep /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --webroot -w /var/www/certbot -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### Step 6: Database Backups
```bash
# Create backup script
mkdir -p /var/backups/atxep
cat > /var/backups/atxep/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump atxep_db > /var/backups/atxep/atxep_$DATE.sql.gz
# Keep only last 7 days
find /var/backups/atxep -name "atxep_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /var/backups/atxep/backup.sh

# Schedule daily backups
echo "0 2 * * * /var/backups/atxep/backup.sh" | sudo crontab -
```

## Environment Variables Reference

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/atxep_db

# NextAuth (IMPORTANT: Generate new for production)
NEXTAUTH_SECRET=<32+ character random string>
NEXTAUTH_URL=https://your-domain.com

# OAuth Providers
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Stripe (Use LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=ATXEP

# Optional: Email Service
RESEND_API_KEY=re_xxx
SENDGRID_API_KEY=SG.xxx

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx
```

## Health Checks

```bash
# Check application status
curl https://your-domain.com/health

# Check database connection
npx prisma db execute --stdin << <<< "SELECT 1"

# Check Stripe connection
curl https://your-domain.com/api/payments/checkout -H "Authorization: Bearer YOUR_SECRET"
```

## Monitoring & Maintenance

### Logs
```bash
# Application logs
pm2 logs atxep

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Updates
```bash
# Update dependencies
npm update

# Rebuild
npm run build

# Restart
pm2 restart atxep
```

### Database Maintenance
```bash
# Check database size
du -sh /var/lib/postgresql/

# Vacuum (cleanup)
psql atxep_db -c "VACUUM FULL ANALYZE"

# Check index health
psql atxep_db -c "SELECT * FROM pg_indexes;"
```

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs atxep

# Verify environment variables
echo $DATABASE_URL
echo $NEXTAUTH_SECRET

# Test database connection
npx prisma db execute --stdin << <<< "SELECT 1"
```

### Database connection issues
```bash
# Verify PostgreSQL running
sudo systemctl status postgresql

# Check connection string
psql $DATABASE_URL

# Check permissions
sudo -u postgres psql -c "\du"
```

### Stripe webhook not working
1. Check webhook secret in .env.local is correct
2. Verify domain in Stripe webhook settings
3. Check Stripe logs for failed deliveries
4. Test webhook manually: `curl -X POST https://your-domain.com/api/webhooks/stripe`

## Performance Optimization

### Database
- Run `VACUUM ANALYZE` weekly
- Monitor slow queries
- Review index usage
- Consider connection pooling (PgBouncer)

### Application
- Enable Vercel Analytics
- Monitor Core Web Vitals
- Use CDN for static assets
- Enable gzip compression

### Cost Optimization
- Use spot instances if on AWS
- Monitor bandwidth usage
- Review Stripe transaction fees
- Optimize database queries

## Security Hardening

### SSL/TLS
```bash
# Test SSL configuration
curl -I https://your-domain.com

# Check certificate
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout
```

### Firewall
```bash
# Only allow required ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2Ban (Brute force protection)
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## Scaling

### Horizontal Scaling (Multiple servers)
1. Set up load balancer (AWS ELB, Nginx)
2. Use shared PostgreSQL instance
3. Deploy application to multiple servers
4. Monitor with PM2+ or New Relic

### Vertical Scaling (Bigger server)
1. Upgrade server size
2. Increase PostgreSQL RAM
3. Increase Node.js heap size

## Disaster Recovery

### Backup Strategy
- Daily automated database backups
- Store backups in multiple locations
- Test restore process monthly
- Keep 30-day backup retention

### Recovery Procedure
```bash
# Restore database from backup
psql atxep_db < /var/backups/atxep/atxep_YYYYMMDD_HHMMSS.sql.gz

# Verify restore
npx prisma db execute --stdin << <<< "SELECT COUNT(*) FROM users;"

# Restart application
pm2 restart atxep
```

---

**Deployment successful!** 🎉

Your ATXEP application is now running in production. Monitor logs, set up alerts, and enjoy!
