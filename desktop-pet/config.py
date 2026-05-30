"""全局配置管理"""
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent
RESOURCES_DIR = BASE_DIR / "resources"
SKINS_DIR = RESOURCES_DIR / "skins"
BUBBLES_DIR = RESOURCES_DIR / "bubbles"
DATA_DIR = BASE_DIR / "data"

USER_CONFIG_PATH = DATA_DIR / "user_config.json"
MOOD_DATA_PATH = DATA_DIR / "mood_data.json"
ACHIEVEMENT_DATA_PATH = DATA_DIR / "achievement_data.json"
REMINDER_LOG_PATH = DATA_DIR / "reminder_log.json"

DEFAULT_SCALE = 1.0
MIN_SCALE = 0.8
MAX_SCALE = 1.5
FRAME_INTERVAL_MS = 83  # ~12 FPS (Codex standard)

MOOD_INITIAL = 50
MOOD_EVENTS = {
    "feed": 10, "pet_head": 5, "code_success": 8,
    "rest_on_time": 5, "no_interaction_hour": -2,
    "continuous_fail": -10, "staying_up_late": -15,
}

DEFAULT_REMINDERS = {
    "water_interval": 45, "rest_interval": 60,
    "sleep_time": "23:00", "posture_interval": 30,
}

DEFAULT_APP_CONFIG = {
    "mode": "global",
    "whitelist": ["Code", "WINWORD.EXE", "chrome.exe"],
    "blacklist": ["steam.exe"],
    "auto_hide_fullscreen": True,
}


def load_json(path: Path) -> dict | list:
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_json(path: Path, data):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_user_config() -> dict:
    cfg = load_json(USER_CONFIG_PATH)
    if not cfg:
        cfg = {
            "scale": DEFAULT_SCALE, "pet_x": -1, "pet_y": -1,
            "muted": False, "app_config": DEFAULT_APP_CONFIG,
            "reminders": DEFAULT_REMINDERS, "current_skin": "ireiya",
        }
        save_json(USER_CONFIG_PATH, cfg)
    return cfg


def save_user_config(cfg: dict):
    save_json(USER_CONFIG_PATH, cfg)
