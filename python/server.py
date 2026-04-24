from flask import Flask, render_template, send_from_directory
import os

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), '..'),
    static_url_path='',
    template_folder=os.path.join(os.path.dirname(__file__), '../pages')
)

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
