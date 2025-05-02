def chatbot_response(query):
    responses = {
        "hello": "Hi there! How can I assist you with your wallet today?",
        "balance": "You can check your balance using the 'Check Balance' option.",
        "send": "To send crypto, go to the 'Send Crypto' option.",
        "price": "Use the 'Get Price' option to get latest rates.",
        "help": "Options: Balance, Send, Price, Transactions, Chart"
    }
    return responses.get(query.lower(), "Sorry, I didn't understand that.")
