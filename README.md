# UNIBOT — Smart University Chatbot

> **Seamlessly connects students anytime, anywhere.**  
> A 24/7 AI-powered chatbot for course details, schedules, and administrative procedures.

Unified Next.js application with integrated API routes, Prisma ORM, and AI-powered chat.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Database:** SQLite (via Prisma ORM) — swap to PostgreSQL for production
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **AI:** Groq SDK (Llama 3.3-70b) with smart local fallback
- **Styling:** Tailwind CSS 4 + custom CSS design system

---

## Quick Start

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed          # populate demo data
npm run dev              # http://localhost:3000
```

---

## Demo Accounts

| Role    | Username       | Password     |
|---------|----------------|--------------|
| Admin   | admin          | admin123     |
| Faculty | prof_sharma    | faculty123   |
| Faculty | prof_kumar     | faculty123   |
| Student | student1       | student123   |
| Student | student2       | student123   |

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/          # Next.js API routes (auth, chat, courses)
│   │   ├── dashboard/    # Student/faculty dashboard
│   │   ├── login/
│   │   └── register/
│   └── lib/
│       ├── auth.ts       # JWT helpers
│       ├── chat-service.ts  # AI chat + Groq integration
│       ├── prisma.ts     # Prisma client singleton
│       └── api.ts        # Client-side API wrapper
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── dev.db            # SQLite database
└── scripts/
    └── seed.ts           # Database seeder
```

---

## Environment Variables

Copy `.env.local` and fill in:

```env
DATABASE_URL="file:d:/your-path/prisma/dev.db"
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
GROQ_API_KEY="your-groq-key"   # optional, has smart fallback
```

---

## Deploy on Vercel

The `vercel.json` at root is pre-configured. Set the environment variables in your Vercel dashboard and deploy.
