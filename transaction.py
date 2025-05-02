from Database import create_connection

def view_transactions(username):
    conn = create_connection()
    cur = conn.cursor()
    cur.execute("SELECT sender, receiver, amount, timestamp FROM transactions WHERE sender = ? OR receiver = ? ORDER BY timestamp DESC", (username, username))
    transactions = cur.fetchall()
    conn.close()
    return transactions
