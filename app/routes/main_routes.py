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
        return redirect(url_for("main.index"))
    return render_template("sign-up.html")

@main_bp.route("/submit", methods=["GET", "POST"])
def submit_itinerary():
    if request.method == "POST":
        return redirect(url_for("main.index"))
    return render_template("Submit-form-page.html")
