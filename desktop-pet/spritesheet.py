"""精灵图加载 - 兼容 Codex Pet 格式"""
import json
from pathlib import Path
from PySide6.QtGui import QPixmap, QImage
from PySide6.QtCore import Qt


class Spritesheet:
    """从 spritesheet.png + skin.json 加载帧，兼容 Codex 格式"""

    def __init__(self, skin_dir: Path):
        self.skin_dir = skin_dir
        self.meta = {}
        self.frame_width = 192
        self.frame_height = 208
        self.frames: dict[str, list[QPixmap]] = {}
        self._load()

    # 标准 Codex 9 行动画映射（Petdex 格式没有 skin.json 时使用）
    CODEX_STATES = [
        ("idle", 8), ("move", 6), ("jump", 6),
        ("fall", 6), ("attack", 6), ("hit", 6),
        ("skill", 6), ("dead", 6), ("interact", 6),
    ]

    @staticmethod
    def _count_row_frames(img: QImage, row: int, max_cols: int, fw: int = 192, fh: int = 208) -> int:
        """检测一行中有多少帧包含实际像素内容（非全透明）"""
        y_mid = row * fh + fh // 2
        count = 0
        for c in range(max_cols):
            x_mid = c * fw + fw // 2
            has_content = False
            for dx in range(-8, 9, 4):
                for dy in range(-8, 9, 4):
                    if 0 <= x_mid + dx < img.width() and 0 <= y_mid + dy < img.height():
                        px = img.pixel(x_mid + dx, y_mid + dy)
                        if (px >> 24) & 0xFF > 10:
                            has_content = True
                            break
                if has_content:
                    break
            if has_content:
                count = c + 1
            else:
                break
        return max(count, 1)

    def _load(self):
        # 读取 pet.json 获取帧尺寸
        pet_json = self.skin_dir / "pet.json"
        if pet_json.exists():
            with open(pet_json, "r", encoding="utf-8") as f:
                pet_meta = json.load(f)
            fs = pet_meta.get("frameSize", {})
            self.frame_width = fs.get("width", 192)
            self.frame_height = fs.get("height", 208)

        # 查找精灵图：支持 .png 和 .webp
        img_path = None
        for ext in ("spritesheet.png", "spritesheet.webp"):
            p = self.skin_dir / ext
            if p.exists():
                img_path = p
                break
        if not img_path:
            return
        img = QImage(str(img_path))
        if img.isNull():
            return

        # 优先读 skin.json（Codex 标准格式）
        json_path = self.skin_dir / "skin.json"
        if json_path.exists():
            with open(json_path, "r", encoding="utf-8") as f:
                self.meta = json.load(f)
            states = self.meta.get("states", self.meta)
        else:
            # Petdex 格式：没有 skin.json，从图片尺寸推算网格，自动检测每行实际帧数
            cols = img.width() // self.frame_width if self.frame_width else 8
            rows = img.height() // self.frame_height if self.frame_height else 9
            states = {}
            for row_idx in range(min(rows, len(self.CODEX_STATES))):
                name = self.CODEX_STATES[row_idx][0]
                actual_frames = self._count_row_frames(img, row_idx, cols, self.frame_width, self.frame_height)
                states[name] = {"line": row_idx, "frames": actual_frames}

        for state_name, info in states.items():
            if isinstance(info, dict) and "line" in info:
                # Codex 格式: {"line": 0, "frames": 6}
                row = info["line"]
                num_frames = info["frames"]
            elif isinstance(info, dict) and "row" in info:
                # 旧格式: {"row": 0, "frames": 6, "fps": 8}
                row = info["row"]
                num_frames = info["frames"]
            else:
                continue

            state_frames = []
            for col in range(num_frames):
                x = col * self.frame_width
                y = row * self.frame_height
                frame_img = img.copy(x, y, self.frame_width, self.frame_height)
                state_frames.append(QPixmap.fromImage(frame_img))
            self.frames[state_name] = state_frames

    def get_frame(self, state: str, index: int) -> QPixmap | None:
        frames = self.frames.get(state)
        if not frames:
            return None
        return frames[index % len(frames)]

    def get_frame_count(self, state: str) -> int:
        return len(self.frames.get(state, []))

    def has_state(self, state: str) -> bool:
        return state in self.frames

    def get_all_states(self) -> list[str]:
        return list(self.frames.keys())
