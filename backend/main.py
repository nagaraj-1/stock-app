from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from threading import Thread
from pathlib import Path
import json
import subprocess
import asyncio
from kiteconnect import KiteConnect
from credentials import load_credentials, save_credentials, get_groww_credentials

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
main_loop = None
INVESTMENT_FILE = BASE_DIR / "invest.json"
KITE_API_KEY = "gy6zhrcj24q331y0"
KITE_API_SECRET = "zwyo86ur9opg5jrd98ajnjypyls5ad2q"


def load_investment_settings():
    try:
        if not INVESTMENT_FILE.exists():
            return {}

        with INVESTMENT_FILE.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print("INVESTMENT SETTINGS READ ERROR:", e)
        return {}


def save_investment_settings(settings: dict) -> bool:
    try:
        with INVESTMENT_FILE.open("w", encoding="utf-8") as f:
            json.dump(settings, f, indent=2)
        return True
    except Exception as e:
        print("INVESTMENT SETTINGS WRITE ERROR:", e)
        return False


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# GLOBALS
# ==========================================

clients = []

running_processes = {}

# ==========================================
# SEND LIVE LOGS
# ==========================================


async def send_log(message):

    disconnected = []

    for client in clients:

        try:

            await client.send_text(
                message
            )

        except Exception as e:

            print(
                "WS ERROR:",
                str(e)
            )

            disconnected.append(
                client
            )

    for client in disconnected:

        clients.remove(client)


@app.on_event("startup")
async def startup_event():
    global main_loop
    main_loop = asyncio.get_running_loop()

def broadcast_log(message):
    print(message)
    if main_loop and main_loop.is_running():
        asyncio.run_coroutine_threadsafe(send_log(message), main_loop)


# ==========================================
# WEBSOCKET
# ==========================================


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket
):

    await websocket.accept()

    clients.append(websocket)

    print("WS CLIENT CONNECTED")

    try:

        while True:

            await asyncio.sleep(1)

    except Exception as e:

        print("WS ERROR:", e)

    finally:

        if websocket in clients:

            clients.remove(websocket)

        print(
            "WS CLIENT DISCONNECTED"
        )


# ==========================================
# HOME
# ==========================================


@app.get("/")
def home():

    return {
        "message":
            "Trading API Running"
    }


# ==========================================
# INVESTMENT SETTINGS
# ==========================================


@app.get("/investment-settings")
def get_investment_settings():
    return load_investment_settings()


@app.post("/investment-settings")
def post_investment_settings(data: dict):
    if not isinstance(data, dict):
        return {
            "status": "error",
            "message": "Invalid payload, expected JSON object.",
        }

    if save_investment_settings(data):
        return {
            "status": "success",
            "settings": data,
        }

    return {
        "status": "error",
        "message": "Unable to save investment settings.",
    }



# ==========================================
# CREDENTIALS STORAGE
# ==========================================

@app.get("/save-credentials")
def save_creds(user: str, api_key: str, secret: str):
    if not user or not api_key or not secret:
        raise HTTPException(
            status_code=400,
            detail="user, api_key, and secret query parameters are required.",
        )

    user_key = user.strip().upper()
    credentials = load_credentials()
    credentials[user_key] = {
        "api_key": api_key,
        "secret": secret,
    }

    if not save_credentials(credentials):
        raise HTTPException(
            status_code=500,
            detail="Unable to save credentials.",
        )

    return {
        "status": "success",
        "message": f"Credentials saved for {user_key}.",
        "user": user_key,
    }


# ==========================================
# KITE AUTH TOKEN SAVE
# ==========================================

@app.get("/kiteAuthTokenSaveNAG")
def kite_auth_token_save(request_token: str):
    try:
        
        kite = KiteConnect(api_key=KITE_API_KEY)

        data = kite.generate_session(
        request_token,
        api_secret=KITE_API_SECRET
        )

        access_token = data["access_token"]
        user = data["user"]

        print("\nACCESS TOKEN:")
        print(access_token)

        with open("access_token-"+user+".txt", "w") as f:
            f.write(access_token)

        return {
            "status": "success",
            "message": "Request token and access token saved.",
            "request_token": request_token,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ==========================================
# RUN LIVE PROCESS
# ==========================================


def run_live_process(command):

    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    output = ""

    for line in process.stdout:

        line = line.strip()

        if not line:
            continue

        print(line)

        output += line + "\n"

        broadcast_log(line)

    process.wait()

    return output


# ==========================================
# EXECUTE ORDER
# BUY / SELL
# ==========================================


@app.get("/intraday-stocks")
def get_intraday_stocks():

    try:

        # ==========================================
        # NODE SCRIPT PATH
        # ==========================================

        node_script = BASE_DIR / "grow.js"

        if not node_script.exists():

            return {
                "status": "error",
                "message": "grow.js not found in backend folder.",
                "data": [],
            }

        # ==========================================
        # RUN NODE SCRIPT
        # ==========================================

        process = subprocess.run(
            ["node", str(node_script)],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=90,
        )

        output = process.stdout.strip()

        error_output = process.stderr.strip()

        # ==========================================
        # DEBUG
        # ==========================================

        print("RETURN CODE:", process.returncode)

        if error_output:
            print("STDERR:", error_output)

        # ==========================================
        # FIND JSON LINE
        # ==========================================

        json_line = ""

        for line in reversed(output.splitlines()):

            line = line.strip()

            if line.startswith("{") and line.endswith("}"):

                json_line = line

                break

        # ==========================================
        # NO JSON
        # ==========================================

        if not json_line:

            return {
                "status": "error",
                "message": "grow.js did not return JSON.",
                "output": output,
                "error": error_output,
                "data": [],
            }

        # ==========================================
        # PARSE JSON
        # ==========================================

        result = json.loads(json_line)

        data = result.get("data", [])

        # ==========================================
        # NODE ERROR
        # ==========================================

        if result.get("status") != "success":

            return {
                "status": "error",
                "message": result.get(
                    "message",
                    "grow.js failed."
                ),
                "output": output,
                "error": error_output,
                "data": data,
            }

        # ==========================================
        # TABLE HEADERS
        # ==========================================

        headers = [
            "Stock",
            "Symbol",
            "LTP",
            "Change",
        ]

        # ==========================================
        # TABLE ROWS
        # ==========================================

        rows = []

        for stock in data:

            rows.append([
                stock.get("stock", ""),
                stock.get("symbol", ""),
                stock.get("ltp", ""),
                stock.get("change", ""),
            ])

        # ==========================================
        # SUCCESS
        # ==========================================

        return {
            "status": "success",
            "data": data,
            "headers": headers,
            "rows": rows,
            "output": output,
        }

    except subprocess.TimeoutExpired:

        return {
            "status": "error",
            "message": "grow.js timeout exceeded.",
            "data": [],
        }

    except json.JSONDecodeError as e:

        return {
            "status": "error",
            "message": f"Invalid JSON: {str(e)}",
            "data": [],
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e),
            "data": [],
        }


@app.get("/stock-symbol")
def get_stock_symbol(stock_name: str):
    try:
        node_script = BASE_DIR / "symbol.js"

        process = subprocess.run(
            ["node", str(node_script), stock_name],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=90000,
        )

        output = process.stdout.strip()

        json_line = ""

        for line in reversed(output.splitlines()):
            line = line.strip()

            if line.startswith("{"):
                json_line = line
                break

        result = json.loads(json_line)

        return result.get("symbol", "")

    except Exception as e:
        return str(e)

@app.post("/execute-order")
def execute_order(data: dict):

    try:

        action = data["action"].upper()

        symbol = data["symbol"]

        qty = str(data["qty"])

        price = str(data["price"])

        platform = data["platform"]

        user = data["user"]

        print(
            "\n========== NEW ORDER =========="
        )

        print("ACTION:", action)

        print("SYMBOL:", symbol)

        print("QTY:", qty)

        print("PRICE:", price)

        print("PLATFORM:", platform)

        # ======================================
        # PLATFORM SCRIPT
        # ======================================

        script_name = ""

        if platform == "AngelOne":

            script_name = "angelone.py"

        elif platform == "Kite":

            script_name = "kite-"+user+".py"

        elif platform == "Groww":

            script_name = "grow.py"

        else:

            return {
                "status": "error",
                "message":
                    "Invalid platform",
            }

        print("SCRIPT:", script_name)

        # If Groww, validate credentials exist before spawning the script
        if platform == "Groww":
            api_key, api_secret = get_groww_credentials(user)
            if not api_key or not api_secret:
                return {
                    "status": "error",
                    "message": f"Missing Groww credentials for user {user}. Save via /save-credentials.",
                }

        # ======================================
        # RUN SCRIPT
        # ======================================

        cmd = [
            "python3",
            "-u",
            script_name,
            action,
            symbol,
            qty,
            price,
        ]

        # Pass user for Groww scripts which expect a user identifier
        if platform == "Groww" and user:
            cmd.append(user)

        output = run_live_process(cmd)

        # ======================================
        # GET ORDER ID
        # ======================================

        order_id = ""

        lines = output.splitlines()

        for line in lines:

            if "ORDER ID:" in line:

                order_id = (
                    line.replace(
                        "ORDER ID:",
                        ""
                    ).strip()
                )

        return {
            "status": "success",
            "action": action,
            "platform": platform,
            "symbol": symbol,
            "qty": qty,
            "price": price,
            "order_id": order_id,
            "script": script_name,
            "output": output,
        }

    except Exception as e:

        print(
            "FASTAPI ERROR:",
            str(e)
        )

        return {
            "status": "error",
            "message": str(e),
        }


# ==========================================
# CANCEL ORDER
# ==========================================


@app.post("/cancel-order")
def cancel_order(data: dict):

    try:

        order_id = data["order_id"]

        platform = data["platform"]
        user = data.get("user", "")

        print(
            "\n========== CANCEL ORDER =========="
        )

        print("ORDER ID:", order_id)

        print("PLATFORM:", platform)

        script_name = ""

        if platform == "AngelOne":

            script_name = "angelone.py"

        elif platform == "Kite":

            script_name = "kite-"+user+".py"

        elif platform == "Groww":

            script_name = "grow.py"

        else:

            return {
                "status": "error",
                "message":
                    "Invalid platform",
            }

        cmd = [
            "python3",
            "-u",
            script_name,
            "CANCEL",
            order_id,
        ]

        if platform == "Groww" and user:
            cmd.append(user)

        output = run_live_process(cmd)

        return {
            "status": "success",
            "order_id": order_id,
            "platform": platform,
            "output": output,
        }

    except Exception as e:

        print(
            "CANCEL API ERROR:",
            str(e)
        )

        return {
            "status": "error",
            "message": str(e),
        }


# ==========================================
# AI PROCESS
# ==========================================


def run_ai_process(
    script_name,
    symbol,
    qty,
    price,
    order_id,
    user,
):

    global running_processes

    process = subprocess.Popen(
        [
            "python3",
            "-u",
            script_name,
            symbol,
            qty,
            price,
            order_id,
            user,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    # STORE PROCESS

    running_processes[
        order_id
    ] = process

    for line in process.stdout:

        line = line.strip()

        if not line:
            continue

        print(line)

        broadcast_log(line)

    # REMOVE PROCESS AFTER END

    if order_id in running_processes:

        del running_processes[
            order_id
        ]


# ==========================================
# AI ORDER TRACKING
# ==========================================


@app.post("/ai-order-tracking")
async def ai_order_tracking(
    data: dict
):

    try:

        symbol = data["symbol"]

        qty = str(data["qty"])

        price = str(data["price"])

        order_id = str(
            data["order_id"]
        )

        platform = data["platform"]

        user = data.get("user", "")

        script_name = ""

        if platform == "AngelOne":

            script_name = (
                "angelone-ai.py"
            )

        elif platform == "Kite":

            script_name = (
                "kite-"+user+"ai.py"
            )

        elif platform == "Groww":

            script_name = (
                "grow-ai.py"
            )

        else:

            return {
                "status": "error",
                "message":
                    "Invalid platform",
            }

        # ======================================
        # START THREAD
        # ======================================

        Thread(
            target=run_ai_process,
            args=(
                script_name,
                symbol,
                qty,
                price,
                order_id,
                user,
            ),
            daemon=True,
        ).start()

        return {
            "status": "success",
            "message":
                "AI Tracking Started",
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e),
        }


# ==========================================
# STOP TRACKING
# ==========================================


@app.post("/stop-tracking")
def stop_tracking(data: dict):

    try:

        order_id = str(
            data["order_id"]
        )

        process = running_processes.get(
            order_id
        )

        if not process:

            return {
                "status": "error",
                "message":
                    "Tracking not running",
            }

        process.kill()

        del running_processes[
            order_id
        ]

        broadcast_log(f"TRACKING STOPPED: {order_id}")

        return {
            "status": "success",
            "message":
                "Tracking stopped",
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e),
        }
