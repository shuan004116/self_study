"""控制台窗口 - 管理宠物和皮肤"""
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QFrame, QTabWidget, QFileDialog, QListWidget,
)
from PySide6.QtCore import Qt, QTimer, Signal
from PySide6.QtGui import QPalette, QColor

from config import load_user_config, save_user_config
from mood import MoodSystem
from skin_manager import SkinManager
from spritesheet import Spritesheet


class PetPreview(QWidget):
    def __init__(self, spritesheet: Spritesheet, parent=None):
        super().__init__(parent)
        self.ss = spritesheet
        self.state = "idle"
        self.frame = 0
        self.setMinimumSize(160, 180)
        self._t = QTimer(self)
        self._t.timeout.connect(self._tick)
        self._t.start(83)

    def set_spritesheet(self, ss):
        self.ss = ss; self.frame = 0

    def _tick(self):
        c = self.ss.get_frame_count(self.state)
        if c > 0:
            self.frame = (self.frame + 1) % c; self.update()

    def set_state(self, s):
        if self.ss.has_state(s): self.state = s; self.frame = 0

    def paintEvent(self, event):
        p = self.ss.get_frame(self.state, self.frame)
        if p:
            pa = __import__("PySide6.QtGui", fromlist=["QPainter"]).QPainter(self)
            pa.setRenderHint(__import__("PySide6.QtGui", fromlist=["QPainter"]).QPainter.RenderHint.SmoothPixmapTransform)
            sc = p.scaled(self.width()-10, self.height()-10,
                          Qt.AspectRatioMode.KeepAspectRatio,
                          Qt.TransformationMode.SmoothTransformation)
            pa.drawPixmap((self.width()-sc.width())//2, (self.height()-sc.height())//2, sc)


class MainWindow(QMainWindow):
    feed_requested = Signal()
    pet_head_requested = Signal()
    toggle_pet_requested = Signal()
    skin_changed = Signal(str)

    def __init__(self):
        super().__init__()
        self.setWindowTitle("伊蕾雅 桌面宠物 - 控制台")
        self.setMinimumSize(600, 440)
        self.resize(680, 480)
        pal = self.palette()
        pal.setColor(QPalette.ColorRole.Window, QColor(245, 245, 245))
        self.setPalette(pal)

        self.user_config = load_user_config()
        self.mood_system = MoodSystem()
        self.skin_manager = SkinManager()
        skin = self.skin_manager.get_current_skin()
        self.ss = Spritesheet(skin.directory)

        self._init_ui()
        QTimer(self).singleShot(5000, self._update)

    def _init_ui(self):
        c = QWidget(); self.setCentralWidget(c)
        lay = QVBoxLayout(c); lay.setContentsMargins(16, 16, 16, 16)

        # 标题
        h = QHBoxLayout()
        t = QLabel("伊蕾雅 控制台")
        t.setStyleSheet("font-size:20px;font-weight:bold;color:#333;")
        h.addWidget(t); h.addStretch()
        self.pet_btn = QPushButton("隐藏宠物")
        self.pet_btn.setFixedHeight(34)
        self.pet_btn.setStyleSheet("QPushButton{background:#e57373;color:white;border:none;border-radius:6px;padding:0 16px;font-size:13px}"
                                   "QPushButton:hover{background:#d32f2f}")
        self.pet_btn.clicked.connect(self.toggle_pet_requested.emit)
        h.addWidget(self.pet_btn)
        lay.addLayout(h)

        # Tab
        tabs = QTabWidget()
        tabs.addTab(self._home_tab(), "🏠 首页")
        tabs.addTab(self._skin_tab(), "🎨 皮肤")
        tabs.addTab(self._achieve_tab(), "🏆 成就")
        lay.addWidget(tabs)
        self.statusBar().showMessage("就绪")

    def _home_tab(self):
        w = QWidget(); lay = QVBoxLayout(w)
        self.preview = PetPreview(self.ss)
        self.preview.setStyleSheet("border:2px solid #e0e8f5;border-radius:10px;background:white;")
        lay.addWidget(self.preview)
        br = QHBoxLayout()
        for txt, sig in [("🍖 喂食", self.feed_requested), ("🤚 摸头", self.pet_head_requested)]:
            b = QPushButton(txt); b.setFixedHeight(36)
            b.setStyleSheet("QPushButton{background:#4a6fa5;color:white;border:none;border-radius:6px;font-weight:bold}"
                            "QPushButton:hover{background:#3a5f95}")
            b.clicked.connect(sig.emit); br.addWidget(b)
        lay.addLayout(br)

        # 心情卡片
        card = QFrame()
        card.setStyleSheet("QFrame{background:white;border:1px solid #e0e0e0;border-radius:8px;padding:10px;}")
        cl = QVBoxLayout(card)
        cl.addWidget(QLabel("心情"))
        self.mood_lbl = QLabel("50/100")
        self.mood_lbl.setStyleSheet("font-size:18px;font-weight:bold;color:#4CAF50;")
        cl.addWidget(self.mood_lbl)
        lay.addWidget(card)
        lay.addStretch()
        return w

    def _skin_tab(self):
        w = QWidget(); lay = QVBoxLayout(w)
        lay.addWidget(QLabel("已安装的皮肤（Codex 兼容格式）"))

        self.skin_list = QListWidget()
        for s in self.skin_manager.list_skins():
            self.skin_list.addItem(f"{s.display_name} v{s.version} — {s.author}")
        lay.addWidget(self.skin_list)

        br = QHBoxLayout()
        imp = QPushButton("导入 Codex 宠物包...")
        imp.setFixedHeight(36)
        imp.setStyleSheet("QPushButton{background:#FF9800;color:white;border:none;border-radius:6px;font-weight:bold}"
                          "QPushButton:hover{background:#F57C00}")
        imp.clicked.connect(self._import_pet)
        br.addWidget(imp)

        use = QPushButton("使用选中皮肤")
        use.setFixedHeight(36)
        use.setStyleSheet("QPushButton{background:#4CAF50;color:white;border:none;border-radius:6px;font-weight:bold}"
                          "QPushButton:hover{background:#43A047}")
        use.clicked.connect(self._use_skin)
        br.addWidget(use)
        lay.addLayout(br)
        return w

    def _achieve_tab(self):
        w = QWidget(); lay = QVBoxLayout(w)
        from achievement import AchievementSystem
        ach = AchievementSystem()
        for a in ach.get_all_achievements():
            card = QFrame()
            u = a["unlocked"]
            card.setStyleSheet(f"QFrame{{background:{'#e8f5e9' if u else '#f5f5f5'};"
                               f"border:1px solid {'#a5d6a7' if u else '#e0e0e0'};"
                               f"border-radius:8px;padding:10px;}}")
            row = QHBoxLayout(card)
            row.addWidget(QLabel("✅" if u else "🔒"))
            info = QVBoxLayout()
            n = QLabel(a["name"])
            n.setStyleSheet(f"font-weight:bold;color:{'#2e7d32' if u else '#888'};")
            info.addWidget(n)
            info.addWidget(QLabel(a["description"]))
            row.addLayout(info, 1)
            lay.addWidget(card)
        lay.addStretch()
        return w

    def _import_pet(self):
        folder = QFileDialog.getExistingDirectory(self, "选择 Codex 宠物包文件夹")
        if folder:
            from pathlib import Path
            ok = self.skin_manager.import_codex_pet(Path(folder))
            if ok:
                self.statusBar().showMessage("导入成功！", 3000)
                self.skin_list.clear()
                for s in self.skin_manager.list_skins():
                    self.skin_list.addItem(f"{s.display_name} v{s.version} — {s.author}")
            else:
                self.statusBar().showMessage("导入失败：缺少 pet.json / skin.json / spritesheet.png", 5000)

    def _use_skin(self):
        row = self.skin_list.currentRow()
        if row >= 0:
            skins = self.skin_manager.list_skins()
            if row < len(skins):
                name = skins[row].name
                self.skin_manager.set_current(name)
                self.user_config["current_skin"] = name
                save_user_config(self.user_config)
                self.ss = Spritesheet(skins[row].directory)
                self.preview.set_spritesheet(self.ss)
                self.skin_changed.emit(name)
                self.statusBar().showMessage(f"已切换到: {skins[row].display_name}", 3000)

    def _update(self):
        self.mood_lbl.setText(f"{self.mood_system.mood}/100 ({self.mood_system.get_level_label()})")
        lk = self.mood_system.get_level()
        self.preview.set_state("fall" if lk in ("low", "sad") else "idle")

    def update_pet_button(self, visible):
        if visible:
            self.pet_btn.setText("隐藏宠物")
            self.pet_btn.setStyleSheet("QPushButton{background:#e57373;color:white;border:none;border-radius:6px;padding:0 16px;font-size:13px}"
                                       "QPushButton:hover{background:#d32f2f}")
        else:
            self.pet_btn.setText("显示宠物")
            self.pet_btn.setStyleSheet("QPushButton{background:#4a6fa5;color:white;border:none;border-radius:6px;padding:0 16px;font-size:13px}"
                                       "QPushButton:hover{background:#3a5f95}")

    def closeEvent(self, e): e.ignore(); self.hide()
