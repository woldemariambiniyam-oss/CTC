# Deployment Guide

## Production Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation updated

## Deployment Options

### Option 1: Traditional VPS/Server

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 16+
- MySQL 8+
- Python 3.8+
- Nginx (reverse proxy)
- PM2 (process manager)

#### Steps

1. **Server Setup**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL
   sudo apt install mysql-server -y
   
   # Install Python
   sudo apt install python3 python3-pip -y
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Database Setup**:
   ```bash
   # Create database
   mysql -u root -p < database/schema.sql
   ```

3. **Application Deployment**:
   ```bash
   # Clone repository
   git clone <repository-url>
   cd CTC
   
   # Backend setup
   cd backend
   npm install --production
   cp env.example .env
   # Edit .env with production values
   pm2 start server.js --name ctc-backend
   
   # Frontend build
   cd ../frontend
   npm install
   npm run build
   
   # QR Service setup
   cd ../qr-generator
   pip3 install -r requirements.txt
   pm2 start app.py --name ctc-qr --interpreter python3
   ```

4. **Nginx Configuration**:
   ```nginx
   # /etc/nginx/sites-available/ctc
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /path/to/CTC/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # QR Service
       location /qr {
           proxy_pass http://localhost:5001;
           proxy_set_header Host $host;
       }
   }
   ```

5. **Enable Site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ctc /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **SSL Setup (Let's Encrypt)**:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

### Option 2: Docker Deployment

#### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: coffee_training_center
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
  
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
    depends_on:
      - mysql
    ports:
      - "5000:5000"
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  qr-generator:
    build: ./qr-generator
    ports:
      - "5001:5001"
```

### Option 3: Cloud Platforms

#### Heroku
1. Install Heroku CLI
2. Create Heroku apps for backend and frontend
3. Configure environment variables
4. Deploy using Git

#### AWS
- Use EC2 for servers
- RDS for MySQL
- S3 for file storage
- CloudFront for CDN
- Route 53 for DNS

#### DigitalOcean
- Use App Platform or Droplets
- Managed MySQL database
- Spaces for file storage

## Environment Configuration

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000

# Database (use managed database in production)
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=strong-password
DB_NAME=coffee_training_center

# JWT (use strong random secret)
JWT_SECRET=generate-strong-random-secret
JWT_EXPIRES_IN=7d

# Twilio (production credentials)
TWILIO_ACCOUNT_SID=your-production-sid
TWILIO_AUTH_TOKEN=your-production-token
TWILIO_PHONE_NUMBER=your-verified-number

# SMTP (production email service)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password

# URLs (production domains)
FRONTEND_URL=https://your-domain.com
QR_SERVICE_URL=https://your-domain.com/qr
```

## Security Hardening

1. **Use HTTPS**: Always use SSL/TLS in production
2. **Strong Secrets**: Generate strong random secrets for JWT
3. **Database Security**: Use strong passwords, limit access
4. **Rate Limiting**: Configure appropriate rate limits
5. **CORS**: Restrict CORS to production domain only
6. **Input Validation**: Validate all inputs
7. **Error Handling**: Don't expose sensitive error details
8. **Regular Updates**: Keep dependencies updated
9. **Backup Strategy**: Regular database backups
10. **Monitoring**: Set up logging and monitoring

## Monitoring

### Recommended Tools
- **Application Monitoring**: PM2 Plus, New Relic, Datadog
- **Error Tracking**: Sentry, Rollbar
- **Logging**: Winston, Morgan, ELK Stack
- **Uptime Monitoring**: UptimeRobot, Pingdom

### PM2 Monitoring
```bash
# Start with monitoring
pm2 start server.js --name ctc-backend

# View logs
pm2 logs ctc-backend

# Monitor
pm2 monit

# Save PM2 configuration
pm2 save
pm2 startup
```

## Backup Strategy

### Database Backups
```bash
# Daily backup script
#!/bin/bash
mysqldump -u user -p database > backup_$(date +%Y%m%d).sql
# Upload to cloud storage
```

### File Backups
- Backup QR code uploads
- Backup certificate PDFs
- Use cloud storage (S3, Spaces, etc.)

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Multiple backend instances
- Database replication
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use caching (Redis)
- Database indexing

## Maintenance

### Regular Tasks
- Update dependencies
- Review logs
- Check disk space
- Monitor performance
- Review security
- Backup verification

### Update Process
1. Test updates in staging
2. Backup production
3. Deploy updates
4. Monitor for issues
5. Rollback if needed


