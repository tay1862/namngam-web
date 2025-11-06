# 📊 NAMNGAM Database Setup Guide

## ระบบฐานข้อมูลที่ต้องการ
- **PostgreSQL** (แนะนำ)
- สามารถใช้งานได้กับ: 
  - PostgreSQL ที่ติดตั้งเอง (Local/Remote)
  - Docker
  - Cloud services (Supabase, Neon, Railway, etc.)

## 🚀 วิธีการติดตั้ง

### 1. ใช้ PostgreSQL ที่ติดตั้งเอง (แนะนำ)

#### ติดตั้ง PostgreSQL:
```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download จาก https://www.postgresql.org/download/windows/
```

#### สร้าง Database:
```bash
# เข้า PostgreSQL
psql postgres

# สร้าง user และ database
CREATE USER namngam_user WITH PASSWORD 'your_password';
CREATE DATABASE namngam OWNER namngam_user;
GRANT ALL PRIVILEGES ON DATABASE namngam TO namngam_user;
\q
```

#### อัปเดต .env file:
```env
DATABASE_URL="postgresql://namngam_user:your_password@localhost:5432/namngam?schema=public"
```

### 2. ใช้ Docker (ง่ายและรวดเร็ว)

```bash
# สร้าง docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: namngam
      POSTGRES_USER: namngam_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start PostgreSQL
docker-compose up -d

# Update .env
DATABASE_URL="postgresql://namngam_user:your_password@localhost:5432/namngam?schema=public"
```

### 3. ใช้ Cloud Services (แนะนำสำหรับ Production)

#### Supabase (ฟรี):
1. ไปที่ https://supabase.com
2. สร้าง project ใหม่
3. ไปที่ Settings > Database
4. คัดลอก Connection string
5. อัปเดต .env

#### Neon (ฟรี/ไม่ฟรี):
1. ไปที่ https://neon.tech
2. สร้าง project ใหม่
3. คัดลอก Connection string
4. อัปเดต .env

## 🔧 Setup หลังจากมี Database

### 1. อัปเดต .env file:
```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database_name?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# App
NODE_ENV="development"
```

### 2. Generate Prisma Client:
```bash
npx prisma generate
```

### 3. Run Database Migrations:
```bash
npx prisma db push
```

### 4. Seed Data (ถ้าต้องการ):
```bash
npm run seed
```

## 🏃‍♂️ เริ่มต้น Application

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

## 🔍 ตรวจสอบการเชื่อมต่อ

เมื่อ start server ถ้าเห็นข้อความ "Products fetch error" แสดงว่ายังไม่ได้เชื่อมต่อ database ให้ตรวจสอบ:

1. PostgreSQL กำลังทำงานอยู่หรือไม่
2. .env file ถูกต้องหรือไม่
3. Database ถูกสร้างแล้วหรือไม่
4. User/Password ถูกต้องหรือไม่

## 📝 คำสั่งที่มีประโยชน์

```bash
# ดู database status
brew services list postgresql  # macOS
sudo systemctl status postgresql  # Linux

# เข้า database
psql -h localhost -U namngam_user -d namngam

# Reset database (ถ้าต้องการเริ่มใหม่)
npx prisma db push --force-reset

# View database ใน UI
npx prisma studio
```

## ⚠️ ข้อควรระวัง

1. **อย่าใช้ default credentials** ใน production
2. **Backup database** บ่อยๆ
3. **Environment variables** อย่า commit ขึ้น git
4. **Change NEXTAUTH_SECRET** ใน production

## 🎯 ถัดไป

หลังจาก setup database เสร็จแล้ว:
1. Server จะทำงานปกติ (http://localhost:3000)
2. ไม่มี database errors
3. สามารถเพิ่มข้อมูลได้ผ่าน admin panel
4. Frontend ที่ออกแบบใหม่จะแสดงผลอย่างถูกต้อง
