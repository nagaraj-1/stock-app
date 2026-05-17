import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CREDENTIALS_FILE = BASE_DIR / "credentials.json"


def load_credentials() -> dict:
    try:
        if not CREDENTIALS_FILE.exists():
            return {}

        with CREDENTIALS_FILE.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def save_credentials(credentials: dict) -> bool:
    try:
        with CREDENTIALS_FILE.open("w", encoding="utf-8") as f:
            json.dump(credentials, f, indent=2)
        return True
    except Exception:
        return False


def get_groww_credentials(user: str):
    if not user:
        return None, None

    user_key = user.strip().upper()
    credentials = load_credentials()
    user_data = credentials.get(user_key, {})

    return user_data.get("api_key"), user_data.get("secret")
