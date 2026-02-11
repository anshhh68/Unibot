# 🤖 UNIBOT — Smart University Chatbot

> **Seamlessly connects students anytime, anywhere.**  
> A 24/7 AI-powered chatbot for course details, schedules, and administrative procedures.

Built with the **Antigravity** boilerplate — Django backend + Next.js frontend.

---

## 🏗️ Architecture

```
d:\Unibot\
├── backend/             # Django REST API
│   ├── accounts/        # User model with roles (Student/Faculty/Admin)
│   ├── courses/         # Course, Enrollment, Assignment, Feedback models
│   ├── chat/            # Chat AI service + Query/Response models
│   └── unibot_backend/  # Django project settings
│
└── frontend/            # Next.js 16 (React + TypeScript)
    └── src/
        ├── app/         # Pages (Landing, Login, Register, Dashboard)
        └── lib/         # API client + Auth context
```

## 🚀 Quick Start

### 1. Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python seed_data.py          # Creates demo data
python manage.py runserver 8000
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### 3. Open in Browser

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin/

---

## 🔑 Demo Credentials

| Role    | Username      | Password     |
|---------|---------------|--------------|
| Admin   | `admin`       | `admin123`   |
| Faculty | `prof_sharma` | `faculty123` |
| Faculty | `prof_kumar`  | `faculty123` |
| Student | `student1`    | `student123` |
| Student | `student2`    | `student123` |

---

## 📡 API Endpoints

| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| POST   | `/api/auth/register/`             | Register new user              |
| POST   | `/api/auth/login/`                | JWT login                      |
| POST   | `/api/auth/token/refresh/`        | Refresh JWT token              |
| GET    | `/api/auth/profile/`              | Get current user profile       |
| POST   | `/api/chat/`                      | Send message to AI chatbot     |
| GET    | `/api/chat/history/`              | Get chat history               |
| GET    | `/api/courses/`                   | List courses (role-filtered)   |
| GET    | `/api/courses/<id>/`              | Get course detail              |
| GET    | `/api/courses/enrollments/`       | Student's enrollments          |
| POST   | `/api/courses/faculty/update-syllabus/` | Faculty updates syllabus |
| GET/POST | `/api/courses/faculty/assignments/` | Faculty assignments          |
| GET/POST | `/api/courses/feedback/`        | Submit/view feedback           |

---

## 🎨 Features

### Student View
- 💬 **WhatsApp-style Chat** — Natural language queries with AI responses
- 📚 **Course Dashboard** — View enrolled courses and details
- ⭐ **Feedback** — Rate the chatbot experience

### Faculty View
- 📋 **Syllabus Editor** — Update course syllabi (reflected in chatbot context)
- 📝 **Assignment Manager** — Create and manage assignments
- 📚 **Course Overview** — View courses taught

### Technical
- 🔐 JWT Authentication with auto-refresh
- 👤 Role-based access control (Student/Faculty/Admin)
- 🤖 OpenAI integration with course-context awareness
- 🌙 Dark theme with glassmorphism UI
- 📱 Responsive design

---

## 🤖 AI Configuration

To enable OpenAI responses, update `backend/.env`:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Without an API key, UNIBOT uses an intelligent fallback that responds based on actual course data from the database.

---

## 🗄️ Database

Default: **SQLite** (zero-config development).

To switch to **PostgreSQL**, update `backend/unibot_backend/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'unibot',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---


## 🚀 Deployment (Vercel)

This project is configured to deploy both Frontend and Backend on Vercel with a single URL.

1.  Connect your GitHub repository to Vercel.
2.  Import the project.
3.  Ensure **Root Directory** is empty (default).
4.  **Environment Variables:**
    *   `SECRET_KEY`: Random string for Django security.
    *   `DEBUG`: `False` (for production).
    *   `DATABASE_URL`: (Optional) Connection string for a PostgreSQL database (e.g., Neon, Supabase, Vercel Postgres).
        *   *Note: Without this, the app uses ephemeral SQLite which resets on every deployment.*
5.  Click **Deploy**.

The app will be available at your Vercel URL (e.g., `https://unibot.vercel.app`).
*   Frontend: `/`
*   Backend API: `/api/`

---

*Built with ❤️ using the Antigravity Boilerplate*

