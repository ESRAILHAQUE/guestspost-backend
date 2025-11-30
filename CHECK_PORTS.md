# Port Usage Check Guide

## Quick Commands to Check Ports:

### Check All Ports at Once:
```bash
cd /var/www/guestpostnow/guestpostnow-backend
git pull origin main
chmod +x check-ports.sh
./check-ports.sh
```

### Manual Port Checks:

#### Check Port 3000 (Frontend):
```bash
lsof -i :3000
# or
netstat -tulpn | grep :3000
# or
ss -tulpn | grep :3000
```

#### Check Port 5000 (Backend):
```bash
lsof -i :5000
# or
netstat -tulpn | grep :5000
# or
ss -tulpn | grep :5000
```

#### Check Port 80 (HTTP):
```bash
lsof -i :80
netstat -tulpn | grep :80
```

#### Check Port 443 (HTTPS):
```bash
lsof -i :443
netstat -tulpn | grep :443
```

### Check All PM2 Processes:
```bash
pm2 list
pm2 jlist | grep -E '"name"|"pid"|"status"'
```

### Check What Process is Using a Specific Port:
```bash
# Replace PORT_NUMBER with actual port (e.g., 3000, 5000)
PORT_NUMBER=3000
lsof -i :$PORT_NUMBER
# Show full command
PID=$(lsof -ti :$PORT_NUMBER)
ps -p $PID -o pid,cmd
```

### Kill Process on Port:
```bash
# Kill process on port 3000
kill -9 $(lsof -ti :3000)

# Kill process on port 5000
kill -9 $(lsof -ti :5000)
```

## Expected Port Usage:

- **Port 3000**: Frontend (Next.js) - `guestpostnow-frontend`
- **Port 5000**: Backend API (Node.js/Express) - `guestpost-backend`
- **Port 80**: Nginx/Apache (HTTP)
- **Port 443**: Nginx/Apache (HTTPS)

## Quick Diagnostic:

```bash
echo "=== Port 3000 ==="
lsof -i :3000 || echo "Port 3000 is free"
echo ""
echo "=== Port 5000 ==="
lsof -i :5000 || echo "Port 5000 is free"
echo ""
echo "=== PM2 Status ==="
pm2 list
```

## Full Service Map:

```bash
echo "Frontend (3000):"
pm2 list | grep frontend
lsof -i :3000 2>/dev/null | tail -1 || echo "Not running"

echo ""
echo "Backend (5000):"
pm2 list | grep backend
lsof -i :5000 2>/dev/null | tail -1 || echo "Not running"

echo ""
echo "Web Server (80/443):"
lsof -i :80 2>/dev/null | tail -1 || echo "Port 80 not in use"
lsof -i :443 2>/dev/null | tail -1 || echo "Port 443 not in use"
```

