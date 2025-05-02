from user_auth import register_user, login_user, change_password
from fastapi import FastAPI
from wallet import get_balance, send_crypto
from transaction import view_transactions
from crypto_api import get_crypto_price
from chatbot import chatbot_response
from price_graph import plot_price_chart
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def main():
    print("💰 Welcome to NexaWallet 💼")
    username = None
    while True:
        print("\n1. Register\n2. Login\n3. Exit")
        choice = input("Enter your choice: ")

        if choice == "1":
            username = input("Enter username: ")
            password = input("Enter password: ")
            if register_user(username, password):
                print("Registration successful!")
        elif choice == "2":
            username = input("Enter username: ")
            password = input("Enter password: ")
            if login_user(username, password):
                print("Login successful!")
                break
            else:
                print("Invalid credentials.")
        elif choice == "3":
            print(" Exiting NexaWallet.")
            return
        else:
            print(" Invalid option.")

    while True:
        print("\n1. Check Balance\n2. Send Crypto\n3. View Transactions\n4. Get Price\n5. Chat with NexaBot\n6. Change Password\n7. Logout\n8. Price Chart")
        choice = input("Enter your choice: ")

        if choice == "1":
            balance = get_balance(username)
            print(f" Balance for {username}: {balance}")
        elif choice == "2":
            receiver = input("Enter recipient username: ")
            amount = float(input("Enter amount: "))
            if send_crypto(username, receiver, amount):
                print(" Transaction successful.")
            else:
                print("Transaction failed.")
        elif choice == "3":
            txns = view_transactions(username)
            print(" Transaction History:")
            for txn in txns:
                print(txn)
        elif choice == "4":
            symbol = input("Enter coin (e.g., bitcoin): ").lower()
            price = get_crypto_price(symbol)
            print(f" {symbol.capitalize()} price: {price}")
        elif choice == "5":
            query = input("Ask NexaBot: ")
            response = chatbot_response(query)
            print(f"NexaBot : {response}")
        elif choice == "6":
            new_pass = input("Enter new password: ")
            if change_password(username, new_pass):
                print("🔐 Password updated successfully.")
        elif choice == "7":
            print(" Logging out.")
            break
        elif choice == "8":
            coin = input("Enter coin (e.g., bitcoin): ").lower()
            currency = input("Enter currency (e.g., usd): ").lower()
            plot_price_chart(coin, currency)
        else:
            print(" Invalid option.")

if __name__ == "__main__":
    main()
