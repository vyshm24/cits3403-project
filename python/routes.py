
from app import app
from flask import render_template

app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route('/')
def home():
    return render_template('home-page.html')






@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404  # optional nicer page

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)