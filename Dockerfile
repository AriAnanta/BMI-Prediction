# Pembahasan (https://chatgpt.com/share/678a3c72-e4a8-800a-94dd-c1f74dded7aa)
FROM python:3.11-slim

WORKDIR /app

# Copy requirements dan install library yg diperluiin
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy model, app, dan isi direktori templates nya
COPY app.py .
COPY linear_model.pkl .
COPY scaler.pkl .
COPY templates templates/

# Expose port
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"] 