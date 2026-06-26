import traceback
import extensions
orig = extensions.db.create_all

def wrapped():
    try:
        return orig()
    except Exception:
        traceback.print_exc()
        raise

extensions.db.create_all = wrapped

from app import create_app
create_app()
print('create_app finished')
