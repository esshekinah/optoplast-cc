# Dokploy Deployment Guide

## Overview
This guide will help you deploy your Next.js application on Dokploy using Docker Compose with the domain `demo.emmanuelshekinah.co.za`.

## Prerequisites
- Dokploy account and server
- Domain `demo.emmanuelshekinah.co.za` pointing to your Dokploy server
- Docker installed on your Dokploy server

## Files Created
- `docker-compose.yml` - Main deployment configuration
- `Dockerfile` - Multi-stage build for Next.js
- `.dockerignore` - Files to exclude from Docker build

## Environment Variables
Create these environment variables in Dokploy:

```bash
NEXTAUTH_SECRET=your-super-secret-key-here
NODE_ENV=production
```

## Deployment Steps

### 1. Configure DNS
Point your domain `demo.emmanuelshekinah.co.za` to your Dokploy server IP:
```
A record: demo.emmanuelshekinah.co.za -> YOUR_SERVER_IP
```

### 2. Create Application in Dokploy
1. Go to your Dokploy dashboard
2. Click "New Application"
3. Select "Docker Compose"
4. Connect your Git repository
5. Set the root path to `/` (repository root)

### 3. Configure Environment Variables
In Dokploy application settings:
1. Go to "Environment" tab
2. Add the following variables:
   - `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
   - `NODE_ENV=production`

### 4. Deploy Configuration
Use the following settings in Dokploy:

**Build Context**: `/`
**Docker Compose Path**: `docker-compose.yml`

### 5. SSL Certificate
The Docker Compose file includes Traefik labels for automatic SSL:
- Automatically requests SSL certificate from Let's Encrypt
- Redirects HTTP to HTTPS
- Handles certificate renewal

## Application Features
- **Health Checks**: Built-in health monitoring
- **Auto-restart**: Automatically restarts on crashes
- **Redis**: Optional Redis for session storage
- **SSL**: Automatic HTTPS with Let's Encrypt
- **Load Balancing**: Ready for horizontal scaling

## Post-Deployment Checklist
- [ ] Domain resolves correctly
- [ ] HTTPS works (green padlock)
- [ ] Form submission localStorage works
- [ ] All pages load without errors
- [ ] Health checks pass

## Monitoring
Check application health:
```bash
curl https://demo.emmanuelshekinah.co.za/api/health
```

## Troubleshooting

### Common Issues
1. **Build fails**: Check `next.config.js` output configuration
2. **Domain not working**: Verify DNS A record
3. **SSL not working**: Check Traefik logs in Dokploy
4. **localStorage issues**: Ensure HTTPS is working (localStorage requires secure context)

### Logs
View logs in Dokploy dashboard under:
- Application Logs
- Container Logs
- Traefik Logs (for SSL issues)

## Performance Optimization
The Dockerfile uses:
- Multi-stage builds for smaller image size
- Production-optimized Node.js runtime
- Static file optimization
- Proper user permissions

## Security
- Non-root user execution
- Minimal Alpine Linux base
- Environment variable isolation
- Automatic SSL/TLS

## Scaling
To scale the application:
1. Update `docker-compose.yml` with multiple replicas
2. Configure load balancing in Traefik
3. Consider external Redis for session storage

## Backup Strategy
- Redis data persisted in volume
- Application state in localStorage (client-side)
- Regular database backups if added later
