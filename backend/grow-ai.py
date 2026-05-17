import sys
import time
from datetime import datetime
from growwapi import GrowwAPI
from credentials import get_groww_credentials

# ===========================================================
# GLOBALS & CONFIGURATION
# ===========================================================
API_KEY = None
API_SECRET = None
API_AUTH_TOKEN = None

groww = None

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
    Login using Groww Official SDK
    """
    global groww

    try:
        groww = GrowwAPI(API_AUTH_TOKEN)
        
        # Test connection by verifying user margin availability
        groww.get_available_margin_details()
        log("GROWW LOGIN SUCCESSFUL")

    except Exception as e:
        log(f"GROWW LOGIN ERROR: {e}")
        sys.exit(1)

# ===========================================================
# CHECK ORDER STATUS
# ===========================================================

def check_order_status(order_id):
    """
    Check current order status from Groww
    """
    try:
        order_status_response = groww.get_order_status(
            groww_order_id=order_id,
            segment=groww.SEGMENT_CASH
        )
        return order_status_response
    except Exception as e:
        log(f"ORDER STATUS ERROR: {e}")
        return None

# ===========================================================
# GET LTP (LIVE TRADED PRICE)
# ===========================================================

def get_ltp(trading_symbol):
    """
    Get current live market price from Groww API
    """
    try:
        symbol_key = f"NSE_{trading_symbol}"
        response = groww.get_ltp(
            segment=groww.SEGMENT_CASH,
            exchange_trading_symbols=symbol_key
        )
        
        # Safely parse the structure dynamically 
        if isinstance(response, dict):
            if symbol_key in response:
                inner = response[symbol_key]
                return float(inner.get("ltp", inner)) if isinstance(inner, dict) else float(inner)
            elif "ltp" in response:
                return float(response["ltp"])
        return float(response)
    except Exception as e:
        log(f"LTP ERROR: {e}")
        return None

# ===========================================================
# PLACE SELL ORDER (MARKET)
# ===========================================================

def place_sell_order(trading_symbol, quantity):
    """
    Place Intraday MARKET SELL order
    """
    try:
        response = groww.place_order(
            trading_symbol=trading_symbol,
            quantity=quantity,
            validity=groww.VALIDITY_DAY,
            exchange=groww.EXCHANGE_NSE,
            segment=groww.SEGMENT_CASH,
            product=groww.PRODUCT_MIS,            # MIS = Intraday
            order_type=groww.ORDER_TYPE_MARKET,
            transaction_type=groww.TRANSACTION_TYPE_SELL,
            price=0.0
        )

        sell_order_id = response.get("groww_order_id")
        log(f"MARKET SELL ORDER PLACED | ORDER ID: {sell_order_id}")
        return sell_order_id

    except Exception as e:
        log(f"MARKET SELL ORDER FAILED: {e}")
        return None

# ===========================================================
# PLACE SELL ORDER (LIMIT)
# ===========================================================

def place_sell_order_with_price(trading_symbol, quantity, sell_price):
    """
    Place Intraday LIMIT SELL order
    """
    try:
        response = groww.place_order(
            trading_symbol=trading_symbol,
            quantity=quantity,
            validity=groww.VALIDITY_DAY,
            exchange=groww.EXCHANGE_NSE,
            segment=groww.SEGMENT_CASH,
            product=groww.PRODUCT_MIS,            # MIS = Intraday
            order_type=groww.ORDER_TYPE_LIMIT,
            transaction_type=groww.TRANSACTION_TYPE_SELL,
            price=round(sell_price, 2)
        )

        sell_order_id = response.get("groww_order_id")
        log(f"LIMIT SELL ORDER PLACED | PRICE: {round(sell_price, 2)} | ORDER ID: {sell_order_id}")
        return sell_order_id

    except Exception as e:
        log(f"LIMIT SELL ORDER FAILED: {e}")
        return None

# ===========================================================
# CANCEL ORDER
# ===========================================================

def cancel_order(order_id):
    """
    Cancel pending or open order
    """
    try:
        groww.cancel_order(
            segment=groww.SEGMENT_CASH,
            groww_order_id=order_id
        )
        log(f"ORDER CANCELLED SUCCESSFULLY | ORDER ID: {order_id}")
    except Exception as e:
        log(f"ORDER CANCEL FAILED: {e}")

# ===========================================================
# MAIN EXECUTION ENGINE
# ===========================================================

def main():
    # Validate command line parameters
    if len(sys.argv) < 6:
        log("Usage error! Syntax: python3 script.py SYMBOL QTY BUY_PRICE ORDER_ID USER")
        sys.exit(1)

    stock_symbol = sys.argv[1].upper().strip()
    quantity = int(sys.argv[2])
    buy_price = float(sys.argv[3])
    order_id = sys.argv[4]
    api_user = sys.argv[5].strip().upper()

    global API_KEY, API_SECRET, API_AUTH_TOKEN
    API_KEY, API_SECRET = get_groww_credentials(api_user)

    if not API_KEY or not API_SECRET:
        raise RuntimeError(f"Missing Groww credentials for user {api_user}. Save them in credentials.json or via /save-credentials.")

    API_AUTH_TOKEN = GrowwAPI.get_access_token(
        api_key=API_KEY,
        secret=API_SECRET,
    )

    # Calculate 1.7% profit target price
    sell_price = round(buy_price * 1.017, 2)
    log(f"TARGET EXIT PRICE CALCULATED: {sell_price}")

    # Establish API Session
    login()

    # =======================================================
    # STEP 1: MONITOR INITIAL BUY ORDER EXECUTION
    # =======================================================
    start_time = time.time()
    executed = False
    actual_buy_price = buy_price

    while True:
        elapsed = time.time() - start_time

        # Timeout limit: Cancel buy order after 20 minutes
        if elapsed >= 20 * 60:
            log("TIMEOUT: BUY ORDER NOT FILLED WITHIN 20 MINUTES.")
            cancel_order(order_id)
            sys.exit(0)

        order = check_order_status(order_id)
        if order:
            status = order.get("order_status", "").upper()
            log(f"CURRENT BUY ORDER STATUS: {status}")

            if status in ["COMPLETED", "EXECUTED"]:
                executed = True
                # Fallback to targeted buy_price if average_price key isn't provided
                actual_buy_price = float(order.get("average_price", buy_price))
                log(f"BUY EXECUTION SUCCESSFUL | FILLED PRICE: {actual_buy_price}")
                break

            elif status in ["REJECTED", "CANCELLED", "FAILED"]:
                log(f"CRITICAL: BUY ORDER UNABLE TO COMPLETE. STATUS: {status}")
                sys.exit(1)

        time.sleep(5)

    # =======================================================
    # STEP 2: POSITION MONITORING STRATEGY
    # =======================================================
    if executed:
        
        # ---------------------------------------------------
        # PHASE A & B: TRACK THE 1.7% TARGET FOR 120 SECONDS
        # ---------------------------------------------------
        start_time = time.time()

        while time.time() - start_time < 120:
            current_price = get_ltp(stock_symbol)
            if current_price is None:
                time.sleep(1)
                continue

            percentage = ((current_price - actual_buy_price) / actual_buy_price) * 100
            log(f"LTP: {current_price} | GAIN/LOSS %: {round(percentage, 2)}%")

            # Target reached (1.7%)
            if percentage >= 1.7:
                log("TARGET CRITERIA MATCHED. INITIATING TARGET EXIT...")
                sell_order_id = place_sell_order_with_price(stock_symbol, quantity, sell_price)

                # Wait exactly 10 seconds for the limit order to match the depth
                time.sleep(10)
                sell_order = check_order_status(sell_order_id)

                if sell_order:
                    sell_status = sell_order.get("order_status", "").upper()
                    log(f"LIMIT EXIT STATUS: {sell_status}")

                    if sell_status in ["COMPLETED", "EXECUTED"]:
                        log("SUCCESS: LIMIT TARGET EXECUTION COMPLETED.")
                        sys.exit(0)

                # If limit order doesn't clear in 10s, hard-exit using Market Sell
                log("WARNING: LIMIT EXIT NOT FILLED IN 10 SECONDS. CONVERTING TO MARKET EXIT.")
                cancel_order(sell_order_id)
                place_sell_order(stock_symbol, quantity)
                sys.exit(0)

            time.sleep(1)

        # ---------------------------------------------------
        # PHASE C: CHECK FOR POSITIVE PROFIT FOR ANOTHER 120 SECONDS
        # ---------------------------------------------------
        log("TARGET NOT HIT WITHIN FIRST 2 MINUTES. ENTERING GREEN-ZONE EXIT PHASE.")
        start_time = time.time()

        while time.time() - start_time < 120:
            current_price = get_ltp(stock_symbol)
            if current_price is None:
                log("SKIPPING TICK: PRICE FETCH FAILURE")
                time.sleep(5)
                continue

            profit = (current_price - actual_buy_price) * quantity
            log(f"CURRENT RUNNING PNL = INR {round(profit, 2)}")

            # Exit immediately if the position turns even slightly profitable
            if profit > 0:
                log("POSITION RECOVERED TO PROFIT. SQUARING OFF VIA MARKET ORDER.")
                place_sell_order(stock_symbol, quantity)
                sys.exit(0)

            time.sleep(1)

        # ---------------------------------------------------
        # TIME EXPIRED: HARD MARKET EXIT
        # ---------------------------------------------------
        log("NO PROFIT POTENTIAL DETECTED AFTER TOTAL TIME ELAPSED.")
        log("FORCE CLOSING POSITION AT MARKET PRICE.")
        place_sell_order(stock_symbol, quantity)
        sys.exit(0)

# ===========================================================
# ENTRY POINT
# ===========================================================
if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log("EXECUTION INTERRUPTED BY USER.")
    except Exception as e:
        log(f"CRITICAL SYSTEM FAILURE: {e}")