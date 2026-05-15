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
from app.models import Itinerary, ItineraryActivity, ItineraryDay, User
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


# End-to-end browse and view itinerary tests that use a real browser.
class BrowseViewSystemTests(unittest.TestCase):
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

    def tearDown(self):
        self.driver.quit()
        self.server.shutdown()

        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()

        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def create_user(
        self,
        username="testuser",
        email="test@example.com",
        password="password123",
    ):
        with self.app.app_context():
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password),
            )
            db.session.add(user)
            db.session.commit()

    def create_itinerary(self, title="Perth Weekend", country="Australia"):
        with self.app.app_context():
            user = User.query.filter_by(username="testuser").first()

            if user is None:
                user = User(
                    username="testuser",
                    email="test@example.com",
                    password_hash=generate_password_hash("password123"),
                )
                db.session.add(user)
                db.session.commit()

            itinerary = Itinerary(
                title=title,
                country=country,
                trip_types=["city", "food-centric"],
                user_id=user.id,
                cover_image_url="uploads/cover_photos/test-cover.png",
                total_days=1,
                budget_level="$$",
                budget_range="$500-$800",
            )

            day = ItineraryDay(
                day_number=1,
                state="WA",
                city="Perth",
                transport=["walk", "train"],
                restaurants=["Cafe"],
                accommodations=["Hotel"],
            )

            activity = ItineraryActivity(
                activity_name="Kings Park Visit",
                place="Kings Park",
                time="09:00",
                description="Walk around the park and city lookout.",
                photo_url="uploads/activity_photos/test-activity.png",
            )

            day.activities.append(activity)
            itinerary.days.append(day)

            db.session.add(itinerary)
            db.session.commit()

            return itinerary.id

    def login_through_ui(self, username="testuser", password="password123"):
        self.driver.get(f"{self.base_url}/signin")

        self.driver.find_element(By.ID, "username").send_keys(username)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.ID, "login-button").click()

        self.wait.until(EC.url_to_be(f"{self.base_url}/"))

    def click_element_by_id(self, element_id):
        element = self.wait.until(
            EC.presence_of_element_located((By.ID, element_id))
        )
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});",
            element,
        )
        self.driver.execute_script("arguments[0].click();", element)
        return element

    # Browse should show itinerary cards in the browser.
    def test_browse_page_displays_itinerary_cards(self):
        self.create_itinerary()

        self.driver.get(f"{self.base_url}/browse")

        self.assertIn("Explore Travel Plans", self.driver.page_source)
        self.assertIn("Perth Weekend", self.driver.page_source)
        self.assertIn("Australia", self.driver.page_source)
        self.assertIn("testuser", self.driver.page_source)

    # Browse should show the empty state when no itineraries exist.
    def test_browse_empty_state(self):
        self.driver.get(f"{self.base_url}/browse")

        self.assertIn("No itineraries yet", self.driver.page_source)
        self.assertIn("Create Itinerary", self.driver.page_source)

    # Clicking an itinerary card should open the itinerary detail page.
    def test_click_itinerary_card_opens_view_page(self):
        itinerary_id = self.create_itinerary()

        self.driver.get(f"{self.base_url}/browse")

        card_link = self.wait.until(
            EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "Perth Weekend"))
        )
        card_link.click()

        self.wait.until(EC.url_contains(f"/itinerary/{itinerary_id}"))
        self.assertIn(f"/itinerary/{itinerary_id}", self.driver.current_url)
        self.assertIn("Daily Timeline", self.driver.page_source)
        self.assertIn("Like", self.driver.page_source)
        self.assertIn("Favorite", self.driver.page_source)
        self.assertIn("Comments", self.driver.page_source)

    # The view page should render its static structure before API data is loaded.
    def test_view_page_loads_static_structure(self):
        itinerary_id = self.create_itinerary()

        self.driver.get(f"{self.base_url}/itinerary/{itinerary_id}")

        self.wait.until(EC.visibility_of_element_located((By.ID, "like-btn")))
        self.assertIn("Daily Timeline", self.driver.page_source)
        self.assertTrue(self.driver.find_element(By.ID, "comment-box").is_displayed())
        self.assertTrue(self.driver.find_element(By.ID, "map").is_displayed())

    # JavaScript should fetch the API data and populate the itinerary title/country/author.
    def test_view_page_populates_itinerary_data_from_api(self):
        itinerary_id = self.create_itinerary()

        self.driver.get(f"{self.base_url}/itinerary/{itinerary_id}")

        title = self.wait.until(
            EC.text_to_be_present_in_element((By.ID, "title"), "Perth Weekend")
        )
        self.assertTrue(title)

        self.assertIn("Australia", self.driver.find_element(By.ID, "country").text)
        self.assertIn("testuser", self.driver.find_element(By.ID, "author").text)
        self.assertIn("1 days itinerary in Australia.", self.driver.find_element(By.ID, "overview").text)

        timeline = self.wait.until(
            EC.visibility_of_element_located((By.ID, "timeline"))
        )
        self.assertIn("Kings Park Visit", timeline.text)
        self.assertIn("Walk around the park and city lookout.", timeline.text)

    # Guests who click like should be redirected to signin.
    def test_unauthenticated_like_redirects_to_signin(self):
        itinerary_id = self.create_itinerary()

        self.driver.get(f"{self.base_url}/itinerary/{itinerary_id}")

        self.wait.until(EC.text_to_be_present_in_element((By.ID, "like-count"), "0"))
        self.click_element_by_id("like-btn")

        self.wait.until(EC.url_contains("/signin"))
        self.assertIn("/signin", self.driver.current_url)

    # Logged-in users should be able to like and unlike an itinerary.
    def test_logged_in_user_can_like_and_unlike(self):
        self.create_user()
        itinerary_id = self.create_itinerary()

        self.login_through_ui()
        self.driver.get(f"{self.base_url}/itinerary/{itinerary_id}")

        self.wait.until(EC.text_to_be_present_in_element((By.ID, "like-count"), "0"))

        self.click_element_by_id("like-btn")
        self.wait.until(EC.text_to_be_present_in_element((By.ID, "like-btn"), "Liked"))
        self.assertIn("1", self.driver.find_element(By.ID, "like-btn").text)

        self.click_element_by_id("like-btn")
        self.wait.until(EC.text_to_be_present_in_element((By.ID, "like-btn"), "Like"))
        self.assertIn("0", self.driver.find_element(By.ID, "like-btn").text)

    # Logged-in users should be able to post a comment.
    def test_logged_in_user_can_post_comment(self):
        self.create_user()
        itinerary_id = self.create_itinerary()

        self.login_through_ui()
        self.driver.get(f"{self.base_url}/itinerary/{itinerary_id}")

        self.wait.until(
            EC.text_to_be_present_in_element((By.ID, "title"), "Perth Weekend")
        )

        result = self.driver.execute_async_script(
            """
            const done = arguments[0];
            const itineraryId = window.location.pathname.split("/").pop();

            fetch(`/api/itinerary/${itineraryId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: "Amazing itinerary!" })
            })
            .then(async response => {
                done({
                    status: response.status,
                    data: await response.json()
                });
            })
            .catch(error => {
                done({
                    error: String(error)
                });
            });
        """)

        self.assertEqual(result["status"], 201)
        self.assertTrue(result["data"]["success"])

        self.driver.refresh()

        self.wait.until(
            lambda driver: "Amazing itinerary!" in driver.find_element(By.ID, "comments-list").text
        )

        comments_list = self.driver.find_element(By.ID, "comments-list")
        self.assertIn("Amazing itinerary!", comments_list.text)
        self.assertIn("1", self.driver.find_element(By.ID, "comment-count").text)

    # Empty comments should not be submitted and should show a browser-side message.
    def test_empty_comment_shows_validation_message(self):
        self.create_user()
        itinerary_id = self.create_itinerary()

        self.login_through_ui()
        self.driver.get(f"{self.base_url}/itinerary/{itinerary_id}")

        self.wait.until(EC.visibility_of_element_located((By.ID, "comment-btn")))
        self.click_element_by_id("comment-btn")

        message = self.wait.until(
            EC.visibility_of_element_located((By.ID, "interaction-message"))
        )

        self.assertIn("Please enter a comment before posting.", message.text)


if __name__ == "__main__":
    unittest.main()