import sys
import json
import time
import pyotp
import requests
from datetime import datetime
from SmartApi import SmartConnect

# ===========================================================
# CONFIGURATION
# ===========================================================


API_KEY = "EaFKlr72"
CLIENT_CODE = "AACH089053"
PASSWORD = "9140"
TOTP_SECRET = "MJY6M5MGX6C5KK3MTFOZ65H6YE"


smartApi = SmartConnect(api_key=API_KEY)

totp = pyotp.TOTP(TOTP_SECRET).now()

session = smartApi.generateSession(CLIENT_CODE, PASSWORD, totp)

print("LOGIN SUCCESS")

# ==========================================
# ACTION
# ==========================================

action = sys.argv[1].upper()

# ==========================================
# CANCEL ORDER
# ==========================================

if action == "CANCEL":

    order_id = sys.argv[2]

    try:

        response = smartApi.cancelOrder(order_id, "NORMAL")

        print("ORDER CANCELLED:", order_id)

    except Exception as e:

        print("CANCEL FAILED")

        print(str(e))

    sys.exit(0)

# ==========================================
# BUY / SELL INPUTS
# ==========================================

symbol = sys.argv[2].upper()

qty = int(sys.argv[3])

price = float(sys.argv[4])

print("ACTION:", action)

print("SYMBOL:", symbol)

print("QTY:", qty)

print("PRICE:", price)

# ==========================================
# GET TOKEN
# ==========================================
with open("OpenAPIScripMaster.json", "r") as f:
    data = json.load(f)

#MASTER_URL = "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json"

# response = requests.get(MASTER_URL)

# data = response.json()

trading_symbol = None

symbol_token = None

for item in data:

    if (
        item.get("name", "").upper() == symbol
        and item.get("exch_seg") == "NSE"
        and item.get("symbol", "").endswith("-EQ")
    ):

        trading_symbol = item["symbol"]

        symbol_token = item["token"]

        break

if not trading_symbol:

    print("STOCK NOT FOUND")

    sys.exit(1)

print("FOUND:", trading_symbol)

# ==========================================
# ORDER PARAMS
# ==========================================

orderparams = {
    "variety": "NORMAL",
    "tradingsymbol": trading_symbol,
    "symboltoken": symbol_token,
    "transactiontype": action,
    "exchange": "NSE",
    "ordertype": "LIMIT",
    "producttype": "INTRADAY",
    "duration": "DAY",
    "price": str(price),
    "quantity": str(qty),
}

# ==========================================
# PLACE ORDER
# ==========================================

try:

    order_id = smartApi.placeOrder(orderparams)

    print("ORDER ID:", order_id)

except Exception as e:

    print("ORDER FAILED")

    print(str(e))
