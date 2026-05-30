"""宠物主窗口 - 支持 Codex 9状态动画"""
import random, time
from PySide6.QtWidgets import QWidget, QMenu
from PySide6.QtCore import Qt, QTimer, QPoint, QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QPainter, QShortcut, QKeySequence

from config import load_user_config, save_user_config, DEFAULT_SCALE, MIN_SCALE, MAX_SCALE
from spritesheet import Spritesheet
from skin_manager import SkinManager
from bubble import BubbleSystem, BubbleWidget
from mood import MoodSystem
from achievement import AchievementSystem
from monitor import ProcessMonitor
from reminder import ReminderSystem

# Codex 状态 → 内部状态映射
# Codex: idle/move/jump/fall/attack/hit/skill/dead/interact
# 内部: idle/walk_right/happy/sad/angry/sad/dance/sleep/greet
CODEX_TO_INTERNAL = {
    "idle": "idle", "move": "walk_right", "jump": "happy",
    "fall": "sad", "attack": "angry", "hit": "sad",
    "skill": "dance", "dead": "sleep", "interact": "greet",
}

# 反向映射：内部事件 → Codex 状态
EVENT_TO_CODEX = {
    "walk_right": "move", "walk_left": "move", "happy": "jump",
    "sad": "fall", "angry": "attack", "sleep": "dead",
    "greet": "interact", "dance": "skill", "coding": "idle",
    "drink": "interact", "stretch": "jump", "eat": "interact",
}


class PetWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.user_config = load_user_config()

        # 子系统
        self.skin_manager = SkinManager()
        self.bubble_system = BubbleSystem()
        self.mood_system = MoodSystem()
        self.achievement_system = AchievementSystem()
        self.process_monitor = ProcessMonitor(self.user_config.get("app_config", {}), self)
        self.reminder_system = ReminderSystem(self.user_config.get("reminders", {}), self)

        # 精灵图
        skin = self.skin_manager.get_current_skin()
        self.spritesheet = Spritesheet(skin.directory)

        # 状态
        self.current_state = "idle"
        self.current_frame = 0
        self.scale = self.user_config.get("scale", DEFAULT_SCALE)
        self._visible = True
        self._user_hidden = False
        self._muted = self.user_config.get("muted", False)
        self._last_interaction = time.time()
        self._start_time = time.time()
        self._is_dragging = False
        self._drag_moved = False
        self._drag_offset = QPoint()
        self._press_pos = QPoint()

        self._init_window()
        self.bubble = BubbleWidget()

        # 动画
        self._anim_timer = QTimer(self)
        self._anim_timer.timeout.connect(self._next_frame)
        self._anim_timer.start(83)  # 12 FPS

        # 行为
        self._behavior_timer = QTimer(self)
        self._behavior_timer.timeout.connect(self._random_behavior)
        self._behavior_timer.start(random.randint(30000, 60000))

        self._idle_timer = QTimer(self)
        self._idle_timer.timeout.connect(self._check_idle)
        self._idle_timer.start(5000)

        self._mood_timer = QTimer(self)
        self._mood_timer.timeout.connect(lambda: self.mood_system.on_no_interaction())
        self._mood_timer.start(3600000)

        # 信号
        self.process_monitor.active_app_changed.connect(self._on_app_changed)
        self.process_monitor.fullscreen_detected.connect(self._on_fullscreen)
        self.reminder_system.remind.connect(self._on_remind)

        self.achievement_system.check_and_unlock(self.mood_system.data)
        self._init_shortcuts()
        self._position_window()

    def _init_window(self):
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint | Qt.WindowType.WindowStaysOnTopHint | Qt.WindowType.Tool)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setAttribute(Qt.WidgetAttribute.WA_ShowWithoutActivating)
        self._resize_to_sprite()

    def _init_shortcuts(self):
        QShortcut(QKeySequence("Ctrl+Alt+P"), self, self.toggle_visible)
        QShortcut(QKeySequence("Ctrl+Alt+F"), self, self.feed)
        QShortcut(QKeySequence("Ctrl+Alt+M"), self, self.toggle_mute)

    def _position_window(self):
        x, y = self.user_config.get("pet_x", -1), self.user_config.get("pet_y", -1)
        if x < 0 or y < 0:
            s = self.screen()
            if s:
                g = s.geometry()
                x, y = g.width() - self.width() - 50, g.height() - self.height() - 80
        self.move(x, y)

    def _next_frame(self):
        count = self.spritesheet.get_frame_count(self.current_state)
        if count == 0: return
        self.current_frame = (self.current_frame + 1) % count
        self.update()
        # 单次动画播完回 idle
        one_shot = {"jump", "fall", "attack", "hit", "skill", "interact"}
        if self.current_state in one_shot and self.current_frame == 0:
            self.set_state("idle")

    def set_state(self, state: str):
        if state == self.current_state: return
        if not self.spritesheet.has_state(state):
            state = "idle"
        self.current_state = state
        self.current_frame = 0

    def switch_skin(self, skin_name: str):
        skin = self.skin_manager.get_skin(skin_name)
        if not skin:
            return
        self.skin_manager.set_current(skin_name)
        self.spritesheet = Spritesheet(skin.directory)
        self.set_state("idle")
        self.user_config["current_skin"] = skin_name
        save_user_config(self.user_config)

    def paintEvent(self, event):
        pixmap = self.spritesheet.get_frame(self.current_state, self.current_frame)
        if pixmap:
            painter = QPainter(self)
            painter.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform)
            painter.drawPixmap(0, 0, self.width(), self.height(), pixmap)

    def _resize_to_sprite(self):
        """窗口大小精确匹配精灵图，不保留透明边距"""
        w = int(self.spritesheet.frame_width * self.scale)
        h = int(self.spritesheet.frame_height * self.scale)
        self.setFixedSize(w, h)

    # ─── 鼠标交互 ───

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self._press_pos = event.globalPosition().toPoint()
            self._drag_offset = self._press_pos - self.pos()
            self._is_dragging = True
            self._drag_moved = False
            self._last_interaction = time.time()

    def mouseMoveEvent(self, event):
        if self._is_dragging:
            cur = event.globalPosition().toPoint()
            d = cur - self._press_pos
            if not self._drag_moved and (abs(d.x()) > 5 or abs(d.y()) > 5):
                self._drag_moved = True
                self.set_state("attack")  # 拖拽挣扎
            if self._drag_moved:
                self.move(cur - self._drag_offset)

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton and self._is_dragging:
            if self._drag_moved:
                self._fall()
            else:
                self._on_single_click()
            self._is_dragging = False
            self._drag_moved = False
            self._last_interaction = time.time()

    def mouseDoubleClickEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.set_state("interact")
            self._show_bubble("你好呀~ ✨")
            self._last_interaction = time.time()

    def wheelEvent(self, event):
        delta = event.angleDelta().y()
        self.scale = max(MIN_SCALE, min(MAX_SCALE, self.scale + (0.05 if delta > 0 else -0.05)))
        self._resize_to_sprite()
        self.user_config["scale"] = self.scale
        save_user_config(self.user_config)

    def _on_single_click(self):
        m = self.mood_system
        w = m.data.get("daily_water_count", 0)
        work = int((time.time() - self._start_time) / 60)
        self._show_bubble(f"心情: {m.mood}/100 ({m.get_level_label()})\n今日喝水: {w} 次\n已工作: {work} 分钟")

    def _show_context_menu(self, pos):
        menu = QMenu(self)
        menu.setStyleSheet("QMenu{background:#fff;border:1px solid #ddd;border-radius:6px;padding:4px}"
                           "QMenu::item{padding:6px 24px;border-radius:4px}"
                           "QMenu::item:selected{background:#e8f0fe}")
        menu.addAction("🍖 喂食").triggered.connect(self.feed)
        menu.addAction("🤚 摸摸头").triggered.connect(self.pet_head)
        menu.addSeparator()
        mute = "🔊 取消静音" if self._muted else "🔇 静音"
        menu.addAction(mute).triggered.connect(self.toggle_mute)
        hide = "👁️ 显示" if not self._visible else "👻 隐藏"
        menu.addAction(hide).triggered.connect(self.toggle_visible)
        menu.addSeparator()
        menu.addAction("❌ 退出").triggered.connect(self._quit)
        menu.exec(pos)

    # ─── 动作 ───

    def feed(self):
        self.set_state("interact")
        self.mood_system.on_feed()
        self._show_bubble("好吃！谢谢~ 🍖")
        self._last_interaction = time.time()

    def pet_head(self):
        self.set_state("jump")
        self.mood_system.on_pet_head()
        self._show_bubble("嘿嘿，好舒服~")
        self._last_interaction = time.time()

    def _fall(self):
        self.set_state("fall")
        screen = self.screen()
        if screen:
            ty = screen.geometry().height() - self.height() - 40
            self._fall_anim = QPropertyAnimation(self, b"pos")
            self._fall_anim.setDuration(400)
            self._fall_anim.setStartValue(self.pos())
            self._fall_anim.setEndValue(QPoint(self.x(), ty))
            self._fall_anim.setEasingCurve(QEasingCurve.Type.BounceOut)
            self._fall_anim.start()

    def toggle_visible(self):
        if self.isVisible():
            self.hide()
            self._visible = False
            self._user_hidden = True
        else:
            self._user_hidden = False
            self.show()
            self._visible = True

    def toggle_mute(self):
        self._muted = not self._muted
        self.user_config["muted"] = self._muted
        save_user_config(self.user_config)

    def _show_bubble(self, text):
        self.bubble.set_text(text)
        self.bubble.show_at(self.x() + self.width() // 2, self.y())

    def _show_bubble_for_state(self):
        self._show_bubble(self.bubble_system.get_for_mood(self.mood_system.get_level()))

    # ─── 状态机 ───

    def _random_behavior(self):
        if self.current_state != "idle":
            self._behavior_timer.start(random.randint(30000, 60000)); return
        r = random.random()
        if r < 0.25:
            self.set_state("move")
            QTimer.singleShot(800, lambda: self.set_state("idle") if self.current_state == "move" else None)
        elif r < 0.5:
            self.set_state("move")
            QTimer.singleShot(800, lambda: self.set_state("idle") if self.current_state == "move" else None)
        elif r < 0.75:
            self._show_bubble_for_state()
        self._behavior_timer.start(random.randint(30000, 60000))

    def _check_idle(self):
        elapsed = time.time() - self._last_interaction
        if elapsed > 300 and self.current_state != "dead":
            self.set_state("dead")
        elif elapsed > 60 and self.current_state == "idle" and random.random() < 0.3:
            self._show_bubble_for_state()

    def _on_app_changed(self, name):
        if not self.process_monitor.should_show(name):
            self.hide()
            self._visible = False
            return
        if not self._visible and not self._user_hidden:
            self.show()
            self._visible = True
        if self.process_monitor.is_coding_app(name) and self.current_state == "idle":
            self._show_bubble("在写代码呢~加油！")
        elif self.process_monitor.is_browser_app(name) and self.current_state == "idle":
            self._show_bubble("在浏览网页呢~")

    def _on_fullscreen(self, full):
        if full and self._visible:
            self.hide()
            self._visible = False
        elif not full and not self._visible and not self._user_hidden:
            self.show()
            self._visible = True

    def _on_remind(self, typ, msg):
        self._show_bubble(msg)
        if typ == "water": self.set_state("interact")
        elif typ == "rest": self.set_state("jump")

    def _save_position(self):
        self.user_config["pet_x"] = self.x()
        self.user_config["pet_y"] = self.y()
        save_user_config(self.user_config)

    def _quit(self):
        self._save_position()
        self.bubble.close()
        from PySide6.QtWidgets import QApplication
        QApplication.quit()

    def closeEvent(self, event):
        self._save_position()
        self.bubble.close()
        super().closeEvent(event)
