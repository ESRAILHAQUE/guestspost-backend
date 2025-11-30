# Backend Deployment Guide

এই guide টি server এ backend deploy করতে সাহায্য করবে।

## Prerequisites

1. **Node.js** >= 18.0.0 installed
2. **PM2** installed globally (`npm install -g pm2`)
3. **MongoDB** running (local or MongoDB Atlas)
4. **Git** installed

## Deployment Steps

### 1. Server এ SSH Connect করুন

```bash
ssh root@your-server-ip
```

### 2. Backend Directory এ যান

```bash
cd /var/www/guestpostnow/Backend
```

### 3. Latest Code Pull করুন

```bash
git pull origin main
```

### 4. Environment Variables Setup করুন

`.env` file আছে কিনা check করুন:

```bash
ls -la .env
```

যদি না থাকে, তবে create করুন:

```bash
cp env.example .env
nano .env
```

Important environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CORS_ORIGIN=https://your-frontend-url.com
FRONTEND_URL=https://your-frontend-url.com
APP_URL=https://api.your-domain.com
```

### 5. Dependencies Install করুন

```bash
npm install
# অথবা যদি pnpm use করেন
pnpm install
```

### 6. Build করুন

```bash
npm run build
```

### 7. PM2 দিয়ে Start করুন

#### Option 1: Deploy Script ব্যবহার করুন

```bash
chmod +x deploy.sh
./deploy.sh
```

#### Option 2: Manual PM2 Start

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # System reboot এর পর auto start করার জন্য
```

## Common Commands

### PM2 Commands

```bash
# Status check
pm2 status

# Logs দেখুন
pm2 logs guestpost-backend

# Real-time monitoring
pm2 monit

# Restart
pm2 restart guestpost-backend

# Stop
pm2 stop guestpost-backend

# Delete from PM2
pm2 delete guestpost-backend

# Reload (zero-downtime)
pm2 reload guestpost-backend
```

### Troubleshooting

#### Backend start হচ্ছে না

1. **Check logs:**
   ```bash
   pm2 logs guestpost-backend --lines 50
   ```

2. **Check if port is in use:**
   ```bash
   netstat -tulpn | grep :5000
   # বা
   lsof -i :5000
   ```

3. **Check .env file:**
   ```bash
   cat .env
   ```

4. **Check if build is successful:**
   ```bash
   ls -la dist/server.js
   ```

5. **Manually test:**
   ```bash
   node dist/server.js
   ```

#### MongoDB Connection Error

- Check MongoDB URI in `.env`
- Check if MongoDB service is running
- Check network connectivity
- Verify MongoDB credentials

#### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

## Nginx Configuration (Optional)

যদি Nginx reverse proxy use করেন:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Health Check

Backend running আছে কিনা check করুন:

```bash
curl http://localhost:5000/api/v1/health
# অথবা
curl http://localhost:5000/api/v1
```

## Update/Deploy Process

নতুন changes deploy করার জন্য:

```bash
cd /var/www/guestpostnow/Backend
git pull origin main
npm install
npm run build
pm2 restart guestpost-backend
pm2 logs guestpost-backend
```

## Auto Deploy Script

`deploy.sh` script use করুন:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Important Notes

1. **Always check logs** after deployment
2. **Test API endpoints** after restart
3. **Backup .env file** before changes
4. **Check MongoDB connection** before deploying
5. **Verify port availability** before starting

