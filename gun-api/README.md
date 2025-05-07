# Gun and Narcotic API Testing Guide

## Running the Application

1. Make sure you have all dependencies installed:
   ```
   pip install fastapi uvicorn sqlalchemy python-dotenv
   ```

2. Run the application:
   ```
   uvicorn app.main:app --reload
   ```

## Testing with Swagger UI

FastAPI automatically generates interactive API documentation:

1. Open your browser and go to http://localhost:8000/docs
2. You'll see all available endpoints with interactive UI to test them:
   - GET /guns/ - List all guns
   - GET /guns/{gun_id} - Get a specific gun
   - POST /load-initial-data/ - Load sample gun data
   - GET /narcotics/ - List all narcotics
   - GET /narcotics/{narcotic_id} - Get a specific narcotic
   - POST /load-initial-narcotics/ - Load sample narcotics data

## Testing with curl

### Load initial data
```bash
# Load gun data
curl -X POST http://localhost:8000/load-initial-data/

# Load narcotic data
curl -X POST http://localhost:8000/load-initial-narcotics/
```

### Get all items
```bash
# Get all guns
curl http://localhost:8000/guns/

# Get all narcotics
curl http://localhost:8000/narcotics/
```

### Get specific item
```bash
# Get gun with ID 1
curl http://localhost:8000/guns/1

# Get narcotic with ID 1
curl http://localhost:8000/narcotics/1
```

## Testing with Python Requests

You can also test your API with Python's requests library:

```python
import requests

# Base URL
base_url = "http://localhost:8000"

# Load initial data
response = requests.post(f"{base_url}/load-initial-data/")
print(response.json())

# Get all guns
response = requests.get(f"{base_url}/guns/")
print(response.json())

# Get specific gun
response = requests.get(f"{base_url}/guns/1")
print(response.json())

# Load narcotic data
response = requests.post(f"{base_url}/load-initial-narcotics/")
print(response.json())

# Get all narcotics
response = requests.get(f"{base_url}/narcotics/")
print(response.json())
```
