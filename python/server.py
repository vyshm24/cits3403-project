from flask import Flask, render_template, url_for
import os

# Get project root (one level above /python)
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(
    __name__,
    template_folder=os.path.join(base_dir, 'templates'),
    static_folder=os.path.join(base_dir, 'static')
)

app.config['TEMPLATES_AUTO_RELOAD'] = True


# -------------------
# Routes
# -------------------

@app.route('/')
def home():
    return render_template('home-page.html')

@app.route('/search')
def search():
    return render_template('search.html')  # when you move it into templates

@app.route('/countries')
def countries():
    return render_template('countries.html')

@app.route('/post')
def post():
    return render_template('Submit-form-page.html')

@app.route('/browse')
def browse():
    return render_template('browse-itinerary.html')


# -------------------
# Error handlers
# -------------------

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404  # optional nicer page

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500


# -------------------
# Run app
# -------------------

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)