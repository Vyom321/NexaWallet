# server.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from user_auth import register_user, login_user, change_password
from wallet import get_balance, send_crypto
from transaction import view_transactions
from crypto_api import get_crypto_price
from chatbot import chatbot_response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to talk with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body models
class UserAuth(BaseModel):
    username: str
    password: str

class SendRequest(BaseModel):
    sender: str
    receiver: str
    amount: float

class ChatRequest(BaseModel):
    query: str

# ------------- API Endpoints -------------

@app.post("/register")
def register(user: UserAuth):
    if register_user(user.username, user.password):
        return {"message": "✅ Registration successful!"}
    else:
        raise HTTPException(status_code=400, detail="❌ Registration failed. Username may already exist.")

@app.post("/login")
def login(user: UserAuth):
    if login_user(user.username, user.password):
        return {"success": True, "message": "🔐 Login successful."}
    else:
        return {"success": False, "message": "❌ Invalid credentials."}

@app.get("/balance")
def balance(username: str):
    balance = get_balance(username)
    return {"balance": balance}

@app.post("/send")
def send(send_req: SendRequest):
    if send_crypto(send_req.sender, send_req.receiver, send_req.amount):
        return {"message": "✅ Transaction successful!"}
    else:
        raise HTTPException(status_code=400, detail="❌ Transaction failed.")

@app.get("/transactions")
def transactions(username: str):
    txns = view_transactions(username)
    return {"transactions": txns}

@app.get("/price")
def price(symbol: str):
    price = get_crypto_price(symbol)
    return {"price": price}

@app.post("/chatbot")
def chatbot(chat: ChatRequest):
    response = chatbot_response(chat.query)
    return {"response": response}
