import sqlite3

def create_connection():
    return sqlite3.connect("nexa_wallet.db")

def initialize_db():
    conn = create_connection()
    cursor = conn.cursor()

    # 🚨 Drop old tables (for development use only)
    cursor.execute("DROP TABLE IF EXISTS users")
    cursor.execute("DROP TABLE IF EXISTS transactions")

    # ✅ Recreate users table with balance column
    cursor.execute('''
        CREATE TABLE users (
            username TEXT PRIMARY KEY,
            password TEXT,
            balance REAL DEFAULT 1000
        )
    ''')

    # ✅ Recreate transactions table with sender, receiver, amount, and timestamp
    cursor.execute('''
        CREATE TABLE transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT,
            receiver TEXT,
            amount REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

# Call it to apply changes
initialize_db()
