from kiteconnect import KiteConnect
import sys
import uuid
API_KEY = "gy6zhrcj24q331y0"



# ==========================================
# LOGIN
# ==========================================

with open("access_token.txt") as f:
    access_token = f.read().strip()

kite = KiteConnect(api_key=API_KEY)
kite.set_access_token(access_token)

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

    print("ORDER ID:", order_id, flush=True)

    try:

        cancel_order_response = kite.cancel_order(
            variety=kite.VARIETY_REGULAR,
            order_id=order_id
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
    kite.TRANSACTION_TYPE_BUY
    if action == "BUY"
    else kite.TRANSACTION_TYPE_SELL
)

# ==========================================
# UNIQUE ORDER ID
# ==========================================

order_reference_id = str(uuid.uuid4())[:12]

# ==========================================
# PLACE ORDER
# ==========================================

try:

    # ==========================================
    # BUY ORDER
    # ==========================================

    if action == "BUY":

        # BUY STOPLOSS MARKET

      order_id = kite.place_order(
    variety=kite.VARIETY_REGULAR,
    exchange=kite.EXCHANGE_NSE,
    tradingsymbol=symbol,
    transaction_type=transaction_type,
    quantity=qty,
    product=kite.PRODUCT_MIS,

    order_type=kite.ORDER_TYPE_SLM,
    price=0,
    trigger_price=price,

    market_protection=2,   # 2% protection

    validity=kite.VALIDITY_DAY,
    tag=order_reference_id
)

    # ==========================================
    # SELL ORDER
    # ==========================================

    else:

        # SELL MARKET ORDER

        order_id = kite.place_order(
            variety=kite.VARIETY_REGULAR,
            exchange=kite.EXCHANGE_NSE,
            tradingsymbol=symbol,
            transaction_type=transaction_type,
            quantity=qty,
            product=kite.PRODUCT_MIS,

            # 1. Change to LIMIT for safety
            order_type=kite.ORDER_TYPE_LIMIT,

            # 2. You MUST provide a price parameter when using LIMIT
            price=price,  # Specify your desired entry limit price

            validity=kite.VALIDITY_DAY,
            tag=order_reference_id
        )
    print("ORDER SUCCESS", flush=True)

    print("ORDER ID:", order_id, flush=True)

except Exception as e:

    print("FAILED:", str(e), flush=True)