import socket
import pyodbc
import psycopg2

# Specifying the ODBC driver, server name, database, etc. directly
cnxn = cnxn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=mssql-2012.chaiyohosting.com;'
    'DATABASE=srakraisoft2_pos_may_shop2;'
    'UID=pos2_may2;'
    'PWD=7irC60@f!;'
    'Connection Timeout=30;'  # Increase from default 15 seconds
    'Login Timeout=30'  # Explicitly set login timeout
)

# Create a cursor from the connection
cursor = cnxn.cursor()

cursor.execute("select * from idea_users")
rows = cursor.fetchall()
for row in rows:
    print(row.user_code, row.user_fname)


cnxn.commit()