import sys
import time
import uuid
from datetime import datetime
from kiteconnect import KiteConnect

# ===========================================================
# GLOBALS & CONFIGURATION
# ===========================================================

API_KEY = "gy6zhrcj24q331y0"  # Replace with your API key
kite = None

# ===========================================================
# LOGGER
# ===========================================================

def log(message):
    """
    Print logs with current timestamp
    """
    current_time = datetime.now().strftime("%I:%M:%S %p")
    print(f"[{current_time}] {message}", flush=True)

# ===========================================================
# LOGIN FUNCTION
# ===========================================================

def login():
    """
    Login to Zerodha Kite Connect
    """
    global kite

    try:
        with open("access_token.txt", "r") as f:
            access_token = f.read().strip()

        kite = KiteConnect(api_key=API_KEY)
        kite.set_access_token(access_token)
        
        # Test connection by fetching profile
        kite.profile()
        log("LOGIN SUCCESSFUL")

    except Exception as e:
        log(f"LOGIN ERROR: {e}")
        sys.exit(1)

# ===========================================================
# CHECK ORDER STATUS
# ===========================================================

def check_order_status(order_id):
    """
    Check current order status using order history
    """
    try:
        # Kite returns a list of order updates. The last one is the current state.
        order_history = kite.order_history(order_id=order_id)
        if order_history and len(order_history) > 0:
            return order_history[-1] 
        return None
    except Exception as e:
        log(f"ORDER STATUS ERROR: {e}")
        return None

# ===========================================================
# GET LTP
# ===========================================================

def get_ltp(trading_symbol):
    """
    Get current live market price from Kite
    """
    try:
        instrument = f"NSE:{trading_symbol}"
        quote_data = kite.quote([instrument])
        
        return float(quote_data[instrument]["last_price"])
    except Exception as e:
        log(f"LTP ERROR: {e}")
        return None

# ===========================================================
# PLACE SELL ORDER (MARKET)
# ===========================================================

def place_sell_order(trading_symbol, quantity):
    """
    Place MARKET SELL order
    """
    try:
        order_reference_id = str(uuid.uuid4())[:12]
        
        sell_order_id = kite.place_order(
            variety=kite.VARIETY_REGULAR,
            exchange=kite.EXCHANGE_NSE,
            tradingsymbol=trading_symbol,
            transaction_type=kite.TRANSACTION_TYPE_SELL,
            quantity=quantity,
            product=kite.PRODUCT_MIS,
            order_type=kite.ORDER_TYPE_MARKET,
            validity=kite.VALIDITY_DAY,
            tag=order_reference_id
        )

        log(f"SELL ORDER PLACED | ORDER ID: {sell_order_id}")
        return sell_order_id

    except Exception as e:
        log(f"SELL ORDER FAILED: {e}")
        return None

# ===========================================================
# PLACE SELL ORDER (LIMIT)
# ===========================================================

def place_sell_order_with_price(trading_symbol, quantity, sell_price):
    """
    Place LIMIT SELL order
    """
    try:
        order_reference_id = str(uuid.uuid4())[:12]

        sell_order_id = kite.place_order(
            variety=kite.VARIETY_REGULAR,
            exchange=kite.EXCHANGE_NSE,
            tradingsymbol=trading_symbol,
            transaction_type=kite.TRANSACTION_TYPE_SELL,
            quantity=quantity,
            product=kite.PRODUCT_MIS,
            order_type=kite.ORDER_TYPE_LIMIT,
            price=round(sell_price, 2),
            validity=kite.VALIDITY_DAY,
            tag=order_reference_id
        )

        log(f"SELL LIMIT ORDER PLACED | PRICE: {sell_price} | ORDER ID: {sell_order_id}")
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
        kite.cancel_order(
            variety=kite.VARIETY_REGULAR,
            order_id=order_id
        )
        log(f"ORDER CANCELLED | ORDER ID: {order_id}")
    except Exception as e:
        log(f"ORDER CANCEL FAILED: {e}")

# ===========================================================
# MAIN FUNCTION
# ===========================================================

def main():

    # =======================================================
    # VALIDATE ARGUMENTS
    # Expected: script.py SYMBOL QTY BUY_PRICE ORDER_ID
    # =======================================================
    if len(sys.argv) < 5:
        log("Usage: python3 script.py SYMBOL QTY BUY_PRICE ORDER_ID")
        sys.exit(1)

    stock_symbol = sys.argv[1].upper()
    quantity = int(sys.argv[2])
    buy_price = float(sys.argv[3])
    order_id = sys.argv[4]

    sell_price = round(buy_price * 1.017, 2)
    log(f"TARGET SELL PRICE CALCULATED: {sell_price}")

    # =======================================================
    # LOGIN
    # =======================================================
    login()

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
            status = order.get("status", "").upper()
            log(f"CURRENT ORDER STATUS: {status}")

            # ------------------------------------------------
            # ORDER EXECUTED
            # ------------------------------------------------
            if status == "COMPLETE":
                executed = True
                actual_buy_price = float(order.get("average_price", buy_price))
                log(f"ORDER EXECUTED | BUY PRICE: {actual_buy_price}")
                break

            # ------------------------------------------------
            # ORDER FAILED
            # ------------------------------------------------
            elif status in ["REJECTED", "CANCELLED"]:
                log(f"ORDER FAILED: {status}")
                sys.exit(1)

        # ---------------------------------------------------
        # Wait 5 sec before checking again
        # ---------------------------------------------------
        time.sleep(5)

    # =======================================================
    # AFTER BUY EXECUTION
    # =======================================================
    if executed:

        # ---------------------------------------------------
        # STEP A + STEP B
        # CHECK 1.7% TARGET EVERY SECOND FOR 120 SECONDS
        # ---------------------------------------------------
        start_time = time.time()

        while time.time() - start_time < 120:
            current_price = get_ltp(stock_symbol)

            if current_price is None:
                time.sleep(1)
                continue

            percentage = ((current_price - actual_buy_price) / actual_buy_price) * 100
            log(f"LTP: {current_price} | PROFIT %: {round(percentage, 2)}%")

            # ------------------------------------------------
            # TARGET HIT (Fixed mathematically to 1.7%)
            # ------------------------------------------------
            if percentage >= 1.7:
                log("TARGET HIT SELLING")
                
                sell_order_id = place_sell_order_with_price(
                    stock_symbol, quantity, sell_price
                )

                # ----------------------------------------
                # WAIT 10 SECONDS FOR LIMIT SELL EXECUTION
                # ----------------------------------------
                time.sleep(10)

                sell_order = check_order_status(sell_order_id)

                if sell_order:
                    sell_status = sell_order.get("status", "").upper()
                    log(f"SELL ORDER STATUS: {sell_status}")

                    # ------------------------------------
                    # LIMIT SELL EXECUTED
                    # ------------------------------------
                    if sell_status == "COMPLETE":
                        log("LIMIT SELL EXECUTED SUCCESSFULLY")
                        sys.exit(0)

                # ----------------------------------------
                # LIMIT SELL NOT EXECUTED -> MARKET SELL
                # ----------------------------------------
                log("LIMIT SELL NOT EXECUTED IN 10 SECONDS")
                cancel_order(sell_order_id)
                log("PLACING MARKET SELL")
                place_sell_order(stock_symbol, quantity)
                sys.exit(0)
            
            time.sleep(1)

        # ---------------------------------------------------
        # STEP C
        # CHECK PROFIT FOR NEXT 120 SECONDS
        # ---------------------------------------------------
        start_time = time.time()

        while time.time() - start_time < 120:
            current_price = get_ltp(stock_symbol)

            if current_price is None:
                log("FAILED TO GET LTP")
                time.sleep(5)
                continue

            profit = (current_price - actual_buy_price) * quantity
            log(f"CURRENT PROFIT = {round(profit, 2)}")

            # ---------------------------------------------------
            # PROFIT POSITIVE -> MARKET SELL
            # ---------------------------------------------------
            if profit > 0:
                log("PROFIT POSITIVE SELLING")
                place_sell_order(stock_symbol, quantity)
                sys.exit(0)

            time.sleep(1)

        # ---------------------------------------------------
        # NO PROFIT AFTER TIME ELAPSED
        # ---------------------------------------------------
        log("NO PROFIT AFTER TIME ELAPSED")
        log("EXITING TRADE WITH MARKET SELL")
        place_sell_order(stock_symbol, quantity)
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