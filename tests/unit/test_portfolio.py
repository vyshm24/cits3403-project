import os
import shutil
import tempfile
import unittest
from pathlib import Path

from flask import Flask
from werkzeug.security import generate_password_hash

from app.extensions import csrf, db, login
from app.forms import LogoutForm
from app.models import Itinerary, ItineraryFavorite, User
from app.routes import main_bp


# Build an isolated app + database so portfolio tests do not touch dev data.
class PortfolioTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.temp_dir, "test.db")
        project_root = Path(__file__).resolve().parents[2]

        self.app = Flask(
            __name__,
            template_folder=str(project_root / "app" / "templates"),
            static_folder=str(project_root / "app" / "static"),
        )
        self.app.config["TESTING"] = True
        self.app.config["SECRET_KEY"] = "test-secret-key"
        self.app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{self.db_path}"
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        self.app.config["WTF_CSRF_ENABLED"] = False

        db.init_app(self.app)
        csrf.init_app(self.app)
        login.init_app(self.app)
        login.login_view = "main.signin"
        self.app.register_blueprint(main_bp)

        @self.app.context_processor
        def inject_logout_form():
            return {"logout_form": LogoutForm()}

        with self.app.app_context():
            db.create_all()

        self.client = self.app.test_client()
        self.create_user()

    # Clean up the temporary database after each test.
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()

        shutil.rmtree(self.temp_dir, ignore_errors=True)

    # Helper to create a user in the database.
    def create_user(self, username="testuser", email="test@example.com", password="password123"):
        with self.app.app_context():
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password),
            )
            db.session.add(user)
            db.session.commit()

    # Put the test user into session so routes treat us as logged in.
    def login_user(self, username="testuser"):
        with self.app.app_context():
            user = User.query.filter_by(username=username).first()

        with self.client.session_transaction() as session:
            session["_user_id"] = str(user.id)
            session["_fresh"] = True

    # Helper to create an itinerary for a given user.
    def create_itinerary(self, user_id, title="Test Trip", country="Australia"):
        with self.app.app_context():
            it = Itinerary(
                title=title,
                country=country,
                trip_types=["city"],
                user_id=user_id,
                total_days=1,
                budget_level="$",
                budget_range="$100",
            )
            db.session.add(it)
            db.session.commit()
            return it.id
        
    # Portfolio page should redirect guests to sign in.
    def test_portfolio_requires_login(self):
        response = self.client.get("/portfolio", follow_redirects=False)

        self.assertEqual(response.status_code, 302)
        self.assertIn("/signin", response.headers["Location"])

    # Portfolio page should load for a logged-in user.
    def test_portfolio_loads_for_logged_in_user(self):
        self.login_user()
        response = self.client.get("/portfolio")

        self.assertEqual(response.status_code, 200)

    # Change password should fail when current password is wrong.
    def test_change_password_wrong_current(self):
        self.login_user()
        response = self.client.post(
            "/api/change-password",
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword123",
                "confirm_password": "newpassword123",
            },
        )

        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertIn("incorrect", data["error"].lower())

    # Change password should fail when new password is same as current.
    def test_change_password_same_password(self):
        self.login_user()
        response = self.client.post(
            "/api/change-password",
            json={
                "current_password": "password123",
                "new_password": "password123",
                "confirm_password": "password123",
            },
        )

        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertIn("different", data["error"].lower())

    # Change password should fail when passwords do not match.
    def test_change_password_mismatch(self):
        self.login_user()
        response = self.client.post(
            "/api/change-password",
            json={
                "current_password": "password123",
                "new_password": "newpassword123",
                "confirm_password": "differentpassword",
            },
        )

        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])

    # Change password should succeed with correct inputs.
    def test_change_password_success(self):
        self.login_user()
        response = self.client.post(
            "/api/change-password",
            json={
                "current_password": "password123",
                "new_password": "newpassword123",
                "confirm_password": "newpassword123",
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])

    # Change username should fail when username is already taken.
    def test_change_username_already_taken(self):
        self.create_user(username="takenuser", email="taken@example.com")
        self.login_user()
        response = self.client.post(
            "/api/change-username",
            json={"new_username": "takenuser"},
        )

        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertIn("taken", data["error"].lower())

    # Change username should fail when new username is same as current.
    def test_change_username_same_as_current(self):
        self.login_user()
        response = self.client.post(
            "/api/change-username",
            json={"new_username": "testuser"},
        )

        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])

    # Change username should succeed with a valid new username.
    def test_change_username_success(self):
        self.login_user()
        response = self.client.post(
            "/api/change-username",
            json={"new_username": "newusername123"},
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])

    # Delete itinerary should succeed for the owner.
    def test_delete_own_itinerary(self):
        self.login_user()
        with self.app.app_context():
            user = User.query.filter_by(username="testuser").first()
            it_id = self.create_itinerary(user.id)

        response = self.client.delete(
            f"/api/itinerary/{it_id}/delete",
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])

    # Delete itinerary should fail when trying to delete someone else's.
    def test_delete_other_users_itinerary(self):
        self.create_user(username="otheruser", email="other@example.com")
        self.login_user()
        with self.app.app_context():
            other = User.query.filter_by(username="otheruser").first()
            it_id = self.create_itinerary(other.id)

        response = self.client.delete(
            f"/api/itinerary/{it_id}/delete",
        )

        self.assertEqual(response.status_code, 403)
        data = response.get_json()
        self.assertFalse(data["success"])

    # Guests should not be able to delete an itinerary.
    def test_delete_itinerary_requires_login(self):
        with self.app.app_context():
            user = User.query.filter_by(username="testuser").first()
            it_id = self.create_itinerary(user.id)

        response = self.client.delete(f"/api/itinerary/{it_id}/delete")

        data = response.get_json()
        self.assertFalse(data["success"])


if __name__ == "__main__":
    unittest.main()
