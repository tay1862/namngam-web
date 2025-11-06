# NAMNGAM VPS Deployment Guide

## Prerequisites
- VPS with Ubuntu 20.04 or later
- Node.js 18.x or later
- PostgreSQL 14 or later
- Nginx
- PM2 (Process Manager)
- Domain name (optional)

## Step 1: Server Setup

### Update Server
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database
```bash
sudo -u postgres psql
CREATE DATABASE namngam;
CREATE USER namngam_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE namngam TO namngam_user;
\q
```

### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2
```bash
sudo npm install -g pm2
```

## Step 2: Deploy Application

### Clone Repository
```bash
cd /var/www
git clone https://github.com/yourusername/namngarm-main-master.git namngam
cd namngam
```

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
```bash
cp .env.example .env
nano .env
```

Edit `.env` file with your configuration:
```
DATABASE_URL="postgresql://namngam_user:your_password@localhost:5432/namngam"
NEXTAUTH_URL="http://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Push Database Schema
```bash
npx prisma db push
```

### Create Admin User
```bash
node scripts/create-admin.js
```

### Build Application
```bash
npm run build
```

### Start with PM2
```bash
pm2 start npm --name "namngam" -- start
pm2 save
pm2 startup
```

## Step 3: Configure Nginx

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/namngam
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Handle file uploads
    location /api/upload {
        client_max_body_size 10M;
        proxy_pass http://localhost:3000;
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/namngam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 4: SSL Certificate (Optional)

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 5: Setup Auto-deployment (Optional)

### Create Deploy Script
```bash
nano deploy.sh
```

Add this content:
```bash
#!/bin/bash
cd /var/www/namngam
git pull origin main
npm install
npm run build
pm2 restart namngam
```

Make it executable:
```bash
chmod +x deploy.sh
```

### Setup Cron Job for Auto-pull
```bash
crontab -e
```

Add this line to pull updates every hour:
```
0 * * * * cd /var/www/namngam && git pull origin main
```

## Step 6: Maintenance

### Check Logs
```bash
pm2 logs namngam
```

### Restart Application
```bash
pm2 restart namngam
```

### Update Application
```bash
cd /var/www/namngam
git pull origin main
npm install
npm run build
pm2 restart namngam
```

### Backup Database
```bash
pg_dump -U namngam_user -h localhost namngam > backup.sql
```

### Restore Database
```bash
psql -U namngam_user -h localhost namngam < backup.sql
```

## Troubleshooting

### Port 3000 Already in Use
```bash
sudo lsof -i :3000
sudo kill -9 PID
```

### Permission Issues
```bash
sudo chown -R www-data:www-data /var/www/namngam
sudo chmod -R 755 /var/www/namngam
```

### Database Connection Issues
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Verify connection details in `.env` file
- Check firewall settings

### Application Not Starting
- Check PM2 logs: `pm2 logs namngam`
- Verify Node.js version: `node --version`
- Check if all dependencies are installed

## Security Tips

1. Regularly update packages: `npm audit fix`
2. Use strong passwords for database
3. Configure firewall: `sudo ufw enable`
4. Regularly backup database and files
5. Monitor server resources and logs

## Performance Optimization

1. Enable Gzip compression in Nginx
2. Use CDN for static assets
3. Implement caching strategies
4. Monitor server performance regularly
5. Use appropriate server specifications based on traffic
