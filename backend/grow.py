import requests
from growwapi import GrowwAPI
import pyotp
import sys

from datetime import datetime

# ==========================================
# UNIQUE ORDER ID
# ==========================================

order_reference_id = "SLM" + datetime.now().strftime("%Y%m%d%H%M%S")

# ==========================================
# API
# ==========================================
API_KEY = "eyJraWQiOiJaTUtjVXciLCJhbGciOiJFUzI1NiJ9.eyJleHAiOjI1NjczMzE1OTQsImlhdCI6MTc3ODkzMTU5NCwibmJmIjoxNzc4OTMxNTk0LCJzdWIiOiJ7XCJ0b2tlblJlZklkXCI6XCJjNjFhNDM1Ny0yOGU0LTQzNjEtYTBkYS0xZjgzNWFjODM1ZWJcIixcInZlbmRvckludGVncmF0aW9uS2V5XCI6XCJlMzFmZjIzYjA4NmI0MDZjODg3NGIyZjZkODQ5NTMxM1wiLFwidXNlckFjY291bnRJZFwiOlwiY2U2YjJiMjUtMjIyZC00NDIzLThmNmQtNDQ1OGM4ZTYwOWJkXCIsXCJkZXZpY2VJZFwiOlwiMWEzODVmMDItNTZjOS01ZDFlLTk0NDMtZmZlZmVmMjZlMTJiXCIsXCJzZXNzaW9uSWRcIjpcIjYyZTM3NDgyLTY2YTYtNGE2MS04MWYzLWYyZDE5NWJjNGNiOFwiLFwiYWRkaXRpb25hbERhdGFcIjpcIno1NC9NZzltdjE2WXdmb0gvS0EwYkVPVm9GMW9LQkZmN0lwdEpsRW1zcWxSTkczdTlLa2pWZDNoWjU1ZStNZERhWXBOVi9UOUxIRmtQejFFQisybTdRPT1cIixcInJvbGVcIjpcImF1dGgtdG90cFwiLFwic291cmNlSXBBZGRyZXNzXCI6XCIxMjIuMTY1LjIwOC4xNDksMTcyLjY5LjEyOS4xOTksMzUuMjQxLjIzLjEyM1wiLFwidHdvRmFFeHBpcnlUc1wiOjI1NjczMzE1OTQyNjEsXCJ2ZW5kb3JOYW1lXCI6XCJncm93d0FwaVwifSIsImlzcyI6ImFwZXgtYXV0aC1wcm9kLWFwcCJ9.ed6V9NSBHNQYQ3kAjWkaQZ7C_8rvTeLQgJ7pJjiwQt79CKamG44Jhz1P_EBXNQKRpVMUCsA02rDBLjJXtt1Szg"
API_SECRET = "3XCi&I3hax3hSqD#h4MREur^ah)s@8!m"


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
