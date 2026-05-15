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
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.ui import WebDriverWait
from werkzeug.security import generate_password_hash
from werkzeug.serving import make_server

from app.extensions import csrf, db, login
from app.forms import LogoutForm
from app.models import Itinerary, User
from app.routes import main_bp


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


class SubmitSystemTests(unittest.TestCase):
    def create_webdriver(self):
        browser = os.environ.get("SELENIUM_BROWSER", "").lower().strip()

        def make_chrome():
            options = ChromeOptions()
            options.add_argument("--headless=new")
            options.add_argument("--window-size=1400,1000")
            options.add_argument("--disable-gpu")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument(
                f"--user-data-dir={os.path.join(self.browser_profile_dir, 'chrome')}"
            )
            return webdriver.Chrome(options=options)

        def make_edge():
            options = EdgeOptions()
            options.add_argument("--headless=new")
            options.add_argument("--window-size=1400,1000")
            options.add_argument("--disable-gpu")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument(
                f"--user-data-dir={os.path.join(self.browser_profile_dir, 'edge')}"
            )
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
        self.browser_profile_dir = os.path.join(self.temp_dir, "browser-profile")
        os.environ["SE_CACHE_PATH"] = os.path.join(self.temp_dir, "selenium-cache")
        self.db_path = os.path.join(self.temp_dir, "test.db")
        self.cover_photo_path = os.path.join(self.temp_dir, "cover.png")
        self.activity_photo_path = os.path.join(self.temp_dir, "activity.png")
        Path(self.cover_photo_path).write_bytes(b"fake cover image")
        Path(self.activity_photo_path).write_bytes(b"fake activity image")
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

    def login_through_ui(self, username="testuser", password="password123"):
        self.driver.get(f"{self.base_url}/signin")

        self.driver.find_element(By.ID, "username").send_keys(username)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.ID, "login-button").click()

        self.wait.until(EC.url_to_be(f"{self.base_url}/"))

    def open_submit_page_as_logged_in_user(self):
        self.create_user()
        self.login_through_ui()
        self.driver.get(f"{self.base_url}/submit")
        self.wait.until(EC.visibility_of_element_located((By.ID, "trip-title")))

    def select_country(self, country_name):
        self.wait.until(
            lambda driver: driver.find_elements(
                By.CSS_SELECTOR,
                f"#trip-country option[value='{country_name}']",
            )
        )
        country_select = Select(self.driver.find_element(By.ID, "trip-country"))
        country_select.select_by_value(country_name)
        self.driver.execute_script(
            """
            const select = arguments[0];
            select.dispatchEvent(new Event('change', { bubbles: true }));
            """,
            self.driver.find_element(By.ID, "trip-country"),
        )

    def fill_minimum_valid_submit_form(self):
        self.driver.find_element(By.ID, "trip-title").send_keys("Perth Weekend")
        self.select_country("Australia")
        self.driver.find_element(By.ID, "cover-photo").send_keys(self.cover_photo_path)
        self.driver.find_element(By.ID, "total-days").send_keys("1")
        Select(self.driver.find_element(By.ID, "state-day1")).select_by_value(
            "Western Australia"
        )
        Select(self.driver.find_element(By.ID, "trip-type")).select_by_value("city")
        Select(self.driver.find_element(By.ID, "budget-level")).select_by_value("$$")
        self.driver.find_element(By.ID, "budget-range").send_keys("$500")
        self.driver.find_element(By.ID, "city-day1").send_keys("Perth")
        self.driver.execute_script(
            """
            const transport = document.getElementById('transport-flight-day1');
            transport.checked = true;
            transport.dispatchEvent(new Event('change', { bubbles: true }));
            """
        )
        Select(self.driver.find_element(By.ID, "restaurant-dropdown-day1")).select_by_value(
            "Cafe"
        )
        Select(self.driver.find_element(By.ID, "accommodation-dropdown-day1")).select_by_value(
            "Hotel"
        )
        self.driver.find_element(By.ID, "activity-title-day1-1").send_keys(
            "Kings Park Visit"
        )
        self.driver.find_element(By.ID, "activity-place-day1-1").send_keys("Kings Park")
        self.driver.find_element(By.ID, "activity-photo-day1-1").send_keys(
            self.activity_photo_path
        )
        # Set time input value using JavaScript to ensure events are triggered
        time_input = self.driver.find_element(By.ID, "time-day1-1")
        self.driver.execute_script(
            """
            const el = arguments[0];
            el.removeAttribute("disabled");
            el.value = "09:00";
            el.setAttribute("value", "09:00");
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
            """,
            time_input,
        )

        self.assertEqual(time_input.get_attribute("value"), "09:00")
        #---------------------------------------------------------------
        self.driver.find_element(By.ID, "activity-day1-1").send_keys(
            "Walk around the park and city lookout."
        )
    #self.driver.find_element(By.ID, "activity-title-day1-2").send_keys(
    def submit_form_and_accept_confirmation(self):
        self.driver.find_element(By.ID, "submit-itinerary-button").click()
        confirmation = self.wait.until(EC.alert_is_present())
        confirmation.accept()
#----------------------------------------------------------------
    def submit_form_without_client_validation(self):
        self.driver.execute_script(
            """
            document.querySelector('form[action$="/submit"]').submit();
            """
        )

    def test_submit_page_requires_login(self):
        self.driver.get(f"{self.base_url}/submit")

        self.wait.until(EC.url_contains("/signin"))
        self.assertIn("/signin", self.driver.current_url)
        self.assertIn("Sign In", self.driver.page_source)

    def test_submit_system_success(self):
        self.open_submit_page_as_logged_in_user()
        self.fill_minimum_valid_submit_form()

        self.submit_form_and_accept_confirmation()

        self.wait.until(EC.url_to_be(f"{self.base_url}/browse"))
        self.assertEqual(self.driver.current_url, f"{self.base_url}/browse")

        with self.app.app_context():
            itinerary = Itinerary.query.one()
            self.assertEqual(itinerary.title, "Perth Weekend")
            self.assertEqual(itinerary.country, "Australia")
            self.assertEqual(itinerary.total_days, 1)

    def test_submit_system_missing_title_shows_error(self):
        self.open_submit_page_as_logged_in_user()
        self.fill_minimum_valid_submit_form()

        self.driver.find_element(By.ID, "trip-title").clear()
        self.driver.execute_script(
            """
            const titleInput = document.getElementById('trip-title');
            titleInput.removeAttribute('required');
            """,
        )

        self.submit_form_without_client_validation()

        error_box = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".bg-red-50"))
        )
        self.assertIn("Trip title is required.", error_box.text)
        self.assertIn("/submit", self.driver.current_url)


if __name__ == "__main__":
    unittest.main()
