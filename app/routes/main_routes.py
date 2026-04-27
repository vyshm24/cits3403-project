from flask import Blueprint, render_template


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    return render_template("home-page.html")


@main_bp.route("/home-page")
def home_page():
    return render_template("home-page.html")


@main_bp.route("/browse-itinerary")
def browse_itinerary():
    return render_template("browse-itinerary.html")


@main_bp.route("/countries")
def countries():
    return render_template("countries.html")


@main_bp.route("/portfolio-page")
def portfolio_page():
    return render_template("portfolio-page.html")


@main_bp.route("/post-interface")
def post_interface():
    return render_template("post-interface.html")


@main_bp.route("/search")
def search():
    return render_template("search.html")


@main_bp.route("/sign-in")
def sign_in():
    return render_template("sign-in.html")


@main_bp.route("/sign-up")
def sign_up():
    return render_template("sign-up.html")


@main_bp.route("/submit-form-page")
def submit_form_page():
    return render_template("Submit-form-page.html")


@main_bp.route("/submit-form-page-1")
def submit_form_page_1():
    return render_template("Submit-form-page_1.html")


@main_bp.route("/submit-form-page-2")
def submit_form_page_2():
    return render_template("Submit-form-page_2.html")


@main_bp.route("/view-it-demo")
def view_it_demo():
    return render_template("View-It-Demo.html")
