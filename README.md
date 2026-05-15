# Travel Social Media Website

Travel Social Media Website is a Flask-based web application for sharing travel itineraries. Users can create an account, sign in, submit their own travel plans, browse itineraries from other users, view detailed day-by-day travel routes, like or favourite posts, and leave comments.

The goal of this project is to create a web application where travel information can be uploaded, viewed, and shared. Users upload data by submitting itineraries with destinations, activities, transport options, accommodation, restaurants, and photos. Other users can then explore this data through browse, search, itinerary detail, map, like, favourite, and comment features.

---

# Overview

This project is designed as a travel planning and sharing platform. A user can register an account, publish a trip plan, and interact with travel posts created by other users.

The main pages of the application include:

- **Home**: The landing page of the website. Users can access the main features and search for itineraries.
- **Sign Up / Sign In**: Pages where users can create an account or log in.
- **Submit Itinerary**: A form where logged-in users can upload a complete travel itinerary, including trip details, daily activities, transport, restaurants, accommodation, and photos.
- **Browse Itineraries**: A page where users can explore travel itineraries posted by others.
- **View Itinerary**: A detailed itinerary page showing the trip overview, daily timeline, activity cards, photos, comments, likes, favourites, and an interactive Google Map.
- **Search**: A page that allows users to search for itineraries by title or other supported search types.
- **Portfolio / Profile**: A user profile page for viewing a user's posted itineraries and saved travel-related information.
- **Like, Favourite, and Comment Features**: Users can interact with itineraries and share feedback.

To relate these pages to the required project views:

- **Introductory view**: The Home page introduces the travel website and provides navigation to the main features.
- **Upload data view**: The Submit Itinerary page allows users to upload travel itinerary data and images.
- **Visualise data view**: The Browse and View Itinerary pages display uploaded travel data in card, timeline, and map formats.
- **Share data view**: The itinerary detail page allows users to share feedback through likes, favourites, and comments.

---

# Technologies Used

## Frontend

- HTML
- CSS
- JavaScript
- AJAX / Fetch API
- Google Maps JavaScript API

## Backend

- Python
- Flask
- Jinja2
- Werkzeug
- Flask-WTF
- WTForms

## Database and ORM

- SQLite for local development and testing
- SQLAlchemy
- Flask-SQLAlchemy
- Flask-Migrate
- Alembic

## Testing

- Python `unittest`
- Selenium system tests
- Chrome / Edge / Firefox headless browser testing

---

# Running Unit & Selenium Tests

Run unit tests:

```bash
python -m unittest discover -s tests/unit -v
```

Run Selenium system tests:

```bash
python -m unittest discover -s tests/system -v
```

The Selenium tests run in a real browser in headless mode. The project supports Chrome, Edge, or Firefox depending on the browser installed on your machine.

Recommended example:

```bash
SELENIUM_BROWSER=chrome python -m unittest discover -s tests/system -v
```

Other supported options:

```bash
SELENIUM_BROWSER=edge python -m unittest discover -s tests/system -v
SELENIUM_BROWSER=firefox python -m unittest discover -s tests/system -v
```

Windows PowerShell example:

```powershell
$env:SELENIUM_BROWSER="edge"
python -m unittest discover -s tests/system -v
```

---

# How to Run

## Prerequisites

- Python 3
- pip
- A modern web browser
- A Google Maps API key for the itinerary map feature

## Installation

### 1. Clone or pull the repository

If this is your first time setting up the project, clone the repository:

```bash
git clone <repository-url>
cd <repository-folder>
```

If you already have the repository, pull the latest version:

```bash
git pull
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

### 4. Install the required packages

```bash
pip install -r requirements.txt
```

### 5. Create environment variables

Create a `.env` file in the project root directory:

```env
SECRET_KEY=dev-secret-key
GOOGLE_MAPS_API_KEY=Your_API_Here
```

The Google Maps API key is required because the itinerary detail page loads the map key from environment variables instead of hardcoding it in `view-itinerary.html`.

### 6. Run the application

```bash
python app.py
```

### 7. Open the website

Open your browser and go to:

```text
http://127.0.0.1:5001
```

You can then sign up, sign in, submit an itinerary, browse existing itineraries, view itinerary details, and interact with posts.

---