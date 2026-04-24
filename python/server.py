from flask import Flask, render_template
import os

template_dir = os.path.join(os.path.dirname(__file__), '../templates')

app = Flask(__name__, template_folder=template_dir)

app.config['TEMPLATES_AUTO_RELOAD'] = True
app.jinja_env.auto_reload = True

@app.route('/')
def home():
    return render_template('home-page.html')

@app.errorhandler(404)
def page_not_found(e):
    return {'error': 'Page not found'}, 404

@app.errorhandler(500)
def server_error(e):
    return {'error': 'Server error'}, 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)