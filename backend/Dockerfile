# 1. Use Python 3.13 to match your local environment
FROM python:3.13-slim

# 2. Set the working directory to /code
WORKDIR /code

# 3. Copy requirements first (for better caching)
COPY requirements.txt /code/requirements.txt

# 4. Install dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 5. Copy the app directory into /code/app
COPY ./app /code/app

# 6. Run the application
# We use "app.main:app" because we are in /code and "app" is a folder inside it
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]