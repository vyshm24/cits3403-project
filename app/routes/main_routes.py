import re
from decimal import Decimal, InvalidOperation
from pathlib import Path
from uuid import uuid4

from flask_login import (
    current_user as flask_current_user,
    login_required,
    login_user,
    logout_user,
)
from flask import (
    Blueprint,
    app,
    jsonify,
    render_template,
    request,
    redirect,
    url_for,
)
from werkzeug.utils import secure_filename

from app.extensions import db
from app.forms import LogoutForm, SignInForm, SignUpForm, SubmitItineraryForm
from app.models import (
    Itinerary,
    User,
    ItineraryDay,
    ItineraryActivity,
    ItineraryLike,
    ItineraryFavorite,
    ItineraryComment,
)


main_bp = Blueprint("main", __name__)

#country flags
def country_to_flag(country_name: str) -> str:
    FLAGS = {
        "australia": "🇦🇺",
        "canada": "🇨🇦",
        "china": "🇨🇳",
        "france": "🇫🇷",
        "germany": "🇩🇪",
        "indonesia": "🇮🇩",
        "italy": "🇮🇹",
        "japan": "🇯🇵",
        "malaysia": "🇲🇾",
        "new zealand": "🇳🇿",
        "singapore": "🇸🇬",
        "south korea": "🇰🇷",
        "spain": "🇪🇸",
        "switzerland": "🇨🇭",
        "thailand": "🇹🇭",
        "united kingdom": "🇬🇧",
        "united states": "🇺🇸",
        "vietnam": "🇻🇳",
    }
    return FLAGS.get(country_name.lower().strip(), "🌍")

# Static upload folders
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
COVER_UPLOAD_DIR = STATIC_DIR / "uploads" / "cover_photos"
ACTIVITY_UPLOAD_DIR = STATIC_DIR / "uploads" / "activity_photos"
AVATAR_UPLOAD_DIR = STATIC_DIR / "uploads" / "avatar_photos"
BANNER_UPLOAD_DIR = STATIC_DIR / "uploads" / "banner_photos"

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_]+$")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_MIN_LENGTH = 3
USERNAME_MAX_LENGTH = 20
PASSWORD_MIN_LENGTH = 8
MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_TRIP_TYPES = {
    "short-trip",
    "beach",
    "island",
    "city",
    "adventurous",
    "slow-paced",
    "food-centric",
    "cultural",
}
ALLOWED_BUDGET_LEVELS = {"$", "$$", "$$$"}
BUDGET_RANGE_PATTERN = re.compile(
    r"^[\$\u20ac\u00a3\u00a5]\s*((?:0|[1-9]\d*)(?:\.\d{1,2})?)$"
)



def allowed_image_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS
    )


def signup_error_response(message: str, is_ajax_request: bool, form=None):
    if is_ajax_request:
        return jsonify({"success": False, "error": message}), 400
    return render_template("sign-up.html", form=form, error=message)


def submit_error_response(message: str, form=None):
    return render_template("Submit-form-page.html", form=form, error=message)


def get_form_error_message(form, default_message="Please check the submitted form and try again."):
    csrf_token = getattr(form, "csrf_token", None)
    if csrf_token and getattr(csrf_token, "errors", None):
        return csrf_token.errors[0]

    all_errors = [error for errors in form.errors.values() for error in errors]
    if all_errors:
        return all_errors[0]

    return default_message


def get_uploaded_file_size(file_storage) -> int:
    stream = file_storage.stream
    current_position = stream.tell()
    stream.seek(0, 2)
    size = stream.tell()
    stream.seek(current_position)
    return size


def validate_uploaded_image_file(file_storage, label: str):
    if not file_storage or not file_storage.filename:
        return ""

    if not allowed_image_file(file_storage.filename):
        return f"{label} must be a PNG, JPG, JPEG, GIF, or WEBP image."

    if get_uploaded_file_size(file_storage) > MAX_IMAGE_FILE_SIZE:
        return f"{label} must be smaller than 10MB."

    return ""


def activity_has_content(activity_data):
    return any(
        (
            activity_data["title"],
            activity_data["place"],
            activity_data["time"],
            activity_data["description"],
            activity_data["photo"] and activity_data["photo"].filename,
        )
    )


def day_has_content(day_data):
    return any(
        (
            day_data["state"],
            day_data["city"],
            day_data["transport"],
            day_data["transport_other_text"],
            day_data["restaurants"],
            day_data["restaurant_specific"],
            day_data["accommodations"],
            day_data["accommodation_specific"],
            day_data["activities"],
        )
    )


def validate_itinerary_submission(itinerary_data):
    # Validate the main itinerary structure before saving anything.
    if not itinerary_data["trip_title"]:
        return "Trip title is required."

    if not itinerary_data["trip_country"]:
        return "Country is required."

    if itinerary_data["declared_total_days"] < 1 or itinerary_data["total_days"] < 1:
        return "Total travel days must be at least 1."

    if not itinerary_data["trip_types"]:
        return "Please select at least one trip type."

    if any(trip_type not in ALLOWED_TRIP_TYPES for trip_type in itinerary_data["trip_types"]):
        return "Please select a valid trip type."

    if itinerary_data["budget_level"] not in ALLOWED_BUDGET_LEVELS:
        return "Please select a valid budget level."

    if not itinerary_data["budget_range"]:
        return "Estimated cost range is required."

    budget_range_match = BUDGET_RANGE_PATTERN.fullmatch(itinerary_data["budget_range"])
    if not budget_range_match:
        return (
            "Estimated cost range must start with a currency symbol followed by "
            "a number greater than or equal to 0."
        )

    try:
        budget_range_amount = Decimal(budget_range_match.group(1))
    except (InvalidOperation, ValueError):
        return (
            "Estimated cost range must start with a currency symbol followed by "
            "a number greater than or equal to 0."
        )

    if budget_range_amount < 0:
        return (
            "Estimated cost range must start with a currency symbol followed by "
            "a number greater than or equal to 0."
        )

    # Re-check required upload and day/activity fields on the server side
    # so empty submissions cannot bypass the frontend validation rules.
    if not itinerary_data["cover_photo"] or not itinerary_data["cover_photo"].filename:
        return "Cover photo is required."

    cover_photo_error = validate_uploaded_image_file(
        itinerary_data["cover_photo"],
        "Cover photo",
    )
    if cover_photo_error:
        return cover_photo_error

    if not itinerary_data["days"]:
        return "Please fill in at least one day before submitting."

    for day in itinerary_data["days"]:
        if not day["state"]:
            return f"State/Province is required for Day {day['day_number']}."

        if not day["city"]:
            return f"City is required for Day {day['day_number']}."

        if not day["activities"]:
            return f"At least one activity is required for Day {day['day_number']}."

        if not day["transport"]:
            return (
                f"At least one transportation option is required for Day "
                f"{day['day_number']}."
            )

        if "other" in day["transport"] and not day["transport_other_text"]:
            return (
                f"Please specify the other transportation for Day "
                f"{day['day_number']}."
            )

        if not day["restaurants"]:
            return f"At least one restaurant option is required for Day {day['day_number']}."

        if not day["accommodations"]:
            return (
                f"At least one accommodation option is required for Day "
                f"{day['day_number']}."
            )

        for activity in day["activities"]:
            if not activity["place"]:
                return (
                    f"Activity place is required for Day {day['day_number']}, "
                    f"Activity {activity['activity_number']}."
                )

            if not activity["title"]:
                return (
                    f"Activity title is required for Day {day['day_number']}, "
                    f"Activity {activity['activity_number']}."
                )

            if not activity["time"]:
                return (
                    f"Activity time is required for Day {day['day_number']}, "
                    f"Activity {activity['activity_number']}."
                )

            if not activity["description"]:
                return (
                    f"Activity description is required for Day {day['day_number']}, "
                    f"Activity {activity['activity_number']}."
                )

            if not activity["photo"] or not activity["photo"].filename:
                return (
                    f"Photo is required for Day {day['day_number']} Activity "
                    f"{activity['activity_number']}."
                )

            activity_photo_error = validate_uploaded_image_file(
                activity["photo"],
                f"Photo for Day {day['day_number']} Activity {activity['activity_number']}",
            )
            if activity_photo_error:
                return activity_photo_error

    return ""


def save_uploaded_file(file_storage, upload_dir: Path):
    if not file_storage or not file_storage.filename:
        return None

    if validate_uploaded_image_file(file_storage, "File"):
        return None

    upload_dir.mkdir(parents=True, exist_ok=True)

    original_filename = secure_filename(file_storage.filename)
    ext = original_filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid4().hex}.{ext}"

    save_path = upload_dir / filename
    file_storage.save(save_path)

    return str(save_path.relative_to(STATIC_DIR)).replace("\\", "/")


def get_current_user():
    if not flask_current_user.is_authenticated:
        return None
    return flask_current_user


def require_login_json():
    current_user = get_current_user()
    if current_user is None:
        return None, (jsonify({
            "success": False,
            "error": "Please sign in to use this feature.",
            "redirect_url": url_for("main.signin"),
        }), 401)
    return current_user, None


@main_bp.route("/")
def index():
    return render_template("home-page.html", user=get_current_user())


@main_bp.route("/search", methods=["GET"])
def search():
    return render_template("search.html", user=get_current_user())


@main_bp.route("/api/search", methods=["GET"])
def search_api():
    query = request.args.get('query', '').strip()
    search_type = request.args.get('type', 'title')
    results = []
    
    if query:
        if search_type == 'country':
            results = Itinerary.query.filter(
                Itinerary.country.ilike(f'%{query}%')
            ).all()
        else:
            results = Itinerary.query.filter(
                Itinerary.title.ilike(f'%{query}%')
            ).all()
    
    return jsonify([{
        'id': r.id,
        'title': r.title,
        'country': r.country,
        'cover_image_url': r.cover_image_url,
        'total_days': r.total_days,
        'likes_count': len(r.likes),
        'created_at': r.created_at.isoformat() if r.created_at else ''
    } for r in results])


@main_bp.route("/browse")
def browse():
    itineraries = Itinerary.query.all()
    return render_template("browse-itinerary.html", itineraries=itineraries)

# Handle sign-in page rendering and login form submission.
@main_bp.route("/signin", methods=["GET", "POST"])
def signin():
    form = SignInForm()

    # validate_on_submit() checks both request method and CSRF token validity.
    if request.method == "POST" and not form.validate_on_submit():
        error_message = get_form_error_message(form)
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return jsonify({"success": False, "error": error_message}), 400
        return render_template("sign-in.html", form=form, error=error_message)

    if form.validate_on_submit():
        # Read the submitted login credentials from the form.
        username = form.username.data.strip()
        password = form.password.data
        error_message = "Incorrect username or password."
        is_ajax_request = request.headers.get("X-Requested-With") == "XMLHttpRequest"

        # Look up the user account by username.
        user = User.query.filter_by(username=username).first()

        # Return an error if the username does not exist.
        if user is None:
            if is_ajax_request:
                return jsonify({"success": False, "error": error_message}), 401
            return render_template("sign-in.html", form=form, error=error_message)

        # Compare the submitted password with the stored password hash.
        if not user.check_password(password):
            if is_ajax_request:
                return jsonify({"success": False, "error": error_message}), 401
            return render_template("sign-in.html", form=form, error=error_message)

        # Let Flask-Login remember the authenticated user in the session.
        login_user(user)
        redirect_url = url_for("main.index")

        # Return JSON for AJAX login requests.
        if is_ajax_request:
            return jsonify({"success": True, "redirect_url": redirect_url})

        # Redirect normal form submissions to the home page after login.
        return redirect(redirect_url)

    return render_template("sign-in.html", form=form)

# Handle sign-up page rendering, form validation, and new user creation.
@main_bp.route("/signup", methods=["GET", "POST"])
def signup():
    form = SignUpForm()

    # Reject invalid or forged form submissions before custom signup checks.
    if request.method == "POST" and not form.validate_on_submit():
        error_message = get_form_error_message(form)
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return jsonify({"success": False, "error": error_message}), 400
        return render_template("sign-up.html", form=form, error=error_message)

    if form.validate_on_submit():
        # Read and normalize the submitted registration fields.
        username = form.username.data.strip()
        email = form.email.data.strip().lower()
        password = form.password.data
        confirm_password = form.confirm_password.data
        is_ajax_request = request.headers.get("X-Requested-With") == "XMLHttpRequest"

        # Validate the submitted signup data before touching the database.
        if not username:
            return signup_error_response("Username is required.", is_ajax_request, form=form)

        if not (USERNAME_MIN_LENGTH <= len(username) <= USERNAME_MAX_LENGTH):
            return signup_error_response(
                f"Username must be between {USERNAME_MIN_LENGTH} and {USERNAME_MAX_LENGTH} characters.",
                is_ajax_request,
                form=form,
            )

        if not USERNAME_PATTERN.fullmatch(username):
            return signup_error_response(
                "Username can only contain letters, numbers, and underscores.",
                is_ajax_request,
                form=form,
            )

        if not email:
            return signup_error_response("Email is required.", is_ajax_request, form=form)

        if not EMAIL_PATTERN.fullmatch(email):
            return signup_error_response("Please enter a valid email address.", is_ajax_request, form=form)

        if len(password) < PASSWORD_MIN_LENGTH:
            return signup_error_response(
                f"Password must be at least {PASSWORD_MIN_LENGTH} characters long.",
                is_ajax_request,
                form=form,
            )

        if password != confirm_password:
            return signup_error_response("Passwords do not match.", is_ajax_request, form=form)

        # Reject duplicate usernames before creating the new account.
        existing_user = User.query.filter_by(username=username).first()
        if existing_user is not None:
            return signup_error_response("This username is already taken.", is_ajax_request, form=form)

        # Reject duplicate email addresses before creating the new account.
        existing_email = User.query.filter_by(email=email).first()
        if existing_email is not None:
            return signup_error_response("This email is already registered.", is_ajax_request, form=form)

        # Create the new user model with a hashed password.
        new_user = User(
            username=username,
            email=email,
        )
        new_user.set_password(password)

        # Stage the new user record for insertion into the database.
        db.session.add(new_user)

        try:
            # Save the new user account to the database.
            db.session.commit()
            print("COMMIT SUCCESS")
        except Exception as e:
            # Undo the pending transaction if the database write fails.
            db.session.rollback()
            print("COMMIT ERROR:", e)

        redirect_url = url_for("main.signin")

        # Return JSON for AJAX sign-up requests.
        if is_ajax_request:
            return jsonify({"success": True, "redirect_url": redirect_url})

        # Redirect normal form submissions to the sign-in page after registration.
        return redirect(redirect_url)

    return render_template("sign-up.html", form=form)

# Clear the current session and log the user out.
@main_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    form = LogoutForm()

    if not form.validate_on_submit():
        return redirect(url_for("main.index"))

    # Reset current_user back to Flask-Login's anonymous user.
    logout_user()
    return redirect(url_for("main.index"))


# Show the itinerary submission form and process submitted itinerary data.
@main_bp.route("/submit", methods=["GET", "POST"])
@login_required
def submit_itinerary():
    form = SubmitItineraryForm()

    if request.method == "POST" and not form.validate_on_submit():
        error_message = get_form_error_message(form)
        return submit_error_response(error_message, form=form)

    if form.validate_on_submit():
        # Load the current signed-in user from Flask-Login.
        current_user = get_current_user()

        # Redirect back to sign-in if the stored session user no longer exists.
        if current_user is None:
            return redirect(url_for("main.signin"))

        # Read the top-level itinerary fields from the submitted form.
        trip_title = request.form.get("trip_title", "").strip()
        trip_country = request.form.get("trip_country", "").strip()
        total_days_raw = request.form.get("total_days", "0").strip()
        declared_total_days = int(total_days_raw) if total_days_raw.isdigit() else 0

        # Read uploaded files and multi-select trip type values.
        cover_photo = request.files.get("cover_photo")
        trip_types = [
            trip_type.strip()
            for trip_type in request.form.getlist("trip_type")
            if trip_type.strip()
        ]

        # Scan the submitted field names to detect which day numbers were posted.
        day_numbers = set()
        day_key_pattern = re.compile(r"day(\d+)")

        for key in list(request.form.keys()) + list(request.files.keys()):
            match = day_key_pattern.search(key)
            if match:
                day_numbers.add(int(match.group(1)))

        # Keep the total day count aligned with both the declared and posted day data.
        inferred_total_days = max(day_numbers) if day_numbers else 0
        total_days = max(declared_total_days, inferred_total_days)

        # Save the uploaded cover image and keep its relative file path.
        cover_photo_path = save_uploaded_file(cover_photo, COVER_UPLOAD_DIR)

        # Build one dictionary that collects all submitted itinerary data.
        itinerary_data = {
            "user": current_user.username,
            "trip_title": trip_title,
            "trip_country": trip_country,
            "total_days": total_days,
            "declared_total_days": declared_total_days,
            "trip_types": trip_types,
            "budget_level": request.form.get("budget_level", "").strip(),
            "budget_range": request.form.get("budget_range", "").strip(),
            "cover_photo": cover_photo,
            "cover_photo_path": cover_photo_path,
            "days": [],
        }

        # Collect each submitted day and its nested fields.
        for day_number in range(1, total_days + 1):
            day_data = {
                "day_number": day_number,
                "state": request.form.get(f"state_day{day_number}", "").strip(),
                "city": request.form.get(f"city_day{day_number}", "").strip(),
                "transport": request.form.getlist(f"transport_day{day_number}[]"),
                "transport_other_text": request.form.get(
                    f"transport_other_text_day{day_number}", ""
                ).strip(),
                "restaurants": request.form.getlist(
                    f"restaurant_dropdown_day{day_number}"
                ),
                "restaurant_specific": request.form.get(
                    f"restaurant_specific_day{day_number}", ""
                ).strip(),
                "accommodations": request.form.getlist(
                    f"accommodation_dropdown_day{day_number}"
                ),
                "accommodation_specific": request.form.get(
                    f"accommodation_specific_day{day_number}", ""
                ).strip(),
                "activities": [],
            }

            activity_number = 1

            while True:
                # Build the dynamic field names for the current activity row.
                title_key = f"activity_title_day{day_number}_{activity_number}"
                place_key = f"activity_place_day{day_number}_{activity_number}"
                time_key = f"time_day{day_number}_{activity_number}"
                description_key = f"activity_day{day_number}_{activity_number}"
                photo_key = f"activity_photo_day{day_number}_{activity_number}"

                # Stop reading activities when no fields exist for the next activity number.
                has_activity_fields = any(
                    key in request.form or key in request.files
                    for key in (
                        title_key,
                        place_key,
                        time_key,
                        description_key,
                        photo_key,
                    )
                )

                if not has_activity_fields:
                    break

                # Save the uploaded activity photo and keep its relative file path.
                activity_photo = request.files.get(photo_key)
                activity_photo_path = save_uploaded_file(
                    activity_photo,
                    ACTIVITY_UPLOAD_DIR,
                )

                # Store the submitted values for one activity entry.
                activity_data = {
                    "activity_number": activity_number,
                    "title": request.form.get(title_key, "").strip(),
                    "place": request.form.get(place_key, "").strip(),
                    "time": request.form.get(time_key, "").strip(),
                    "description": request.form.get(description_key, "").strip(),
                    "photo": activity_photo,
                    "photo_path": activity_photo_path,
                }

                # Only keep activities that contain at least some user-entered content.
                if activity_has_content(activity_data):
                    day_data["activities"].append(activity_data)
                activity_number += 1

            # Only keep days that contain at least some user-entered content.
            if day_has_content(day_data):
                itinerary_data["days"].append(day_data)

        # Run one server-side validation pass before creating database rows.
        validation_error = validate_itinerary_submission(itinerary_data)
        if validation_error:
            return submit_error_response(validation_error, form=form)

        # Create the top-level itinerary database record after validation passes.
        itinerary = Itinerary(
            title=itinerary_data["trip_title"],
            country=itinerary_data["trip_country"],
            trip_types=itinerary_data["trip_types"],
            user_id=current_user.id,
            cover_image_url=itinerary_data["cover_photo_path"],
            total_days=itinerary_data["total_days"],
            budget_level=itinerary_data["budget_level"],
            budget_range=itinerary_data["budget_range"],
        )

        # Create and attach each itinerary day to the main itinerary.
        for day in itinerary_data["days"]:
            itinerary_day = ItineraryDay(
                day_number=day["day_number"],
                state=day["state"] or None,
                city=day["city"] or None,
                transport=day["transport"],
                transport_other_text=day["transport_other_text"] or None,
                restaurants=day["restaurants"],
                restaurant_specific=day["restaurant_specific"] or None,
                accommodations=day["accommodations"],
                accommodation_specific=day["accommodation_specific"] or None,
            )

            # Create and attach each activity to its corresponding day.
            for activity in day["activities"]:
                itinerary_activity = ItineraryActivity(
                    activity_name=activity["title"],
                    place=activity["place"] or None,
                    time=activity["time"] or None,
                    description=activity["description"] or None,
                    photo_url=activity["photo_path"],
                )

                itinerary_day.activities.append(itinerary_activity)

            itinerary.days.append(itinerary_day)

        # Stage the completed itinerary tree for insertion into the database.
        db.session.add(itinerary)

        try:
            # Save the itinerary, days, and activities in one transaction.
            db.session.commit()
        except Exception as e:
            # Roll back the transaction if any database write fails.
            db.session.rollback()
            print("COMMIT ERROR:", e)
            raise

        return redirect(url_for("main.browse"))

    return render_template("Submit-form-page.html", form=form)

#Browse itineraries page (can fetch data)
@main_bp.route("/api/itineraries")
def get_itineraries():
    itineraries = Itinerary.query.all()

    data = []
    for it in itineraries:
        data.append({
            "id": it.id,
            "title": it.title,
            "country": it.country,
            "cover": it.cover_image_url,
            "days": it.total_days,
        })

    return jsonify(data)

# View itinerary details page (fetch itinerary data) - can be used for both view and edit pages
@main_bp.route("/api/itinerary/<int:id>")
def get_itinerary(id):
    it = Itinerary.query.get_or_404(id)

    result = {
        "title": it.title,
        "country": it.country,
        "author": it.user.username if it.user else "Unknown",
        "date": it.created_at.strftime("%Y-%m-%d") if it.created_at else "",
        "tags": it.trip_types or [],
        "overview": f"{it.total_days} days itinerary in {it.country}.",
        "coverPhoto": "/static/" + it.cover_image_url if it.cover_image_url else "",
        "days": []
    }

    for day in it.days:
        day_data = {
         "day": day.day_number,
         "state": day.state or "",
         "city": day.city or "",
         "transport": day.transport or [],
         "restaurants": day.restaurants or [],
         "restaurant_specific": day.restaurant_specific or "",
          "accommodations": day.accommodations or [],
         "accommodation_specific": day.accommodation_specific or "",
         "activities": []
        }

        for act in day.activities:
            day_data["activities"].append({
                "title": act.activity_name,
                "description": act.description,
                "time": act.time,
                "place": act.place,
                "image": "/static/" + act.photo_url if act.photo_url else ""
            })

        result["days"].append(day_data)

    return jsonify(result)

# View itinerary details page interactions (likes, favorites, comments)
@main_bp.route("/api/itinerary/<int:id>/interactions", methods=["GET"])
def get_itinerary_interactions(id):
    Itinerary.query.get_or_404(id)
    current_user = get_current_user()

    comments = (
        ItineraryComment.query
        .filter_by(itinerary_id=id)
        .order_by(ItineraryComment.created_at.desc())
        .all()
    )

    return jsonify({
        "like_count": ItineraryLike.query.filter_by(itinerary_id=id).count(),
        "favorite_count": ItineraryFavorite.query.filter_by(itinerary_id=id).count(),
        "comment_count": len(comments),
        "liked_by_me": bool(
            current_user and ItineraryLike.query.filter_by(
                itinerary_id=id,
                user_id=current_user.id,
            ).first()
        ),
        "favorited_by_me": bool(
            current_user and ItineraryFavorite.query.filter_by(
                itinerary_id=id,
                user_id=current_user.id,
            ).first()
        ),
        # Only the front-end know which comments can display the Delete button.
        "comments": [
            {
                "id": comment.id,
                "content": comment.content,
                "author": comment.user.username if comment.user else "Unknown",
                "author_avatar_url": (
                    "/static/" + comment.user.avatar_url.replace("\\", "/")
                    if comment.user and comment.user.avatar_url
                    else ""
                ),
                "created_at": comment.created_at.strftime("%Y-%m-%d %H:%M"),
                "can_delete": bool(current_user and comment.user_id == current_user.id),
            }
            for comment in comments
        ],
    })


@main_bp.route("/api/itinerary/<int:id>/like", methods=["POST"])
def toggle_itinerary_like(id):
    Itinerary.query.get_or_404(id)
    current_user, error_response = require_login_json()
    if error_response:
        return error_response

    existing_like = ItineraryLike.query.filter_by(
        itinerary_id=id,
        user_id=current_user.id,
    ).first()

    if existing_like:
        db.session.delete(existing_like)
        liked = False
    else:
        db.session.add(ItineraryLike(itinerary_id=id, user_id=current_user.id))
        liked = True

    db.session.commit()

    return jsonify({
        "success": True,
        "liked_by_me": liked,
        "like_count": ItineraryLike.query.filter_by(itinerary_id=id).count(),
    })


@main_bp.route("/api/itinerary/<int:id>/favorite", methods=["POST"])
def toggle_itinerary_favorite(id):
    Itinerary.query.get_or_404(id)
    current_user, error_response = require_login_json()
    if error_response:
        return error_response

    existing_favorite = ItineraryFavorite.query.filter_by(
        itinerary_id=id,
        user_id=current_user.id,
    ).first()

    if existing_favorite:
        db.session.delete(existing_favorite)
        favorited = False
    else:
        db.session.add(ItineraryFavorite(itinerary_id=id, user_id=current_user.id))
        favorited = True

    db.session.commit()

    return jsonify({
        "success": True,
        "favorited_by_me": favorited,
        "favorite_count": ItineraryFavorite.query.filter_by(itinerary_id=id).count(),
    })

# View itinerary details page interactions (add comment)
@main_bp.route("/api/itinerary/<int:id>/comments", methods=["POST"])
def create_itinerary_comment(id):
    Itinerary.query.get_or_404(id)

    current_user, error_response = require_login_json()
    if error_response:
        return error_response

    payload = request.get_json(silent=True) or {}
    content = payload.get("content", "").strip()

    if not content:
        return jsonify({
            "success": False,
            "error": "Comment cannot be empty."
        }), 400

    comment = ItineraryComment(
        itinerary_id=id,
        user_id=current_user.id,
        content=content,
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify({
        "success": True,
        "comment_count": ItineraryComment.query.filter_by(
            itinerary_id=id
        ).count(),
        "comment": {
            "id": comment.id,
            "content": comment.content,
            "author": current_user.username,
            "author_avatar_url": (
                "/static/" + current_user.avatar_url.replace("\\", "/")
                if current_user.avatar_url
                else ""
            ),
            "created_at": comment.created_at.strftime("%Y-%m-%d %H:%M"),
            "can_delete": True,
        },
    }), 201

# View itinerary details page interactions (delete own comment)
@main_bp.route("/api/itinerary/comments/<int:comment_id>", methods=["DELETE"])
def delete_itinerary_comment(comment_id):
    current_user, error_response = require_login_json()
    if error_response:
        return error_response

    comment = ItineraryComment.query.get_or_404(comment_id)

    if comment.user_id != current_user.id:
        return jsonify({
            "success": False,
            "error": "You can only delete your own comments."
        }), 403

    itinerary_id = comment.itinerary_id

    db.session.delete(comment)
    db.session.commit()

    return jsonify({
        "success": True,
        "comment_count": ItineraryComment.query.filter_by(
            itinerary_id=itinerary_id
        ).count()
    })


# View itinerary details page
@main_bp.route("/itinerary/<int:id>")
def view_itinerary(id):
    itinerary = Itinerary.query.get_or_404(id)
    return render_template("view-itinerary.html", itinerary=itinerary)


# Portfolio page
@main_bp.route("/api/upload-avatar", methods=["POST"])
@login_required
def upload_avatar():
    file = request.files.get("avatar")
    path = save_uploaded_file(file, AVATAR_UPLOAD_DIR)
    if not path:
        return jsonify({"success": False, "error": "Invalid file"}), 400
    user = get_current_user()
    user.avatar_url = path
    db.session.commit()
    return jsonify({"success": True, "url": "/static/" + path.replace("\\", "/")})

@main_bp.route("/api/upload-banner", methods=["POST"])
@login_required
def upload_banner():
    file = request.files.get("banner")
    path = save_uploaded_file(file, BANNER_UPLOAD_DIR)
    if not path:
        return jsonify({"success": False, "error": "Invalid file"}), 400
    user = get_current_user()
    user.banner_url = path
    db.session.commit()
    return jsonify({"success": True, "url": "/static/" + path.replace("\\", "/")})

# Portfolio page — delete own itinerary
@main_bp.route("/api/itinerary/<int:id>/delete", methods=["DELETE"])
def delete_itinerary(id):
    current_user, error_response = require_login_json()
    if error_response:
        return error_response

    it = Itinerary.query.get_or_404(id)

    if it.user_id != current_user.id:
        return jsonify({"success": False, "error": "You can only delete your own itineraries."}), 403

    db.session.delete(it)
    db.session.commit()

    return jsonify({"success": True})

@main_bp.route("/portfolio")
@login_required
def portfolio():
    current_user = get_current_user()
    
    # User's own itineraries only (shown by default)
    own_itineraries = Itinerary.query.filter_by(
        user_id=current_user.id
    ).all()

    # Itineraries favourited by the user (including other people's)
    favourited_ids = [f.itinerary_id for f in current_user.favorites]
    favourited_itineraries = Itinerary.query.filter(
        Itinerary.id.in_(favourited_ids),
        Itinerary.user_id != current_user.id
    ).all()

    # All itineraries to pass to template (own + favourited others)
    own_ids = {it.id for it in own_itineraries}
    all_itineraries = own_itineraries + [it for it in favourited_itineraries if it.id not in own_ids]

    return render_template(
        "portfolio-page.html",
        user=current_user,
        itineraries=all_itineraries,
        favourited_ids=favourited_ids,
        own_itinerary_ids=[it.id for it in own_itineraries]
    )
# Change password
@main_bp.route("/api/change-password", methods=["POST"])
@login_required
def change_password():
    current_user = get_current_user()
    payload = request.get_json(silent=True) or {}
    
    current_password = payload.get("current_password", "")
    new_password = payload.get("new_password", "")
    confirm_password = payload.get("confirm_password", "")

    if not current_user.check_password(current_password):
        return jsonify({"success": False, "error": "Current password is incorrect."}), 400
    
    if current_password == new_password:
        return jsonify({"success": False, "error": "New password must be different from your current password."}), 400

    if len(new_password) < PASSWORD_MIN_LENGTH:
        return jsonify({"success": False, "error": f"Password must be at least {PASSWORD_MIN_LENGTH} characters."}), 400

    if new_password != confirm_password:
        return jsonify({"success": False, "error": "Passwords do not match."}), 400

    current_user.set_password(new_password)
    db.session.commit()

    return jsonify({"success": True})


# Change username
@main_bp.route("/api/change-username", methods=["POST"])
@login_required
def change_username():
    current_user = get_current_user()
    payload = request.get_json(silent=True) or {}

    new_username = payload.get("new_username", "").strip()

    if not new_username:
        return jsonify({"success": False, "error": "Username is required."}), 400

    if not (USERNAME_MIN_LENGTH <= len(new_username) <= USERNAME_MAX_LENGTH):
        return jsonify({"success": False, "error": f"Username must be between {USERNAME_MIN_LENGTH} and {USERNAME_MAX_LENGTH} characters."}), 400

    if not USERNAME_PATTERN.fullmatch(new_username):
        return jsonify({"success": False, "error": "Username can only contain letters, numbers, and underscores."}), 400

    if new_username == current_user.username:
        return jsonify({"success": False, "error": "New username must be different from your current one."}), 400

    existing = User.query.filter_by(username=new_username).first()
    if existing:
        return jsonify({"success": False, "error": "This username is already taken."}), 400

    current_user.username = new_username
    db.session.commit()

    return jsonify({"success": True})