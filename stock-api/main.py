# main.py

from fastapi import FastAPI, HTTPException
from kiteconnect import KiteConnect
import uuid

app = FastAPI()

API_KEY = "gy6zhrcj24q331y0"
API_SECRET="zwyo86ur9opg5jrd98ajnjypyls5ad2q"

@app.get("/kiteAuthTokenSave")
def kite_auth_token_save(request_token: str):

    try:
        print("REQ TOKEN:", request_token)
        kite = KiteConnect(
            api_key=API_KEY
        )
        data = kite.generate_session(
            request_token,
            api_secret=API_SECRET
        )
        access_token = data["access_token"]
        print("ACCESS TOKEN:", access_token)
        with open(f"access_token.txt", "w") as f:
            f.write(access_token)

        return {
            "status": "success",
            "message": "Access token saved successfully",
            "request_token": request_token
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


with open("access_token.txt") as f:
    ACCESS_TOKEN = f.read().strip()

kite = KiteConnect(api_key=API_KEY)
kite.set_access_token(ACCESS_TOKEN)
print("LOGIN SUCCESS")


def round_to_tick(price: float, tick_size: float = 0.05):
    return round(round(price / tick_size) * tick_size, 2)


# ==========================================
# GET ALL ORDERS
# ==========================================

@app.get("/orders")
def get_orders():

    try:

        orders = kite.orders()
        return {
            "success": True,
            "total_orders": len(orders),
            "orders": orders
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# CANCEL ORDER
# ==========================================

@app.post("/cancel-order")
def cancel_order(order_id: str):

    try:

        cancel_response = kite.cancel_order(
            variety=kite.VARIETY_REGULAR,
            order_id=order_id
        )

        return {
            "success": True,
            "message": "ORDER CANCELLED",
            "response": cancel_response
        }

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# PLACE BUY ORDER
# ==========================================

@app.post("/buy")
def buy_order(
    symbol: str,
    qty: int,
    trigger_price: float
):

    try:

        trigger_price = round_to_tick(trigger_price)
        order_reference_id = str(uuid.uuid4())[:12]
        order_id = kite.place_order(
            variety=kite.VARIETY_REGULAR,
            exchange=kite.EXCHANGE_NSE,
            tradingsymbol=symbol.upper(),
            transaction_type=kite.TRANSACTION_TYPE_BUY,
            quantity=qty,
            product=kite.PRODUCT_MIS,
            order_type=kite.ORDER_TYPE_SLM,
            price=0,
            trigger_price=trigger_price,
            market_protection=0.5,
            validity=kite.VALIDITY_DAY,
            tag=order_reference_id
        )

        return {
            "success": True,
            "message": "BUY ORDER PLACED",
            "order_id": order_id,
            "trigger_price": trigger_price
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# PLACE SELL ORDER
# ==========================================

@app.post("/sell")
def sell_order(
    symbol: str,
    qty: int,
    price: float
):

    try:

        price = round_to_tick(price)
        order_reference_id = str(uuid.uuid4())[:12]
        order_id = kite.place_order(
            variety=kite.VARIETY_REGULAR,
            exchange=kite.EXCHANGE_NSE,
            tradingsymbol=symbol.upper(),
            transaction_type=kite.TRANSACTION_TYPE_SELL,
            quantity=qty,
            product=kite.PRODUCT_MIS,
            order_type=kite.ORDER_TYPE_LIMIT,
            price=price,
            validity=kite.VALIDITY_DAY,
            tag=order_reference_id
        )

        return {
            "success": True,
            "message": "SELL ORDER PLACED",
            "order_id": order_id,
            "price": price
        }

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))