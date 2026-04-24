"""
Utility functions and helpers for the Flask application
"""
from flask import url_for as flask_url_for

def inject_config():
    """
    Context processor to inject app configuration into templates
    Makes app config available in all Jinja templates
    """
    return {
        'app_name': 'Travel Blog',
        'app_version': '1.0.0'
    }

def url_for(*args, **kwargs):
    """
    Wrapper around Flask's url_for for use in templates
    """
    return flask_url_for(*args, **kwargs)
