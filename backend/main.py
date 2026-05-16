from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket

from threading import Thread
from pathlib import Path
import json
import subprocess
import asyncio

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
INVESTMENT_FILE = BASE_DIR / "invest.json"


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

        asyncio.run(
            send_log(line)
        )

    process.wait()

    return output


# ==========================================
# EXECUTE ORDER
# BUY / SELL
# ==========================================


@app.post("/execute-order")
def execute_order(data: dict):

    try:

        action = data["action"].upper()

        symbol = data["symbol"]

        qty = str(data["qty"])

        price = str(data["price"])

        platform = data["platform"]

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

            script_name = "kite_buy.py"

        elif platform == "Groww":

            script_name = "grow.py"

        else:

            return {
                "status": "error",
                "message":
                    "Invalid platform",
            }

        print("SCRIPT:", script_name)

        # ======================================
        # RUN SCRIPT
        # ======================================

        output = run_live_process(
            [
                "python3",
                "-u",
                script_name,
                action,
                symbol,
                qty,
                price,
            ]
        )

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

        print(
            "\n========== CANCEL ORDER =========="
        )

        print("ORDER ID:", order_id)

        print("PLATFORM:", platform)

        script_name = ""

        if platform == "AngelOne":

            script_name = "angelone.py"

        elif platform == "Kite":

            script_name = "kite_buy.py"

        elif platform == "Groww":

            script_name = "grow.py"

        else:

            return {
                "status": "error",
                "message":
                    "Invalid platform",
            }

        output = run_live_process(
            [
                "python3",
                "-u",
                script_name,
                "CANCEL",
                order_id,
            ]
        )

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

        asyncio.run(
            send_log(line)
        )

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

        script_name = ""

        if platform == "AngelOne":

            script_name = (
                "angelone-ai.py"
            )

        elif platform == "Kite":

            script_name = (
                "kite_buy.py"
            )

        elif platform == "Groww":

            script_name = (
                "grow.py"
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

        asyncio.run(
            send_log(
                f"TRACKING STOPPED: {order_id}"
            )
        )

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