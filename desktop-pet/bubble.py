"""气泡对话系统"""
import random
from datetime import datetime
from PySide6.QtWidgets import QWidget
from PySide6.QtCore import Qt, QTimer, QPropertyAnimation, QEasingCurve, QRect
from PySide6.QtGui import QPainter, QColor, QFont, QFontMetrics, QPainterPath
from config import BUBBLES_DIR, load_json


class BubbleWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Tool)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setAttribute(Qt.WidgetAttribute.WA_ShowWithoutActivating)
        self._text = ""
        self._opacity = 0.0
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._fade_out)
        self._font = QFont("Microsoft YaHei", 10)
        self._fm = QFontMetrics(self._font)
        self.hide()

    def set_text(self, text: str):
        self._text = text
        self._calc_size()
        self._opacity = 1.0
        self.update()

    def _calc_size(self):
        """根据文字内容计算合适的尺寸"""
        max_w = 200
        text_rect = self._fm.boundingRect(
            QRect(0, 0, max_w - 20, 10000),
            Qt.TextFlag.TextWordWrap, self._text
        )
        w = max(60, min(max_w, text_rect.width() + 20))
        h = text_rect.height() + 12
        self.setFixedSize(w, h + 10)  # +10 给箭头留空间

    def paintEvent(self, event):
        if not self._text or self._opacity <= 0:
            return
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setOpacity(self._opacity)

        # 气泡主体
        rect = QRect(2, 2, self.width() - 4, self.height() - 12)
        path = QPainterPath()
        path.addRoundedRect(rect.x(), rect.y(), rect.width(), rect.height(), 8, 8)

        # 小箭头
        ax = rect.center().x()
        ay = rect.bottom()
        path.moveTo(ax - 5, ay)
        path.lineTo(ax, ay + 8)
        path.lineTo(ax + 5, ay)

        painter.fillPath(path, QColor(255, 255, 255, 230))
        painter.setPen(QColor(180, 180, 180))
        painter.drawPath(path)

        # 文字
        painter.setPen(QColor(50, 50, 50))
        painter.setFont(self._font)
        text_rect = rect.adjusted(8, 4, -8, -4)
        painter.drawText(text_rect, Qt.TextFlag.TextWordWrap, self._text)
        painter.end()

    def show_at(self, x: int, y: int, duration_ms: int = 4000):
        self.move(x - self.width() // 2, y - self.height() - 10)
        self.show()
        self.update()
        self._timer.start(duration_ms)

    def _fade_out(self):
        self._timer.stop()
        fade = QPropertyAnimation(self, b"windowOpacity")
        fade.setDuration(300)
        fade.setStartValue(1.0)
        fade.setEndValue(0.0)
        fade.setEasingCurve(QEasingCurve.Type.OutQuad)
        fade.finished.connect(self.hide)
        fade.start()
        self._fade_anim = fade


class BubbleSystem:
    def __init__(self):
        self.dialogues: dict[str, list] = {}
        for cat in ["work", "daily", "encourage", "trivia", "holiday"]:
            data = load_json(BUBBLES_DIR / f"{cat}.json")
            self.dialogues[cat] = data if isinstance(data, list) else data.get("lines", []) if isinstance(data, dict) else []

    def get_random(self, category: str) -> str:
        lines = self.dialogues.get(category, [])
        return random.choice(lines) if lines else "..."

    def get_for_mood(self, mood_level: str) -> str:
        cat = {"ecstatic": "encourage", "happy": "daily", "normal": "daily",
               "low": "encourage", "sad": "encourage"}.get(mood_level, "daily")
        return self.get_random(cat)

    def get_for_scene(self, scene: str) -> str:
        cat = {"coding": "work", "success": "encourage", "fail": "encourage",
               "idle": "daily"}.get(scene, "daily")
        return self.get_random(cat)
