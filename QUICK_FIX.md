# Quick Fix Guide for Server Issues

## Current Issues Identified:

1. **Frontend**: Port 3000 is already in use (EADDRINUSE)
2. **Backend**: Process is in "errored" state (9 restarts)

## Quick Fix Steps:

### Step 1: Run the Fix Script

```bash
cd /var/www/guestpostnow/guestpostnow-backend
git pull origin main
chmod +x fix-server-issues.sh
./fix-server-issues.sh
```

### Step 2: Manual Fix (if script doesn't work)

#### Fix Frontend Port Conflict:

```bash
# Find what's using port 3000
lsof -i :3000
# or
netstat -tulpn | grep :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or kill all node processes on port 3000
kill -9 $(lsof -ti :3000)

# Stop and delete frontend process
pm2 stop guestpostnow-frontend
pm2 delete guestpostnow-frontend

# Start fresh
cd /var/www/guestpostnow/guestpostnow-frontend
pm2 start npm --name guestpostnow-frontend -- start
pm2 save
```

#### Fix Backend Error:

```bash
# Check backend directory
cd /var/www/guestpostnow/guestpostnow-backend
# or
cd /var/www/guestpostnow/Backend

# Delete errored process
pm2 delete guestpost-backend

# Check .env file exists
ls -la .env

# Check if dist folder exists
ls -la dist/server.js

# If dist doesn't exist, build
npm install
npm run build

# Start backend
if [ -f "ecosystem.config.js" ]; then
  pm2 start ecosystem.config.js
else
  pm2 start dist/server.js --name guestpost-backend
fi

pm2 save
```

### Step 3: Check Logs

```bash
# Frontend logs
pm2 logs guestpostnow-frontend --lines 50

# Backend logs
pm2 logs guestpost-backend --lines 50

# Check PM2 status
pm2 status
```

### Step 4: Verify Services

```bash
# Check frontend is running
curl http://localhost:3000

# Check backend is running
curl http://localhost:5000/api/v1

# Check from outside (if firewall allows)
curl http://your-server-ip:3000
curl http://your-server-ip:5000/api/v1
```

## Common Issues:

### Issue: Port Already in Use
**Solution**: Kill the process using the port and restart PM2 process

### Issue: Backend Error - Missing .env
**Solution**: Copy env.example to .env and configure it

### Issue: Backend Error - MongoDB Connection
**Solution**: Check MONGODB_URI in .env file

### Issue: Build Failed
**Solution**: 
```bash
rm -rf node_modules dist
npm install
npm run build
```

## Prevention:

1. Always check PM2 status before restarting
2. Use the fix-server-issues.sh script before manual intervention
3. Keep .env file backed up
4. Monitor logs regularly

