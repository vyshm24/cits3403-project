import os
import shutil
import tempfile
import threading
import unittest
from pathlib import Path

from flask import Flask
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from werkzeug.security import generate_password_hash
from werkzeug.serving import make_server

from app.extensions import csrf, db, login
from app.forms import LogoutForm
from app.models import Itinerary, ItineraryFavorite, User
from app.routes import main_bp

# Run a temporary Flask server in the background for Selenium to visit.
class LiveServerThread(threading.Thread):
    def __init__(self, app, host="127.0.0.1", port=0):
        super().__init__(daemon=True)
        self.server = make_server(host, port, app)
        self.host = host
        self.port = self.server.server_port
        self.context = app.app_context()
        self.context.push()
 
    def run(self):
        self.server.serve_forever()
 
    def shutdown(self):
        self.server.shutdown()
        self.context.pop()

  # End-to-end portfolio page tests that use a real browser.
class PortfolioSystemTests(unittest.TestCase):
    # Helper to create a Selenium webdriver based on environment or availability.
    def create_webdriver(self):
        browser = os.environ.get("SELENIUM_BROWSER", "").lower().strip()
 
        def make_chrome():
            options = ChromeOptions()
            options.add_argument("--headless=new")
            options.add_argument("--window-size=1400,1000")
            return webdriver.Chrome(options=options)
 
        def make_edge():
            options = EdgeOptions()
            options.add_argument("--headless=new")
            options.add_argument("--window-size=1400,1000")
            return webdriver.Edge(options=options)
 
        def make_firefox():
            options = FirefoxOptions()
            options.add_argument("--headless")
            return webdriver.Firefox(options=options)
 
        browsers = {
            "chrome": make_chrome,
            "edge": make_edge,
            "firefox": make_firefox,
        }
 
        if browser:
            if browser not in browsers:
                raise RuntimeError(
                    "SELENIUM_BROWSER must be one of: chrome, edge, firefox"
                )
            return browsers[browser]()
 
        last_error = None
 
        for make_browser in (make_chrome, make_edge, make_firefox):
            try:
                return make_browser()
            except Exception as error:
                last_error = error
 
        raise RuntimeError(
            "Could not start Chrome, Edge, or Firefox for Selenium tests. "
            "Install one supported browser, or set SELENIUM_BROWSER=chrome/edge/firefox."
        ) from last_error
    
    # Build a temporary app, database, live server, and browser for each test.
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

        self.server = LiveServerThread(self.app)
        self.server.start()
        self.base_url = f"http://{self.server.host}:{self.server.port}"

        self.driver = self.create_webdriver()
        self.wait = WebDriverWait(self.driver, 10)

    # Close the browser and delete all temporary test data.
    def tearDown(self):
        self.driver.quit()
        self.server.shutdown()

        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()

        shutil.rmtree(self.temp_dir, ignore_errors=True)

 # Insert a user directly into the test database.
    def create_user(self, username="testuser", email="test@example.com", password="password123"):
        with self.app.app_context():
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password),
            )
            db.session.add(user)
            db.session.commit()

    # Insert an itinerary for a given user.
    def create_itinerary(self, user_id, title="Test Trip", country="Canada"):
        with self.app.app_context():
            it = Itinerary(
                title=title,
                country=country,
                trip_types=["city"],
                user_id=user_id,
                total_days=2,
                budget_level="$",
                budget_range="$200",
            )
            db.session.add(it)
            db.session.commit()
            return it.id
        
    # Insert a favourite link between a user and an itinerary.
    def create_favourite(self, user_id, itinerary_id):
        with self.app.app_context():
            fav = ItineraryFavorite(user_id=user_id, itinerary_id=itinerary_id)
            db.session.add(fav)
            db.session.commit()

     # Sign in through the browser UI.
    def login_through_ui(self, username="testuser", password="password123"):
        self.driver.get(f"{self.base_url}/signin")
        self.driver.find_element(By.ID, "username").send_keys(username)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.ID, "login-button").click()
        self.wait.until(EC.url_to_be(f"{self.base_url}/"))

    # Scroll to and click an element by ID using JavaScript.
    def click_element_by_id(self, element_id):
        element = self.wait.until(
            EC.presence_of_element_located((By.ID, element_id))
        )
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});", element
        )
        self.driver.execute_script("arguments[0].click();", element)
        return element
    
    # Portfolio page should redirect guests to sign in.
    def test_portfolio_requires_login(self):
        self.driver.get(f"{self.base_url}/portfolio")
        self.wait.until(EC.url_contains("/signin"))
        self.assertIn("/signin", self.driver.current_url)

   # Portfolio page should load successfully for a logged-in user.
    def test_portfolio_loads_for_logged_in_user(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.wait.until(EC.presence_of_element_located((By.ID, "username")))
        self.assertIn("/portfolio", self.driver.current_url)

    # Itinerary cards should appear on the portfolio page.
    def test_itinerary_cards_visible(self):
        self.create_user()
        with self.app.app_context():
            user = User.query.filter_by(username="testuser").first()
            self.create_itinerary(user.id, "My Canada Trip", "Canada")
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "itinerary-card")))
        cards = self.driver.find_elements(By.CLASS_NAME, "itinerary-card")
        self.assertGreater(len(cards), 0)

    # The favourites filter button should be visible on the portfolio page.
    def test_favourites_filter_btn_visible(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        btn = self.wait.until(EC.presence_of_element_located((By.ID, "favourites-filter-btn")))
        self.assertIsNotNone(btn)

    # Clicking the favourites filter should show only favourited itineraries.
    def test_favourites_filter_shows_only_favourites(self):
        self.create_user()
        with self.app.app_context():
            user = User.query.filter_by(username="testuser").first()
            it1_id = self.create_itinerary(user.id, "Favourited Trip", "Canada")
            self.create_itinerary(user.id, "Not Favourited", "Japan")
            self.create_favourite(user.id, it1_id)

        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "itinerary-card")))

        # Initial state: both itineraries are visible
        visible_cards = [
            c for c in self.driver.find_elements(By.CLASS_NAME, "itinerary-card")
            if c.is_displayed()
        ]
        self.assertEqual(len(visible_cards), 2)

        # Turn favourites filter on: only favourited itinerary should be visible
        self.click_element_by_id("favourites-filter-btn")
        self.wait.until(
            lambda driver: len([
                c for c in driver.find_elements(By.CLASS_NAME, "itinerary-card")
                if c.is_displayed()
            ]) == 1
        )

        visible_cards = [
            c for c in self.driver.find_elements(By.CLASS_NAME, "itinerary-card")
            if c.is_displayed()
        ]
        self.assertEqual(len(visible_cards), 1)
        self.assertIn("Favourited Trip", visible_cards[0].text)
        self.assertNotIn("Not Favourited", visible_cards[0].text)

        # Turn favourites filter off: all itineraries should be visible again
        self.click_element_by_id("favourites-filter-btn")
        self.wait.until(
            lambda driver: len([
                c for c in driver.find_elements(By.CLASS_NAME, "itinerary-card")
                if c.is_displayed()
            ]) == 2
        )

        visible_cards = [
            c for c in self.driver.find_elements(By.CLASS_NAME, "itinerary-card")
            if c.is_displayed()
        ]
        self.assertEqual(len(visible_cards), 2)

    # The edit button should be visible on the portfolio page.
    def test_edit_button_visible(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        btn = self.wait.until(EC.presence_of_element_located((By.ID, "global-edit-btn")))
        self.assertIsNotNone(btn)

    # Clicking the edit button should show delete overlays on itinerary cards.
    def test_edit_mode_shows_delete_overlays(self):
        self.create_user()
        with self.app.app_context():
            user = User.query.filter_by(username="testuser").first()
            self.create_itinerary(user.id, "Trip to Delete", "Canada")
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "itinerary-card")))

        self.click_element_by_id("global-edit-btn")

        self.wait.until(
            lambda driver: any(
                o.is_displayed()
                for o in driver.find_elements(By.CLASS_NAME, "card-delete-overlay")
            )
        )

        overlays = [
            o for o in self.driver.find_elements(By.CLASS_NAME, "card-delete-overlay")
            if o.is_displayed()
        ]
        self.assertGreater(len(overlays), 0)

    # Edit mode should be blocked when favourites filter is active.
    def test_edit_blocked_when_favourites_active(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.wait.until(EC.presence_of_element_located((By.ID, "favourites-filter-btn")))

        # Activate favourites filter
        self.click_element_by_id("favourites-filter-btn")

        # Try clicking edit — should trigger alert
        self.driver.execute_script(
            "document.getElementById('global-edit-btn').click();"
        )

        # Check alert appeared
        self.wait.until(EC.alert_is_present())
        alert = self.driver.switch_to.alert
        self.assertIsNotNone(alert.text)
        alert.accept()

    # Change password button should be visible on portfolio page.
    def test_change_password_btn_visible(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        btn = self.wait.until(EC.presence_of_element_located((By.ID, "change-password-btn")))
        self.assertIsNotNone(btn)

    # Change password modal should open when button is clicked.
    def test_change_password_modal_opens(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn") 
        self.click_element_by_id("change-password-btn")
        modal = self.wait.until(EC.visibility_of_element_located((By.ID, "change-password-modal")))
        self.assertTrue(modal.is_displayed())

    # Change password should show error when fields are empty.
    def test_change_password_empty_fields(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        self.click_element_by_id("change-password-btn")
        self.wait.until(EC.visibility_of_element_located((By.ID, "change-password-modal")))
        self.click_element_by_id("save-password-btn")
        error = self.wait.until(EC.visibility_of_element_located((By.ID, "password-error")))
        self.assertIn("fill out", error.text.lower())

    # Change password should show error when wrong current password is entered.
    def test_change_password_wrong_current_password(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        self.click_element_by_id("change-password-btn")
        self.wait.until(EC.visibility_of_element_located((By.ID, "change-password-modal")))
        self.driver.find_element(By.ID, "current-password").send_keys("wrongpassword")
        self.driver.find_element(By.ID, "new-password").send_keys("newpassword123")
        self.driver.find_element(By.ID, "confirm-password").send_keys("newpassword123")
        self.click_element_by_id("save-password-btn")
        error = self.wait.until(EC.visibility_of_element_located((By.ID, "password-error")))
        self.assertIn("incorrect", error.text.lower())

    # Change password should show error when new password is same as current.
    def test_change_password_same_password(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        self.click_element_by_id("change-password-btn")
        self.wait.until(EC.visibility_of_element_located((By.ID, "change-password-modal")))
        self.driver.find_element(By.ID, "current-password").send_keys("password123")
        self.driver.find_element(By.ID, "new-password").send_keys("password123")
        self.driver.find_element(By.ID, "confirm-password").send_keys("password123")
        self.click_element_by_id("save-password-btn")
        error = self.wait.until(EC.visibility_of_element_located((By.ID, "password-error")))
        self.assertIn("different", error.text.lower())

    # Change password should succeed with correct inputs.
    def test_change_password_success(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        self.click_element_by_id("change-password-btn")
        self.wait.until(EC.visibility_of_element_located((By.ID, "change-password-modal")))
        self.driver.find_element(By.ID, "current-password").send_keys("password123")
        self.driver.find_element(By.ID, "new-password").send_keys("newpassword123")
        self.driver.find_element(By.ID, "confirm-password").send_keys("newpassword123")
        self.click_element_by_id("save-password-btn")
        success = self.wait.until(EC.visibility_of_element_located((By.ID, "password-success")))
        self.assertIn("successfully", success.text.lower())

    # Change username button should be visible in settings dropdown.
    def test_change_username_btn_visible(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        btn = self.wait.until(EC.visibility_of_element_located((By.ID, "change-username-btn")))
        self.assertIsNotNone(btn)

    # Change username modal should open when button is clicked.
    def test_change_username_modal_opens(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        self.click_element_by_id("change-username-btn")
        modal = self.wait.until(EC.visibility_of_element_located((By.ID, "change-username-modal")))
        self.assertTrue(modal.is_displayed())

    # Change username should show error when field is empty.
    def test_change_username_empty_field(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        self.click_element_by_id("change-username-btn")
        self.wait.until(EC.visibility_of_element_located((By.ID, "change-username-modal")))
        self.click_element_by_id("save-username-btn")
        error = self.wait.until(EC.visibility_of_element_located((By.ID, "username-error")))
        self.assertIn("fill out", error.text.lower())

    # Change username should show error when username is already taken.
    def test_change_username_already_taken(self):
        self.create_user()
        self.create_user(username="takenuser", email="taken@example.com")
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        self.click_element_by_id("change-username-btn")
        self.wait.until(EC.visibility_of_element_located((By.ID, "change-username-modal")))
        self.driver.find_element(By.ID, "new-username").send_keys("takenuser")
        self.click_element_by_id("save-username-btn")
        error = self.wait.until(EC.visibility_of_element_located((By.ID, "username-error")))
        self.assertIn("taken", error.text.lower())

    # Change username should succeed with a valid new username.
    def test_change_username_success(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/portfolio")
        self.click_element_by_id("settings-btn")
        self.click_element_by_id("change-username-btn")
        self.wait.until(EC.visibility_of_element_located((By.ID, "change-username-modal")))
        self.driver.find_element(By.ID, "new-username").send_keys("newusername123")
        self.click_element_by_id("save-username-btn")
        success = self.wait.until(EC.visibility_of_element_located((By.ID, "username-success")))
        self.assertIn("successfully", success.text.lower())

if __name__ == "__main__":
    unittest.main()