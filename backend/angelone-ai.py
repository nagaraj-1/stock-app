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


# ===========================================================
# GLOBALS
# ===========================================================

smartApi = None


# ===========================================================
# LOGGER
# ===========================================================


def log(message):
    """
    Print logs with current timestamp
    """
    current_time = datetime.now().strftime("%I:%M:%S %p")
    print(f"[{current_time}] {message}")


# ===========================================================
# LOGIN FUNCTION
# ===========================================================


def login():
    """
    Login to Angel One SmartAPI
    """

    global smartApi

    try:

        smartApi = SmartConnect(api_key=API_KEY)

        totp = pyotp.TOTP(TOTP_SECRET).now()

        session = smartApi.generateSession(CLIENT_CODE, PASSWORD, totp)

        if not session["status"]:
            log(f"LOGIN FAILED: {session['message']}")
            sys.exit(1)

        log("LOGIN SUCCESSFUL")

    except Exception as e:
        log(f"LOGIN ERROR: {e}")
        sys.exit(1)


# ===========================================================
# LOAD SYMBOL TOKEN
# ===========================================================


def get_symbol_token(stock_name):
    with open("OpenAPIScripMaster.json", "r") as f:
        data = json.load(f)

        # MASTER_URL = "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json"

        # response = requests.get(MASTER_URL)

        # data = response.json()

        stock_name = stock_name.upper().strip()

        for item in data:
            if (
                item.get("name", "").upper() == stock_name
                and item.get("exch_seg") == "NSE"
                and item.get("symbol", "").endswith("-EQ")
            ):

                return (item["symbol"], item["token"])

        return None


# ===========================================================
# PLACE BUY ORDER
# ===========================================================

# ===========================================================
# CHECK ORDER STATUS
# ===========================================================


def check_order_status(order_id):
    """
    Check current order status
    """

    try:

        order_book = smartApi.orderBook()

        if order_book["status"]:

            for order in order_book["data"]:

                if order["orderid"] == order_id:

                    return order

        return None

    except Exception as e:
        log(f"ORDER STATUS ERROR: {e}")
        return None


# ===========================================================
# GET LTP
# ===========================================================


def get_ltp(trading_symbol, symbol_token):
    """
    Get current live market price
    """

    try:

        ltp_data = smartApi.ltpData("NSE", trading_symbol, symbol_token)

        return float(ltp_data["data"]["ltp"])

    except Exception as e:
        log(f"LTP ERROR: {e}")
        return None


# ===========================================================
# PLACE SELL ORDER
# ===========================================================


def place_sell_order(trading_symbol, symbol_token, quantity):
    """
    Place MARKET SELL order
    """

    try:

        sell_order = {
            "variety": "NORMAL",
            "tradingsymbol": trading_symbol,
            "symboltoken": symbol_token,
            "transactiontype": "SELL",
            "exchange": "NSE",
            "ordertype": "MARKET",
            "producttype": "INTRADAY",
            "duration": "DAY",
            "quantity": str(quantity),
        }

        sell_order_id = smartApi.placeOrder(sell_order)

        log(f"SELL ORDER PLACED | ORDER ID: {sell_order_id}")

        return sell_order_id

    except Exception as e:
        log(f"SELL ORDER FAILED: {e}")
        return None


def place_sell_order_with_price(trading_symbol, symbol_token, quantity, sell_price):
    """
    Place LIMIT SELL order
    """

    try:

        sell_order = {
            "variety": "NORMAL",
            "tradingsymbol": trading_symbol,
            "symboltoken": symbol_token,
            "transactiontype": "SELL",
            "exchange": "NSE",
            # LIMIT ORDER
            "ordertype": "LIMIT",
            "producttype": "INTRADAY",
            "duration": "DAY",
            # SELL PRICE
            "price": str(round(sell_price, 2)),
            "quantity": str(quantity),
        }

        sell_order_id = smartApi.placeOrder(sell_order)

        log(
            f"SELL LIMIT ORDER PLACED | "
            f"PRICE: {sell_price} | "
            f"ORDER ID: {sell_order_id}"
        )

        return sell_order_id

    except Exception as e:

        log(f"SELL ORDER FAILED: {e}")

        return None


# ===========================================================
# CANCEL ORDER
# ===========================================================


def cancel_order(order_id):
    """
    Cancel pending order
    """

    try:

        smartApi.cancelOrder(order_id, "NORMAL")

        log(f"ORDER CANCELLED | ORDER ID: {order_id}")

    except Exception as e:
        log(f"ORDER CANCEL FAILED: {e}")


# ===========================================================
# MAIN FUNCTION
# ===========================================================


def main():

    # =======================================================
    # VALIDATE ARGUMENTS
    # =======================================================

    # if len(sys.argv) != 4:

    #     print("\nUsage:")
    #     print("python3 trade.py SYMBOL PRICE QTY\n")

    #     sys.exit(1)

    stock_symbol = sys.argv[1].upper()
    buy_price = float(sys.argv[3])
    quantity = int(sys.argv[2])
    sell_price = round(buy_price * 1.017, 2)
    print(f"SELL PRICE: {sell_price}")
    # =======================================================
    # LOGIN
    # =======================================================

    login()

    # =======================================================
    # GET SYMBOL TOKEN
    # =======================================================

    trading_symbol, symbol_token = get_symbol_token(stock_symbol)

    if not trading_symbol:

        log(f"STOCK NOT FOUND: {stock_symbol}")
        sys.exit(1)

    log(f"SYMBOL FOUND: {trading_symbol}")

    # =======================================================
    # PLACE BUY ORDER
    # =======================================================

    order_id = sys.argv[4]

    # =======================================================
    # CHECK ORDER EXECUTION
    # =======================================================

    start_time = time.time()

    executed = False

    actual_buy_price = buy_price

    while True:

        elapsed = time.time() - start_time

        # ---------------------------------------------------
        # Cancel after 20 minutes
        # ---------------------------------------------------

        if elapsed >= 20 * 60:

            log("BUY ORDER NOT EXECUTED IN 20 MINUTES")
            cancel_order(order_id)

            sys.exit(0)

        # ---------------------------------------------------
        # Check order status
        # ---------------------------------------------------

        order = check_order_status(order_id)

        if order:

            status = order.get("status", "").lower()

            log(f"CURRENT ORDER STATUS: {status}")

            # ------------------------------------------------
            # ORDER EXECUTED
            # ------------------------------------------------

            if status == "complete":

                executed = True

                actual_buy_price = float(order.get("averageprice", buy_price))

                log(f"ORDER EXECUTED | BUY PRICE: {actual_buy_price}")

                break

            # ------------------------------------------------
            # ORDER FAILED
            # ------------------------------------------------

            elif status in ["rejected", "cancelled"]:

                log(f"ORDER FAILED: {status}")

                sys.exit(1)

        # ---------------------------------------------------
        # Wait 30 sec
        # ---------------------------------------------------

        time.sleep(30)

    # =======================================================
    # AFTER BUY EXECUTION
    # =======================================================

    if executed:

        # ---------------------------------------------------
        # STEP A + STEP B
        # CHECK 17% TARGET EVERY 2 SECONDS FOR 45 SECONDS
        # ---------------------------------------------------

        start_time = time.time()

        target_hit = False

        while time.time() - start_time < 45:

            current_price = get_ltp(trading_symbol, symbol_token)

            if current_price is None:

                time.sleep(2)
                continue

            percentage = ((current_price - actual_buy_price) / actual_buy_price) * 100

            log(f"LTP: {current_price} | " f"PROFIT %: {round(percentage, 2)}%")

            # ------------------------------------------------
            # TARGET HIT
            # ------------------------------------------------

            if percentage >= 17:

                log("TARGET HIT SELLING")

                log("TARGET HIT SELLING")

                sell_order_id = place_sell_order_with_price(
                    trading_symbol, symbol_token, quantity, sell_price
                )

                # ----------------------------------------
                # WAIT 10 SECONDS FOR LIMIT SELL EXECUTION
                # ----------------------------------------

                time.sleep(10)

                sell_order = check_order_status(sell_order_id)

                if sell_order:

                    sell_status = sell_order.get("status", "").lower()

                    log(f"SELL ORDER STATUS: {sell_status}")

                    # ------------------------------------
                    # LIMIT SELL EXECUTED
                    # ------------------------------------

                    if sell_status == "complete":

                        log("LIMIT SELL EXECUTED SUCCESSFULLY")

                        sys.exit(0)

                # ----------------------------------------
                # LIMIT SELL NOT EXECUTED
                # CANCEL LIMIT ORDER
                # PLACE MARKET SELL
                # ----------------------------------------

                log("LIMIT SELL NOT EXECUTED IN 10 SECONDS")

                cancel_order(sell_order_id)

                log("PLACING MARKET SELL")

                place_sell_order(trading_symbol, symbol_token, quantity)

                sys.exit(0)
            time.sleep(2)
        # ---------------------------------------------------
        # STEP C
        # CHECK PROFIT AFTER 45 SECONDS
        # ---------------------------------------------------

        start_time = time.time()

        while time.time() - start_time < 120:

            current_price = get_ltp(trading_symbol, symbol_token)

            if current_price is None:

                log("FAILED TO GET LTP")

                time.sleep(5)
                continue

            profit = (current_price - actual_buy_price) * quantity

            log(f"CURRENT PROFIT = {round(profit, 2)}")

            # ---------------------------------------------------
            # PROFIT AVAILABLE
            # ---------------------------------------------------

            if profit > 0:

                log("PROFIT POSITIVE SELLING")

                place_sell_order(trading_symbol, symbol_token, quantity)

                sys.exit(0)

            # CHECK EVERY 5 SECONDS
            time.sleep(5)

        # ---------------------------------------------------
        # NO PROFIT AFTER 2 MINUTES
        # ---------------------------------------------------

        log("NO PROFIT AFTER 2 MINUTES")

        log("EXITING TRADE WITH MARKET SELL")

        place_sell_order(trading_symbol, symbol_token, quantity)

        sys.exit(0)


# ===========================================================
# START
# ===========================================================

if __name__ == "__main__":

    try:

        main()

    except KeyboardInterrupt:

        log("PROGRAM STOPPED BY USER")

    except Exception as e:

        log(f"UNEXPECTED ERROR: {e}")
