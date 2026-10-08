import sys
import os

# Add root directory to sys.path so modules like app, db, config can be resolved
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from urllib.parse import urlparse, parse_qs, urlencode
from app import app


class VercelRouterMiddleware:
    """
    WSGI middleware to normalize URL path on Vercel Serverless Functions.
    Vercel rewrites pass the route via __route__ query parameter or
    HTTP_X_FORWARDED_URI / HTTP_X_INVOKE_PATH.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        target_path = None

        # 1. Check if Vercel rewrite passed the route via query string
        query = environ.get('QUERY_STRING', '')
        if '__route__' in query:
            params = parse_qs(query)
            route_val = params.pop('__route__', [None])[0]
            if route_val:
                # Clean up path (e.g. "//" -> "/")
                while route_val.startswith('//'):
                    route_val = route_val[1:]
                target_path = route_val if route_val else '/'
                # Restore remaining user query params without __route__
                environ['QUERY_STRING'] = urlencode(params, doseq=True)

        # 2. Check Vercel proxy headers if query parameter wasn't present
        if not target_path:
            orig_uri = (
                environ.get('HTTP_X_FORWARDED_URI')
                or environ.get('HTTP_X_INVOKE_PATH')
                or environ.get('x-forwarded-uri')
            )
            if orig_uri:
                parsed = urlparse(orig_uri)
                if parsed.path and parsed.path not in ('/api/index', '/api/index.py'):
                    target_path = parsed.path
                if parsed.query and not environ.get('QUERY_STRING'):
                    environ['QUERY_STRING'] = parsed.query

        if target_path:
            environ['PATH_INFO'] = target_path
        else:
            # 3. If PATH_INFO is still /api/index or /api/index.py, normalize to /
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

