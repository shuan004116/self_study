"""成就系统"""
from config import ACHIEVEMENT_DATA_PATH, load_json, save_json

ACHIEVEMENTS = {
    "first_meet": {"name": "初次见面", "description": "首次启动"},
    "water_5": {"name": "按时喝水", "description": "连续5次按时喝水"},
    "code_master": {"name": "代码大师", "description": "连续10次运行成功"},
}


class AchievementSystem:
    def __init__(self):
        self.data = load_json(ACHIEVEMENT_DATA_PATH)
        if not self.data:
            self.data = {"unlocked": []}; self._save()

    def check_and_unlock(self, mood_data: dict) -> list[str]:
        newly = []
        if "first_meet" not in self.data["unlocked"]:
            self.data["unlocked"].append("first_meet"); newly.append("初次见面")
        if mood_data.get("consecutive_water", 0) >= 5 and "water_5" not in self.data["unlocked"]:
            self.data["unlocked"].append("water_5"); newly.append("按时喝水")
        if newly: self._save()
        return newly

    def get_unlocked_count(self) -> int: return len(self.data.get("unlocked", []))
    def get_all_achievements(self) -> list[dict]:
        return [{"key": k, "name": v["name"], "description": v["description"],
                 "unlocked": k in self.data.get("unlocked", [])} for k, v in ACHIEVEMENTS.items()]
    def _save(self): save_json(ACHIEVEMENT_DATA_PATH, self.data)
