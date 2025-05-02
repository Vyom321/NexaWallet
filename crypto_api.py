import requests

def get_crypto_price(symbol):
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={symbol}&vs_currencies=usd"
    res = requests.get(url)
    if res.status_code == 200:
        return res.json().get(symbol, {}).get('usd', 'Unavailable')
    return "Unavailable"
