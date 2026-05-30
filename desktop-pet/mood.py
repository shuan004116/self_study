"""心情系统"""
from config import MOOD_DATA_PATH, MOOD_INITIAL, MOOD_EVENTS, load_json, save_json


class MoodSystem:
    def __init__(self):
        self.data = load_json(MOOD_DATA_PATH)
        if not self.data:
            self.data = {"mood": MOOD_INITIAL, "daily_water_count": 0,
                         "consecutive_water": 0, "consecutive_rest": 0}
            self._save()

    @property
    def mood(self) -> int:
        return self.data.get("mood", MOOD_INITIAL)

    @mood.setter
    def mood(self, v):
        self.data["mood"] = max(0, min(100, v))
        self._save()

    def apply_event(self, event: str):
        self.mood = self.mood + MOOD_EVENTS.get(event, 0)

    def get_level(self) -> str:
        m = self.mood
        if m >= 80: return "ecstatic"
        if m >= 60: return "happy"
        if m >= 40: return "normal"
        if m >= 20: return "low"
        return "sad"

    def get_level_label(self) -> str:
        return {"ecstatic": "非常开心", "happy": "开心", "normal": "普通",
                "low": "低落", "sad": "难过"}.get(self.get_level(), "普通")

    def on_feed(self): self.apply_event("feed"); self._save()
    def on_pet_head(self): self.apply_event("pet_head"); self._save()
    def on_rest(self): self.apply_event("rest_on_time"); self._save()
    def on_no_interaction(self): self.apply_event("no_interaction_hour"); self._save()
    def on_water_drunk(self):
        self.data["daily_water_count"] = self.data.get("daily_water_count", 0) + 1
        self.apply_event("feed"); self._save()

    def get_summary(self) -> str:
        return f"心情: {self.mood}/100 ({self.get_level_label()})\n今日喝水: {self.data.get('daily_water_count', 0)} 次"

    def _save(self): save_json(MOOD_DATA_PATH, self.data)
