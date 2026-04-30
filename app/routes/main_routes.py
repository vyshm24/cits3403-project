from flask import Blueprint, app, jsonify, render_template, request, redirect, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models import User


main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    return render_template("home-page.html")

@main_bp.route("/search")
def search():
    return render_template("search.html")


@main_bp.route("/signin", methods=["GET", "POST"])
def signin():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        error_message = "Incorrect username or password."
        is_ajax_request = request.headers.get("X-Requested-With") == "XMLHttpRequest"

        user = User.query.filter_by(username=username).first()
        if user is None:
            if is_ajax_request:
                return jsonify({"success": False, "error": error_message}), 401
            return render_template("sign-in.html", error=error_message)

        if not check_password_hash(user.password_hash, password):
            if is_ajax_request:
                return jsonify({"success": False, "error": error_message}), 401
            return render_template("sign-in.html", error=error_message)

        session["user"] = user.username
        redirect_url = url_for("main.index")

        if is_ajax_request:
            return jsonify({"success": True, "redirect_url": redirect_url})

        return redirect(redirect_url)

    return render_template("sign-in.html")

@main_bp.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm-password", "")
        is_ajax_request = request.headers.get("X-Requested-With") == "XMLHttpRequest"

        if password != confirm_password:
            if is_ajax_request:
                return jsonify({"success": False, "error": "Passwords do not match."}), 400
            return render_template("sign-up.html", error="Passwords do not match.")

        existing_user = User.query.filter_by(username=username).first()
        if existing_user is not None:
            if is_ajax_request:
                return jsonify({"success": False, "error": "This username is already taken."}), 400
            return render_template("sign-up.html", error="This username is already taken.")

        new_user = User(
            username=username,
            password_hash=generate_password_hash(password)
        )
        db.session.add(new_user)
        db.session.commit()

        redirect_url = url_for("main.signin")

        if is_ajax_request:
            return jsonify({"success": True, "redirect_url": redirect_url})

        return redirect(redirect_url)

    return render_template("sign-up.html")


@main_bp.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("main.signin"))


@main_bp.route("/submit", methods=["GET", "POST"])
def submit_itinerary():
    if not session.get("user"):
        return redirect(url_for("main.signin"))
    
    if request.method == "POST":
        trip_title = request.form.get("trip_title")
        trip_country = request.form.get("trip_country")
        total_days = request.form.get("total_days")

        print("Trip title:", trip_title)
        print("Country:", trip_country)
        print("Total days:", total_days)

        return redirect(url_for("main.index"))

    return render_template("Submit-form-page.html")

