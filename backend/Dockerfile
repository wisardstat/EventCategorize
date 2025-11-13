FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    unixodbc \
    unixodbc-dev \
    build-essential \
    gnupg2 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy local ODBC Driver .deb file
COPY install_odbc/msodbcsql17_17.10.2.1-1_amd64.deb /tmp/msodbcsql17.deb

# Pre-accept EULA using debconf before installation
RUN echo msodbcsql17 msodbcsql/ACCEPT_EULA boolean true | debconf-set-selections && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y /tmp/msodbcsql17.deb && \
    rm -f /tmp/msodbcsql17.deb && \
    rm -rf /var/lib/apt/lists/*

# Copy custom OpenSSL config to replace default
COPY install_odbc/openssl.cnf /etc/ssl/openssl.cnf

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy app source code
COPY app /app/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
