const API_URL = "http://localhost:8000";
let currentUser = "";

function showOutput(message, type = "default") {
  const output = document.getElementById("output");
  output.innerText = message;
  output.className = "output-section"; // reset
  if (type === "success") output.classList.add("success");
  else if (type === "error") output.classList.add("error");
}

async function register() {
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  showOutput(data.message, response.ok ? "success" : "error");
}

async function login() {
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (data.success) {
    currentUser = username;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("logout-btn").style.display = "block";
    showOutput("✅ Login successful!", "success");
  } else {
    showOutput("❌ Invalid credentials.", "error");
  }
}

async function getBalance() {
  try {
    const response = await fetch(`${API_URL}/balance?username=${currentUser}`);
    const data = await response.json();

    if (data.balance !== undefined && data.balance !== null) {
      showOutput(`💵 Balance for ${currentUser}: ${data.balance} coins`, "success");
    } else {
      showOutput(`❌ Unable to fetch balance for ${currentUser}`, "error");
    }
  } catch (error) {
    console.error(error);
    showOutput("❌ Failed to connect to server.", "error");
  }
}

async function addBalance() {
  const amount = parseFloat(prompt("Enter amount to add:"));
  if (isNaN(amount) || amount <= 0) {
    showOutput("❌ Invalid amount.", "error");
    return;
  }

  const response = await fetch(`${API_URL}/add-balance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: currentUser, amount })
  });

  const data = await response.json();
  showOutput(data.message, response.ok ? "success" : "error");
  await getBalance();
}

async function sendCrypto() {
  const receiver = prompt("Enter recipient username:").trim().toLowerCase();
  const amount = parseFloat(prompt("Enter amount to send:"));

  if (!receiver || isNaN(amount) || amount <= 0) {
    showOutput("❌ Invalid input.", "error");
    return;
  }

  const response = await fetch(`${API_URL}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender: currentUser, receiver, amount })
  });

  const data = await response.json();
  showOutput(data.message, response.ok ? "success" : "error");
  await getBalance();
}

async function viewTransactions() {
  try {
    const response = await fetch(`${API_URL}/transactions?username=${currentUser}`);
    const data = await response.json();

    if (data.transactions && data.transactions.length > 0) {
      let output = "📜 Transaction History:\n\n";
      data.transactions.forEach(txn => {
        output += `🟰 ${txn.sender} ➡️ ${txn.receiver} | 💰 ${txn.amount} | 🕑 ${new Date(txn.timestamp).toLocaleString()}\n`;
      });
      showOutput(output);
    } else {
      showOutput("❌ No transactions found.", "error");
    }
  } catch (err) {
    showOutput("❌ Error fetching transactions.", "error");
  }
}

async function getCryptoPrice() {
  const symbol = prompt("Enter crypto (e.g., bitcoin):");
  const response = await fetch(`${API_URL}/price?symbol=${symbol}`);
  const data = await response.json();
  showOutput(`💹 ${symbol.toUpperCase()} Price: $${data.price}`);
}

async function askNexaBot() {
  const query = prompt("Ask NexaBot:");
  const response = await fetch(`${API_URL}/chatbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  showOutput(`🤖 NexaBot: ${data.response}`);
}

async function plotPriceChart() {
  const coin = prompt("Enter coin name (e.g., bitcoin):");
  const currency = "usd";

  try {
    const response = await fetch(`${API_URL}/price-chart?coin=${coin}&currency=${currency}`);
    const data = await response.json();

    if (data.labels && data.prices) {
      let output = `📈 ${coin.toUpperCase()} Chart (${currency.toUpperCase()}):\n`;
      for (let i = 0; i < data.labels.length; i++) {
        output += `📅 ${data.labels[i]}: $${data.prices[i].toFixed(2)}\n`;
      }
      output += `\n🔗 View on CoinGecko: ${data.chartLink}`;
      showOutput(output);
    } else {
      showOutput("❌ No chart data found.", "error");
    }
  } catch (err) {
    console.error(err);
    showOutput("❌ Error fetching price chart.", "error");
  }
}

function logout() {
  currentUser = "";
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("logout-btn").style.display = "none";
  showOutput("👋 Logged out successfully.", "success");
}
