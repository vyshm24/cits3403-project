from app.extensions import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Itinerary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    country = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref=db.backref("itineraries", lazy=True))
    cover_image_url = db.Column(db.String(255), nullable=True)
    total_days = db.Column(db.Integer, nullable=False)  
    budget_level = db.Column(db.String(50), nullable=False)
    budget_range = db.Column(db.String(50), nullable=False)

