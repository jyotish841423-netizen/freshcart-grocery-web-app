import sys
import os

# Add root directory to sys.path so modules like app, db, config can be resolved
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from urllib.parse import urlparse
from app import app


class VercelRouterMiddleware:
    """
    WSGI middleware to normalize URL path on Vercel Serverless Functions.
    Vercel rewrites incoming URLs to /api/index, putting the original path in
    HTTP_X_FORWARDED_URI or HTTP_X_INVOKE_PATH.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        # 1. Check Vercel proxy headers for the true requested URL
        orig_uri = (
            environ.get('HTTP_X_FORWARDED_URI')
            or environ.get('HTTP_X_INVOKE_PATH')
            or environ.get('x-forwarded-uri')
        )
        if orig_uri:
            parsed = urlparse(orig_uri)
            if parsed.path:
                environ['PATH_INFO'] = parsed.path
            if parsed.query:
                environ['QUERY_STRING'] = parsed.query

        # 2. If PATH_INFO is still /api/index or /api/index.py, normalize to /
        path = environ.get('PATH_INFO', '')
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

