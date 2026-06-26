import extensions
extensions.db.create_all = lambda: print('skipped db.create_all')
from app import create_app
create_app()
print('create_app succeeded (db.create_all skipped)')
