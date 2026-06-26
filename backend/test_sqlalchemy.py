from config import Config
from sqlalchemy import create_engine
print('URI=', Config.SQLALCHEMY_DATABASE_URI)
engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
with engine.connect() as conn:
    print('sqlalchemy connect ok')
