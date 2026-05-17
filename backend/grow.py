import requests
from growwapi import GrowwAPI
import pyotp
import sys
from credentials import get_groww_credentials

from datetime import datetime

# ==========================================
# UNIQUE ORDER ID
# ==========================================

order_reference_id = "SLM" + datetime.now().strftime("%Y%m%d%H%M%S")

# ==========================================
# API
# ==========================================
if len(sys.argv) < 6:
    raise RuntimeError("Usage: python3 grow.py ACTION SYMBOL QTY PRICE USER")

API_USER = sys.argv[5].strip().upper()
API_KEY, API_SECRET = get_groww_credentials(API_USER)

if not API_KEY or not API_SECRET:
    raise RuntimeError(f"Missing Groww credentials for user {API_USER}. Save them in credentials.json or via /save-credentials.")


# ==========================================
# LOGIN
# ==========================================

access_token = GrowwAPI.get_access_token(
    api_key=API_KEY,
    secret=API_SECRET,
)

groww = GrowwAPI(access_token)

print("LOGIN SUCCESS", flush=True)

# ==========================================
# ACTION
# ==========================================

action = sys.argv[1].upper()

# ==========================================
# CANCEL ORDER
# ==========================================

if action == "CANCEL":

    order_id = sys.argv[2]
    print(order_id)
    try:

        cancel_order_response = groww.cancel_order(
            segment=groww.SEGMENT_CASH,
            groww_order_id=order_id,
        )

        print("CANCEL RESPONSE:", cancel_order_response, flush=True)

    except Exception as e:

        print("CANCEL FAILED:", str(e), flush=True)

    sys.exit(0)

# ==========================================
# INPUTS
# ==========================================

symbol = sys.argv[2].upper()

qty = int(sys.argv[3])

price = float(sys.argv[4])

print("ACTION:", action, flush=True)

print("SYMBOL:", symbol, flush=True)

print("QTY:", qty, flush=True)

print("PRICE:", price, flush=True)

# ==========================================
# TRANSACTION TYPE
# ==========================================

transaction_type = (
    groww.TRANSACTION_TYPE_BUY if action == "BUY" else groww.TRANSACTION_TYPE_SELL
)

# ==========================================
# PLACE ORDER
# ==========================================

try:

    # ==========================================
    # ORDER TYPE
    # ==========================================

    if action == "BUY":

        # BUY → STOP LOSS MARKET

        place_order_response = groww.place_order(
            trading_symbol=symbol,
            quantity=qty,
            validity=groww.VALIDITY_DAY,
            exchange=groww.EXCHANGE_NSE,
            segment=groww.SEGMENT_CASH,
            product=groww.PRODUCT_MIS,
            order_type=groww.ORDER_TYPE_STOP_LOSS_MARKET,
            transaction_type=transaction_type,
            trigger_price=price,
            order_reference_id=order_reference_id,
        )

    else:

        # SELL → NORMAL MARKET ORDER

        place_order_response = groww.place_order(
            trading_symbol=symbol,
            quantity=qty,
            validity=groww.VALIDITY_DAY,
            exchange=groww.EXCHANGE_NSE,
            segment=groww.SEGMENT_CASH,
            product=groww.PRODUCT_MIS,
            order_type=groww.ORDER_TYPE_MARKET,
            transaction_type=transaction_type,
            order_reference_id=order_reference_id,
        )

    print("ORDER RESPONSE:", place_order_response, flush=True)

    # ======================================
    # EXTRACT ORDER ID
    # ======================================

    groww_order_id = ""

    if isinstance(place_order_response, dict):

        groww_order_id = place_order_response.get("groww_order_id", "")

    # ======================================
    # PRINT FOR FASTAPI
    # ======================================

    print("ORDER ID:", groww_order_id, flush=True)

except Exception as e:

    print("FAILED:", str(e), flush=True)
