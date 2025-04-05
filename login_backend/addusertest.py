from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import User, pwd_context

DATABASE_URL = "postgresql://postgres@localhost/login"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Create password hash using the updated algorithm
hashed_password = pwd_context.hash("test123")

# Create test user
test_user = User(username="testuser", hashed_password=hashed_password)
db.add(test_user)
db.commit()
db.close()

print("Test user created!")
