"""伊蕾雅 桌面宠物 - 程序入口"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt


def main():
    app = QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(False)
    app.setApplicationName("伊蕾雅")

    pet = [None]

    def ensure_pet():
        if pet[0] is None:
            from pet import PetWindow
            pet[0] = PetWindow()
            pet[0].show()
        return pet[0]

    from tray_icon import TrayIcon
    tray = TrayIcon()
    tray.show()

    from main_window import MainWindow
    control = MainWindow()

    def toggle_pet():
        p = ensure_pet()
        p.toggle_visible()
        control.update_pet_button(p.isVisible())

    tray.feed_clicked.connect(lambda: ensure_pet().feed())
    tray.pet_head_clicked.connect(lambda: ensure_pet().pet_head())
    tray.toggle_pet.connect(toggle_pet)
    tray.settings_clicked.connect(lambda: (control.show(), control.raise_(), control.activateWindow()))
    tray.mute_toggled.connect(lambda: ensure_pet().toggle_mute())

    control.feed_requested.connect(lambda: ensure_pet().feed())
    control.pet_head_requested.connect(lambda: ensure_pet().pet_head())
    control.toggle_pet_requested.connect(toggle_pet)
    control.skin_changed.connect(lambda name: ensure_pet().switch_skin(name))

    tray.quit_clicked.connect(lambda: (pet[0]._save_position() if pet[0] else None, tray.hide(), app.quit()))

    control.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
