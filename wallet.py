from Database import create_connection

def get_balance(username):
    conn = create_connection()
    cur = conn.cursor()
    cur.execute("SELECT balance FROM users WHERE username = ?", (username,))
    result = cur.fetchone()
    conn.close()
    return result[0] if result else 0

def send_crypto(sender, receiver, amount):
    conn = create_connection()
    cur = conn.cursor()

    cur.execute("SELECT balance FROM users WHERE username = ?", (sender,))
    sender_balance = cur.fetchone()

    cur.execute("SELECT * FROM users WHERE username = ?", (receiver,))
    receiver_exists = cur.fetchone()

    if not sender_balance or not receiver_exists or sender_balance[0] < amount:
        conn.close()
        return False

    cur.execute("UPDATE users SET balance = balance - ? WHERE username = ?", (amount, sender))
    cur.execute("UPDATE users SET balance = balance + ? WHERE username = ?", (amount, receiver))
    cur.execute("INSERT INTO transactions (sender, receiver, amount) VALUES (?, ?, ?)", (sender, receiver, amount))
    conn.commit()
    conn.close()
    return True
