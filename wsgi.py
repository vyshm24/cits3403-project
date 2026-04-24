"""
WSGI entry point for production deployment
Usage: gunicorn python.wsgi:app
"""
import os
import sys

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from python.server import app

if __name__ == '__main__':
    app.run()
