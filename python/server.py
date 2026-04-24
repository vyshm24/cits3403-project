from flask import Flask, render_template
import os

# Initialize Flask app with template and static folder configuration
template_folder = os.path.join(os.path.dirname(__file__), '../pages')
static_folder = os.path.join(os.path.dirname(__file__), '..')

app = Flask(
    __name__,
    static_folder=static_folder,
    static_url_path='',
    template_folder=template_folder
)

# Configure Jinja2 for template auto-reload in development
app.jinja_env.auto_reload = True

@app.route('/')
def home():
    """Serve the home page"""
    return render_template('home-page.html')

@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    return {'error': 'Page not found'}, 404

@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    return {'error': 'Server error'}, 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
