from flask import Blueprint, render_template, request, redirect, url_for


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    return render_template("home-page.html")

@main_bp.route("/signin", methods=["GET", "POST"])
def signin():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        print("Username:", username)
        print("Password:", password)

        return redirect(url_for("main.index"))

    return render_template("sign-in.html")

@main_bp.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm-password")

        print(username, password, confirm_password)
        return redirect(url_for("main.signin"))

    return render_template("sign-up.html")


@main_bp.route("/submit", methods=["GET", "POST"])
def submit_itinerary():
    if request.method == "POST":
        trip_title = request.form.get("trip_title")
        trip_country = request.form.get("trip_country")
        total_days = request.form.get("total_days")

        print("Trip title:", trip_title)
        print("Country:", trip_country)
        print("Total days:", total_days)

        return redirect(url_for("main.index"))

    return render_template("Submit-form-page.html")
