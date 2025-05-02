import sqlite3

conn = sqlite3.connect("nexa_wallet.db")
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("📦 Tables:", tables)

# Show data in `users` table
cursor.execute("SELECT * FROM users;")
rows = cursor.fetchall()
print("\n👥 Users:")
for row in rows:
    print(row)

# Show data in `transactions` table
cursor.execute("SELECT * FROM transactions;")
rows = cursor.fetchall()
print("\n💸 Transactions:")
for row in rows:
    print(row)

conn.close()
