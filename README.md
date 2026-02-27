# TalkCore

TalkCore is a modern full-stack chat application built with Django (REST API) and Angular.

The goal of this project is to develop a scalable, production-ready real-time communication platform with clean architecture, authentication and modular frontend structure.

## 🚀 Tech Stack

### Backend

- Python
- Django
- Django REST Framework

### Frontend

- Angular
- TypeScript
- SCSS

## 📂 Project Structure

```
talkcore/
├── backend/
├── frontend/
└── README.md
```

## ⚙️ Local Development Setup

### 1️⃣ Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs on:
http://127.0.0.1:8000

### 2️⃣ Frontend

```bash
cd frontend/app
npm install
ng serve
```

Frontend runs on:
http://localhost:4200

## 🔒 Environment Variables

Sensitive values must not be committed.

Create a .env file based on:
.env.example

## 🎯 Project Goals

- Clean architecture
- Scalable backend structure
- Authentication system
- Modular Angular frontend
- Production-ready setup (Docker planned)

## 📌 Status

Project is currently in initial setup phase.
