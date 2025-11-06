# NAMNGAM VPS Deployment Checklist

## Quick Reference Guide

This checklist provides a condensed version of the deployment process for quick reference during implementation.

---

## Phase 1: Server Preparation

### System Setup
- [ ] Update system: `sudo apt update && sudo apt upgrade -y`
- [ ] Create app user: `sudo adduser appuser && sudo usermod -aG sudo appuser`
- [ ] Configure SSH key-based authentication
- [ ] Setup basic firewall: `sudo ufw enable`

### Install Dependencies
- [ ] Node.js 20.x LTS:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- [ ] PM2: `sudo npm install -g pm2`
- [ ] PostgreSQL:
  ```bash
  sudo apt install -y postgresql postgresql-contrib
  sudo systemctl start postgresql && sudo systemctl enable postgresql
  ```
- [ ] Nginx:
  ```bash
  sudo apt install -y nginx
  sudo systemctl start nginx && sudo systemctl enable nginx
  ```

---

## Phase 2: Database Configuration

### PostgreSQL Setup
- [ ] Set PostgreSQL password: `sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'strong_password';"`
- [ ] Create database and user:
  ```sql
  CREATE DATABASE namngam;
  CREATE USER namngam_user WITH PASSWORD 'db_password';
  GRANT ALL PRIVILEGES ON DATABASE namngam TO namngam_user;
  ALTER USER namngam_user CREATEDB;
  ```
- [ ] Test connection: `psql -U namngam_user -h localhost -d namngam -c "SELECT 1;"`

---

## Phase 3: Application Deployment

### Code Deployment
- [ ] Clone repository:
  ```bash
  cd /var/www
  sudo git clone <repository_url> namngam
  sudo chown -R appuser:appuser namngam
  ```
- [ ] Install dependencies: `npm install --legacy-peer-deps`
- [ ] Configure environment variables in `.env`:
  ```env
  DATABASE_URL="postgresql://namngam_user:db_password@localhost:5432/namngam?schema=public"
  NEXTAUTH_URL="https://yourdomain.com"
  NEXTAUTH_SECRET="32_character_minimum_secret"
  NODE_ENV="production"
  ```

### Database Setup
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Push schema: `npx prisma db push`
- [ ] Create admin user: `node scripts/create-admin.js`

### Build and Start
- [ ] Build application: `npm run build`
- [ ] Create PM2 ecosystem file (`ecosystem.config.js`)
- [ ] Start with PM2: `pm2 start ecosystem.config.js`
- [ ] Save PM2 config: `pm2 save && pm2 startup`

---

## Phase 4: Web Server Configuration

### Nginx Setup
- [ ] Create site config: `sudo nano /etc/nginx/sites-available/namngam`
- [ ] Enable site: `sudo ln -s /etc/nginx/sites-available/namngam /etc/nginx/sites-enabled/`
- [ ] Test config: `sudo nginx -t`
- [ ] Restart Nginx: `sudo systemctl restart nginx`

### SSL Certificate
- [ ] Install Certbot: `sudo apt install -y certbot python3-certbot-nginx`
- [ ] Obtain certificate: `sudo certbot --nginx -d yourdomain.com`
- [ ] Setup auto-renewal in crontab: `0 12 * * * /usr/bin/certbot renew --quiet`

---

## Phase 5: Security Hardening

### Firewall Configuration
- [ ] Configure UFW:
  ```bash
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow ssh
  sudo ufw allow 'Nginx Full'
  sudo ufw enable
  ```

### Fail2Ban Setup
- [ ] Install: `sudo apt install -y fail2ban`
- [ ] Configure: `sudo nano /etc/fail2ban/jail.local`
- [ ] Restart: `sudo systemctl restart fail2ban`

### Security Headers (Already in code)
- [ ] Verify security headers are present in middleware
- [ ] Test with: `curl -I https://yourdomain.com`

---

## Phase 6: Monitoring and Maintenance

### Log Management
- [ ] Setup logrotate: `sudo nano /etc/logrotate.d/namngam`
- [ ] Configure logwatch: `sudo apt install -y logwatch`

### Backup Strategy
- [ ] Create backup script: `/home/appuser/backup.sh`
- [ ] Setup cron job: `0 2 * * * /home/appuser/backup.sh`
- [ ] Test backup restoration

### Monitoring
- [ ] Setup health check endpoint
- [ ] Configure monitoring alerts
- [ ] Test PM2 monitoring: `pm2 monit`

---

## Phase 7: Performance Optimization

### Database Optimization
- [ ] Configure PostgreSQL: `sudo nano /etc/postgresql/15/main/postgresql.conf`
- [ ] Set connection pooling parameters
- [ ] Restart PostgreSQL: `sudo systemctl restart postgresql`

### Application Optimization
- [ ] Configure PM2 cluster mode based on CPU cores
- [ ] Set memory limits in ecosystem.config.js
- [ ] Enable gzip compression in Nginx

### Optional: Redis Caching
- [ ] Install Redis: `sudo apt install -y redis-server`
- [ ] Configure Redis: `sudo nano /etc/redis/redis.conf`
- [ ] Restart Redis: `sudo systemctl restart redis-server`

---

## Phase 8: Testing and Validation

### Functionality Tests
- [ ] Test public pages load correctly
- [ ] Test admin login and dashboard
- [ ] Test file upload functionality
- [ ] Test multilingual features

### Security Tests
- [ ] Verify SSL certificate is valid
- [ ] Test security headers are present
- [ ] Verify rate limiting is working
- [ ] Test authentication flows

### Performance Tests
- [ ] Check page load times
- [ ] Monitor memory usage
- [ ] Test database query performance
- [ ] Verify image optimization

---

## Deployment Script Template

Create `/home/appuser/deploy.sh`:
```bash
#!/bin/bash
set -e

APP_DIR="/var/www/namngam"
BACKUP_DIR="/home/appuser/deploy_backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting deployment at $(date)"

# Backup
mkdir -p $BACKUP_DIR
if [ -d "$APP_DIR" ]; then
    cp -r $APP_DIR $BACKUP_DIR/namngam_$DATE
fi

# Update code
cd $APP_DIR
git pull origin main

# Install dependencies
npm install --legacy-peer-deps

# Database updates
npx prisma db push

# Build
npm run build

# Reload application
pm2 reload namngam

# Cleanup
ls -t $BACKUP_DIR | tail -n +6 | xargs -I {} rm -rf $BACKUP_DIR/{}

echo "Deployment completed at $(date)"
```

Make executable: `chmod +x /home/appuser/deploy.sh`

---

## Emergency Procedures

### Application Down
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs namngam`
3. Restart if needed: `pm2 restart namngam`
4. Check Nginx: `sudo systemctl status nginx`

### Database Issues
1. Check PostgreSQL: `sudo systemctl status postgresql`
2. Check connection: `psql -U namngam_user -h localhost -d namngam`
3. Check logs: `sudo tail -f /var/log/postgresql/postgresql-15-main.log`

### SSL Certificate Issues
1. Check certificate: `sudo certbot certificates`
2. Renew manually: `sudo certbot renew`
3. Restart Nginx: `sudo systemctl restart nginx`

---

## Post-Deployment Monitoring

### Daily Checks
- [ ] Application is responding
- [ ] Error logs are clean
- [ ] Backup completed successfully
- [ ] SSL certificate is valid

### Weekly Checks
- [ ] Security updates applied
- [ ] Performance metrics reviewed
- [ ] Disk space usage checked
- [ ] Database performance reviewed

### Monthly Checks
- [ ] Security audit performed
- [ ] Backup restoration tested
- [ ] Dependency vulnerabilities scanned
- [ ] Performance optimization reviewed

---

## Contact Information

**Emergency Contacts:**
- System Administrator: [Email/Phone]
- Database Administrator: [Email/Phone]
- Security Team: [Email/Phone]

**Important URLs:**
- Application: https://yourdomain.com
- Admin Dashboard: https://yourdomain.com/admin
- Health Check: https://yourdomain.com/api/health

---

## Notes

- Always test deployments in staging first
- Keep documentation updated with any changes
- Monitor security advisories for all dependencies
- Regularly review and update security configurations
- Document any custom configurations or deviations from standard setup

---

This checklist should be used in conjunction with the comprehensive deployment guide for detailed explanations and troubleshooting steps.