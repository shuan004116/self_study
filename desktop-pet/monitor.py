"""进程监控"""
import platform, ctypes
from PySide6.QtCore import QObject, QTimer, Signal

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

if platform.system() == "Windows":
    user32 = ctypes.windll.user32


class ProcessMonitor(QObject):
    active_app_changed = Signal(str)
    fullscreen_detected = Signal(bool)

    def __init__(self, app_config: dict, parent=None):
        super().__init__(parent)
        self.app_config = app_config
        self._last = ""
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._check)
        self._timer.start(2000)

    def update_config(self, cfg): self.app_config = cfg

    def _check(self):
        name = self._get_fg_process()
        if name != self._last:
            self._last = name
            self.active_app_changed.emit(name)
        self.fullscreen_detected.emit(self._is_fullscreen())

    def _get_fg_process(self) -> str:
        if not HAS_PSUTIL or platform.system() != "Windows":
            return ""
        try:
            hwnd = user32.GetForegroundWindow()
            pid = ctypes.c_ulong()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            return psutil.Process(pid.value).name()
        except Exception:
            return ""

    def _is_fullscreen(self) -> bool:
        if platform.system() != "Windows":
            return False
        try:
            hwnd = user32.GetForegroundWindow()
            rect = ctypes.wintypes.RECT()
            user32.GetWindowRect(hwnd, ctypes.byref(rect))
            return (rect.right - rect.left) >= user32.GetSystemMetrics(0) and \
                   (rect.bottom - rect.top) >= user32.GetSystemMetrics(1)
        except Exception:
            return False

    def should_show(self, name: str) -> bool:
        mode = self.app_config.get("mode", "global")
        if mode == "global": return True
        if self.app_config.get("auto_hide_fullscreen") and self._is_fullscreen(): return False
        if mode == "whitelist": return name in self.app_config.get("whitelist", [])
        if mode == "blacklist": return name not in self.app_config.get("blacklist", [])
        return True

    def is_coding_app(self, n: str) -> bool:
        return n in ["Code", "code.exe", "pycharm64.exe", "idea64.exe", "sublime_text.exe"]

    def is_browser_app(self, n: str) -> bool:
        return n.lower() in ["chrome.exe", "firefox.exe", "msedge.exe"]

    def is_document_app(self, n: str) -> bool:
        return n in ["WINWORD.EXE", "EXCEL.EXE", "notepad.exe"]
