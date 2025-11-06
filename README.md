# NAMNGAM ORIGINAL

> Multi-language Product Showcase & Blog Platform with Admin CMS

A modern, SEO-optimized e-commerce platform built with Next.js 14, featuring multilingual support (Lao, Thai, Chinese, English), admin dashboard, and a beautiful pink minimal design.

## 🌟 Features

### Frontend (Public)
- ✅ Multi-language support (Lao, Thai, Chinese, English)
- ✅ Responsive pink minimal design
- ✅ Product catalog with categories
- ✅ Blog/Articles system
- ✅ Contact page
- ✅ Quick Links floating widget (WhatsApp, Facebook, LINE)
- ✅ SEO optimized
- ✅ Smooth animations with Framer Motion

### Admin Dashboard
- ✅ Secure authentication with NextAuth.js
- ✅ Products CRUD with image upload
- ✅ Articles CRUD with rich text editor (TipTap)
- ✅ Categories management
- ✅ **Media Library** - Upload, manage, and optimize images
- ✅ **Image Upload System** - Drag & drop with Sharp optimization
- ✅ Site settings (logo, backgrounds, contact info)
- ✅ User management
- ✅ Multilingual content management

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Internationalization**: next-intl
- **Rich Text Editor**: TipTap
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Notifications**: react-hot-toast

## 📦 Installation

### Prerequisites
- Node.js 20+ (LTS)
- PostgreSQL 15+
- npm or pnpm

### Setup

1. **Clone & Install**
```bash
cd namngam-original
npm install --legacy-peer-deps
```

2. **Database Setup**
```bash
# Update .env with your PostgreSQL credentials
DATABASE_URL="postgresql://user:password@localhost:5432/namngam?schema=public"

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

3. **Create First Admin User**
```bash
npm run create-admin
```
Follow the prompts to create your first admin user.

4. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🗂️ Project Structure

```
namngam-original/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── uploads/               # Uploaded images
├── src/
│   ├── app/
│   │   ├── [locale]/          # Public pages (i18n)
│   │   │   ├── page.tsx       # Home
│   │   │   ├── about/
│   │   │   ├── products/
│   │   │   ├── articles/
│   │   │   └── contact/
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── articles/
│   │   │   ├── categories/
│   │   │   └── settings/
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   ├── admin/             # Admin components
│   │   └── home/              # Home page sections
│   ├── lib/                   # Utilities
│   ├── messages/              # Translation files
│   ├── styles/
│   └── types/
├── .env                       # Environment variables
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 🌐 Multi-language

Languages supported:
- 🇱🇦 Lao (ລາວ) - Default
- 🇹🇭 Thai (ไทย)
- 🇨🇳 Chinese (中文)
- 🇬🇧 English

Routes:
- `/` - Lao (default)
- `/th` - Thai
- `/zh` - Chinese
- `/en` - English

## 🔐 Authentication

Admin login: `/admin/login`

Default credentials need to be created manually in database:
```sql
-- Use bcrypt to hash password
INSERT INTO "User" (id, email, password, name, role) VALUES
('user123', 'admin@namngam.com', '$2a$10$...', 'Admin', 'SUPER_ADMIN');
```

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize the pink theme:
```typescript
colors: {
  pink: {
    500: '#FF1493',  // Primary pink
    // ...
  }
}
```

### Fonts
Edit `src/styles/globals.css` to change fonts

### Site Settings
Manage via Admin Dashboard → Settings

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)

## 🔧 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

## 🚀 Deployment

### VPS Deployment

1. **Install Dependencies on VPS**
```bash
# Install Node.js, PostgreSQL, Nginx, PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql nginx
sudo npm install -g pm2
```

2. **Clone & Setup**
```bash
cd /var/www
git clone <your-repo> namngam
cd namngam
npm install --legacy-peer-deps
```

3. **Configure Environment**
```bash
cp .env.example .env
nano .env
# Update DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
```

4. **Setup Database**
```bash
npm run db:generate
npm run db:push
```

5. **Build & Start**
```bash
npm run build
pm2 start npm --name "namngam" -- start
pm2 save
pm2 startup
```

6. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **SSL with Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 📊 SEO Features

- Dynamic metadata per page
- Open Graph tags
- Sitemap.xml (to be generated)
- Robots.txt (to be added)
- Structured data (JSON-LD)
- Image optimization with Next.js Image

## 🎯 TODO

- [x] Image upload system with Sharp optimization
- [x] Media library page
- [x] Admin user creation script
- [x] Sitemap.xml generation
- [x] Robots.txt
- [ ] Implement Products CRUD API
- [ ] Implement Articles CRUD API
- [ ] Create seed data script
- [ ] Implement search functionality
- [ ] Add pagination
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Write tests

## 📝 License

© 2024 NAMNGAM ORIGINAL. All rights reserved.

## 👥 Support

For support, email: info@namngam.com

---

Built with ❤️ using Next.js 14
