TASKFLOW - Team Task Manager
=============================

LIVE URL
--------
Frontend: https://taskflow-frontend-vgwf.onrender.com
Backend API: https://taskflow-production-cb2a.up.railway.app

GITHUB
------
https://github.com/amanSin1/taskflow


TECH STACK
----------
Backend:  Django + Django REST Framework
Auth:     JWT (djangorestframework-simplejwt)
Database: PostgreSQL (Railway managed)
Frontend: React + Vite
State:    Zustand
Routing:  React Router v6
Hosting:  Railway (backend) + Render (frontend)


FEATURES
--------
- JWT Authentication (Register / Login / Token Refresh)
- Role-based access control (Admin / Member per project)
- Project creation and team management
- Task creation with assignment, priority, status, due date
- Overdue task detection
- Dashboard with task summary (total, in progress, done, overdue)
- Filter tasks by status inside a project
- Admin-only: delete tasks, add/remove members


API ENDPOINTS
-------------
POST   /api/auth/register/              - Register new user
POST   /api/auth/login/                 - Login, returns JWT tokens
POST   /api/auth/refresh/               - Refresh access token
GET    /api/auth/me/                    - Get current user info

GET    /api/projects/                   - List user's projects
POST   /api/projects/                   - Create project
GET    /api/projects/{id}/              - Project detail
PUT    /api/projects/{id}/              - Update project (admin only)
DELETE /api/projects/{id}/              - Delete project (admin only)
POST   /api/projects/{id}/members/      - Add member (admin only)
DELETE /api/projects/{id}/members/      - Remove member (admin only)

GET    /api/projects/{id}/tasks/        - List tasks for a project
POST   /api/projects/{id}/tasks/        - Create task
GET    /api/tasks/{id}/                 - Task detail
PUT    /api/tasks/{id}/                 - Update task (assignee or admin)
DELETE /api/tasks/{id}/                 - Delete task (admin only)

GET    /api/dashboard/                  - Summary of user's tasks


ROLE-BASED ACCESS
-----------------
Project Admin:  full access — manage members, all tasks, project settings
Project Member: can create tasks, update their assigned tasks, view project


HOW TO RUN LOCALLY
------------------
Backend:
  cd taskflow
  python -m venv venv
  venv\Scripts\activate
  pip install -r requirements.txt
  python manage.py migrate
  python manage.py runserver

Frontend:
  cd frontend
  npm install
  npm run dev
  Visit http://localhost:5173


ENVIRONMENT VARIABLES (Railway)
--------------------------------
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=.railway.app
DATABASE_URL=auto-set by Railway Postgres plugin
CORS_ALLOWED_ORIGINS=https://taskflow-frontend-vgwf.onrender.com
