# Pembahasan (https://chatgpt.com/share/678a3c72-e4a8-800a-94dd-c1f74dded7aa)
FROM python:3.11-slim

WORKDIR /app

# Copy requirements dan install library yg diperluiin
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy semua file aplikasi yang diperlukan
COPY app.py .
COPY linear_model.pkl .
COPY scaler.pkl .
COPY templates templates/
COPY static static/

# Expose port
EXPOSE 8000

# Tetapkan variabel lingkungan
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Jalankan gunicorn dengan 4 worker
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "app:app"] 