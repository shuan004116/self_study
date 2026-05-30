"""健康提醒"""
from datetime import datetime
from PySide6.QtCore import QObject, QTimer, Signal
from config import REMINDER_LOG_PATH, load_json, save_json


class ReminderSystem(QObject):
    remind = Signal(str, str)

    def __init__(self, settings: dict, parent=None):
        super().__init__(parent)
        self.settings = settings
        self._last_water = datetime.now()
        self._last_rest = datetime.now()
        self._water_pending = False
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._check)
        self._timer.start(30_000)

    def update_settings(self, s): self.settings = s

    def _check(self):
        now = datetime.now()
        if (now - self._last_water).total_seconds() / 60 >= self.settings.get("water_interval", 45) and not self._water_pending:
            self._water_pending = True
            self.remind.emit("water", "该喝水啦！💧")
        if (now - self._last_rest).total_seconds() / 60 >= self.settings.get("rest_interval", 60):
            self._last_rest = now
            self.remind.emit("rest", "站起来活动一下吧！🧘")
        if (now - self._last_rest).total_seconds() / 60 >= self.settings.get("posture_interval", 30):
            self.remind.emit("posture", "坐直了吗？保护好你的腰！🪑")

    def confirm_water(self):
        self._water_pending = False
        self._last_water = datetime.now()
