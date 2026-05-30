"""系统托盘"""
from PySide6.QtWidgets import QSystemTrayIcon, QMenu
from PySide6.QtGui import QIcon, QPixmap, QPainter, QColor, QFont
from PySide6.QtCore import Signal, QObject


def _icon():
    p = QPixmap(32, 32); p.fill(QColor(0, 0, 0, 0))
    pa = QPainter(p); pa.setRenderHint(QPainter.RenderHint.Antialiasing)
    pa.setBrush(QColor(200, 220, 255)); pa.setPen(QColor(100, 150, 220))
    pa.drawEllipse(2, 2, 28, 28)
    pa.setPen(QColor(60, 60, 60)); pa.setFont(QFont("Arial", 14, QFont.Weight.Bold))
    pa.drawText(p.rect(), 0x0084, "伊"); pa.end()
    return QIcon(p)


class TrayIcon(QObject):
    feed_clicked = Signal()
    pet_head_clicked = Signal()
    settings_clicked = Signal()
    mute_toggled = Signal()
    toggle_pet = Signal()
    quit_clicked = Signal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self.tray = QSystemTrayIcon()
        self.tray.setIcon(_icon())
        self.tray.setToolTip("伊蕾雅 桌面宠物")
        self.tray.activated.connect(lambda r: self.settings_clicked.emit() if r == QSystemTrayIcon.ActivationReason.Trigger else None)
        menu = QMenu()
        menu.setStyleSheet("QMenu{background:#fff;border:1px solid #ddd;border-radius:6px;padding:4px}"
                           "QMenu::item{padding:6px 20px;border-radius:4px}"
                           "QMenu::item:selected{background:#e8f0fe}")
        menu.addAction("🍖 喂食").triggered.connect(self.feed_clicked.emit)
        menu.addAction("🤚 摸头").triggered.connect(self.pet_head_clicked.emit)
        menu.addSeparator()
        menu.addAction("⚙️ 控制台").triggered.connect(self.settings_clicked.emit)
        menu.addAction("👻 显示/隐藏宠物").triggered.connect(self.toggle_pet.emit)
        menu.addAction("🔇 静音").triggered.connect(self.mute_toggled.emit)
        menu.addSeparator()
        menu.addAction("❌ 退出").triggered.connect(self.quit_clicked.emit)
        self.tray.setContextMenu(menu)

    def show(self): self.tray.show()
    def hide(self): self.tray.hide()
