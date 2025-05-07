from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# # Add this function to recreate all tables
# def recreate_tables():
#     # Explicitly import models to ensure they're registered with Base
#     from app import models

#     print("Dropping all tables...")
#     Base.metadata.drop_all(bind=engine)
#     print("Creating all tables...")
#     Base.metadata.create_all(bind=engine)
#     print("Database schema reset complete")

#     # Verify table structure
#     from sqlalchemy import inspect
#     inspector = inspect(engine)
#     for table_name in inspector.get_table_names():
#         print(f"\nTable: {table_name}")
#         for column in inspector.get_columns(table_name):
#             print(f"  - {column['name']}: {column['type']}")

# # Uncomment and run this when you need to reset the database
# if __name__ == "__main__":
#     recreate_tables()
