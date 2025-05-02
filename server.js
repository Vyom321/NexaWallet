const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite DB
const db = new sqlite3.Database('./nexawallet.db', (err) => {
  if (err) console.error('❌ DB Error:', err.message);
  else console.log('✅ Connected to SQLite DB');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT,
    balance REAL DEFAULT 1000
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    receiver TEXT,
    amount REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// ✅ Register
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username.trim(), password], (err) => {
    if (err) res.status(400).json({ message: '❌ Username already exists.' });
    else res.json({ message: '✅ Registration successful!' });
  });
});

// ✅ Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username.trim(), password], (err, row) => {
    if (row) res.json({ success: true, message: '🔐 Login successful.' });
    else res.json({ success: false, message: '❌ Invalid credentials.' });
  });
});

// ✅ Change Password
app.post('/change-password', (req, res) => {
  const { username, newPassword } = req.body;
  db.run(`UPDATE users SET password = ? WHERE username = ?`, [newPassword, username.trim()], (err) => {
    if (err) res.status(400).json({ message: '❌ Failed to change password.' });
    else res.json({ message: '🔐 Password updated successfully!' });
  });
});

// ✅ Get Balance
app.get('/balance', (req, res) => {
  const username = req.query.username.trim();
  db.get(`SELECT balance FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ message: '❌ DB error.' });
    if (row && row.balance !== undefined) res.json({ balance: row.balance });
    else res.status(404).json({ message: '❌ User not found.' });
  });
});

// ✅ Add Balance
app.post('/add-balance', (req, res) => {
  const { username, amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: '❌ Invalid amount' });

  db.run(`UPDATE users SET balance = balance + ? WHERE username = ?`, [amount, username.trim()], function (err) {
    if (err) return res.status(500).json({ message: '❌ Failed to add balance' });
    res.json({ message: `✅ Added ${amount} coins to ${username}` });
  });
});

// ✅ Send Crypto
app.post('/send', (req, res) => {
  const { sender, receiver, amount } = req.body;

  db.get(`SELECT balance FROM users WHERE username = ?`, [sender.trim()], (err, row) => {
    if (!row || row.balance < amount) {
      return res.status(400).json({ message: '❌ Insufficient balance.' });
    }

    db.serialize(() => {
      db.run(`UPDATE users SET balance = balance - ? WHERE username = ?`, [amount, sender.trim()]);
      db.run(`UPDATE users SET balance = balance + ? WHERE username = ?`, [amount, receiver.trim()]);
      db.run(`INSERT INTO transactions (sender, receiver, amount) VALUES (?, ?, ?)`, [sender.trim(), receiver.trim(), amount]);
      res.json({ message: '✅ Transaction successful!' });
    });
  });
});

// ✅ View Transactions
app.get('/transactions', (req, res) => {
  const username = req.query.username.trim();
  db.all(`SELECT * FROM transactions WHERE sender = ? OR receiver = ? ORDER BY timestamp DESC`,
    [username, username],
    (err, rows) => {
      if (rows && rows.length > 0) res.json({ transactions: rows });
      else res.status(404).json({ message: '❌ No transactions found.' });
    });
});

// ✅ Crypto Price (Mock)
app.get('/price', (req, res) => {
  const symbol = req.query.symbol.toLowerCase();
  const mockPrices = {
    bitcoin: 30000,
    ethereum: 2000,
    solana: 100,
    dogecoin: 0.08
  };
  res.json({ price: mockPrices[symbol] || 0 });
});

// ✅ NexaBot Chatbot
app.post('/chatbot', (req, res) => {
  const { query } = req.body;
  const lower = query.toLowerCase();
  let response = `🤖 You asked: "${query}" — feature coming soon!`;

  if (lower.includes("price")) {
    response = "📈 Use 'Get Crypto Price' to check live values.";
  } else if (lower.includes("balance")) {
    response = "💰 Use 'Check Balance' to view your wallet.";
  } else if (lower.includes("send")) {
    response = "📤 Use 'Send Crypto' to make transfers.";
  } else if (lower.includes("transactions")) {
    response = "📜 Use 'View Transactions' to track history.";
  } else if (lower.includes("password")) {
    response = "🔐 Use 'Change Password' to update credentials.";
  }

  res.json({ response });
});

// ✅ CoinGecko Price Chart
app.get('/price-chart', async (req, res) => {
  const { coin, currency } = req.query;

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=${currency}&days=5&interval=daily`;
    const response = await axios.get(url);
    const pricesData = response.data.prices;

    const labels = pricesData.map(item => {
      const date = new Date(item[0]);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const prices = pricesData.map(item => item[1]);
    const chartLink = `https://www.coingecko.com/en/coins/${coin}`;

    res.json({
      coin,
      currency,
      labels,
      prices,
      chartLink
    });

  } catch (error) {
    console.error('Error fetching price data:', error);
    res.status(500).json({ message: '❌ Failed to fetch chart data.' });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 NexaWallet backend running at http://localhost:${PORT}`);
});
