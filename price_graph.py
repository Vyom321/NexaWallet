import requests
import matplotlib.pyplot as plt
from datetime import datetime

def plot_price_chart(coin, currency):
    url = f"https://api.coingecko.com/api/v3/coins/{coin}/market_chart"
    params = {'vs_currency': currency, 'days': '7', 'interval': 'daily'}

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        prices = data.get('prices', [])
        if prices:
            dates = [datetime.fromtimestamp(p[0] / 1000).strftime('%b %d') for p in prices]
            values = [p[1] for p in prices]

            plt.figure(figsize=(10, 5))
            plt.plot(dates, values, marker='o', linestyle='-', color='green')
            plt.title(f'{coin.capitalize()} Prices Over Last 7 Days')
            plt.xlabel('Date')
            plt.ylabel(f'Price in {currency.upper()}')
            plt.grid(True)
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.show()
        else:
            print("⚠️ No price data available.")
    else:
        print("⚠️ Failed to fetch price data.")
