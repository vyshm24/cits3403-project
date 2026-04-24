# Travel Social Media Website Project (Flask Version)

## Project Overview

This is a group project for building a travel website for post and view itineraries.
The frontend uses HTML / CSS / JavaScript (jQuery + AJAX), and the backend uses Flask + SQLAlchemy to enable dynamic data interaction and database management.

---

## 🧱 Project Structure & Git Branch Strategy

This project uses two main branches:

**main** → Stable version (final submission / demo-ready)
**dev** → Development branch (daily team collaboration)

## ❓ Why use this structure?
Prevent breaking the main version
Allow multiple people to work safely at the same time
Keep a stable version for demo/submission
Make the project more organized and professional

👉 In short:
Develop in your own branch → merge to dev → merge to main

---
Example of file strcuture looks like:
```
dev/
├── app.py                # Flask backend entry point
├── templates/            # HTML pages
├── static/               # Static resources (CSS / JS / images)
│   ├── css/
│   ├── js/
│   └── images/
├── models/               # Database models (optional)
├── requirements.txt      # Project dependencies
├── README.md
```

---

## Environment Setup for First Run

### 1️⃣ Pull the repository

```
git pull
git pull origin dev
```

### 2️⃣ Create a virtual environment

```
python -m venv venv
```

### 3️⃣ Activate the virtual environment

* Windows:

```
venv\Scripts\activate
```

* Mac/Linux:

```
source venv/bin/activate
```

### 4️⃣ Install dependencies

```
pip install -r requirements.txt
```

### 5️⃣ Run the project

```
python app.py
```

---

## ✏️ Development Steps

1. Modify code (Flask / HTML / JS / database, etc.)
2. Test your changes
3. Ensure there are no errors

---

## ⚠️ Important Notes (Very Important!!!)

### ❌ DO NOT commit the following:

* `venv/` (virtual environment)
* `__pycache__/`
* `.db` database files (unless specifically required e.g.demo)

👉 Make sure `.gitignore` is properly configured

---

## 📦 Environment Synchronization

👉 Dependencies are managed via `requirements.txt`

### When you install new packages:

```
pip freeze > requirements.txt
```

👉 Then push the updated file!

---

### For other team members:

```
pip install -r requirements.txt
```

---

## 🚀 Tech Stack

* Frontend: HTML / CSS / JavaScript / jQuery / AJAX
* Backend: Flask
* Database: SQLite / MySQL
* ORM: SQLAlchemy