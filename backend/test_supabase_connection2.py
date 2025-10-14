import psycopg2
from dotenv import load_dotenv
import os
import sys

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")


# user
# password
# host
# port
# port

# New method: connect by connection string (DATABASE_URL)
DATABASE_URL = os.getenv("DATABASE_URL")
print('>>',DATABASE_URL)

if DATABASE_URL:
    try:
        print("Connection Method 1")
        # Example: postgresql://user:password@host:port/dbname
        connection = psycopg2.connect(DATABASE_URL)
        print("Connection via DATABASE_URL successful!")

        cursor = connection.cursor()
        cursor.execute("SELECT NOW();")
        result = cursor.fetchone()
        print("Current Time:", result)

        cursor.close()
        connection.close()
        print("Connection closed.")
       
    except Exception as e:
        print(f"Failed to connect via DATABASE_URL: {e}")

# Fallback: connect using discrete parameters
try:
    print('')
    print("Connection Method 2")
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )

    print("Connection successful!")

    cursor = connection.cursor()
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    print("Current Time:", result)

    cursor.close()
    connection.close()
    print("Connection closed.")

except Exception as e:
    print(f"Failed to connect: {e}")