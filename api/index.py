import sys
import os

# Add root directory to sys.path so modules like app, db, config can be resolved
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app import app


class VercelRouterMiddleware:
    """
    WSGI middleware to normalize URL path on Vercel Serverless Functions.
    Vercel rewrites often deliver requests with the function prefix (e.g. /api/index.py or /api/index),
    which causes Flask to return a 404 because those routes do not exist.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')

        # Strip /api/index.py or /api/index prefix
        for prefix in ('/api/index.py', '/api/index'):
            if path == prefix:
                environ['PATH_INFO'] = '/'
                break
            elif path.startswith(prefix + '/'):
                environ['PATH_INFO'] = path[len(prefix):]
                break

        return self.wsgi_app(environ, start_response)


# Wrap Flask WSGI app with Vercel router normalizer
app.wsgi_app = VercelRouterMiddleware(app.wsgi_app)

if __name__ == "__main__":
    app.run()

