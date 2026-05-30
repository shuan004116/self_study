"""皮肤管理器 - 兼容 Codex Pet 包格式"""
import json
from pathlib import Path
from PySide6.QtGui import QPixmap, QImage
from config import SKINS_DIR


class SkinInfo:
    """单个皮肤的信息"""

    def __init__(self, name: str, directory: Path):
        self.name = name
        self.directory = directory
        self.meta = {}
        self.pet_meta = {}
        self._load()

    def _load(self):
        # skin.json
        skin_path = self.directory / "skin.json"
        if skin_path.exists():
            with open(skin_path, "r", encoding="utf-8") as f:
                self.meta = json.load(f)

        # pet.json (Codex 格式)
        pet_path = self.directory / "pet.json"
        if pet_path.exists():
            with open(pet_path, "r", encoding="utf-8") as f:
                self.pet_meta = json.load(f)

    @property
    def display_name(self) -> str:
        return self.pet_meta.get("displayName") or self.meta.get("name", self.name)

    @property
    def description(self) -> str:
        return self.pet_meta.get("description", "")

    @property
    def author(self) -> str:
        return self.pet_meta.get("author", "未知")

    @property
    def version(self) -> str:
        return self.pet_meta.get("version", "1.0")

    @property
    def is_codex_format(self) -> bool:
        return bool(self.pet_meta)

    def get_preview(self) -> QPixmap | None:
        preview = self.directory / "preview.png"
        if preview.exists():
            return QPixmap(str(preview))
        # 取 spritesheet 第一帧
        img_path = self.directory / "spritesheet.png"
        if not img_path.exists():
            return None
        img = QImage(str(img_path))
        if img.isNull():
            return None
        fw = self.pet_meta.get("frameSize", {}).get("width", 192)
        fh = self.pet_meta.get("frameSize", {}).get("height", 208)
        return QPixmap.fromImage(img.copy(0, 0, fw, fh))

    def get_state_names(self) -> list[str]:
        return list(self.meta.keys())


class SkinManager:
    """扫描 skins/ 目录，加载所有 Codex 兼容皮肤"""

    def __init__(self):
        self.skins: dict[str, SkinInfo] = {}
        self.current_skin_name = "ireiya"
        self._scan()

    def _scan(self):
        if not SKINS_DIR.exists():
            return
        for d in SKINS_DIR.iterdir():
            if d.is_dir() and ((d / "skin.json").exists() or (d / "pet.json").exists()):
                self.skins[d.name] = SkinInfo(d.name, d)

    def get_skin(self, name: str) -> SkinInfo | None:
        return self.skins.get(name)

    def get_current_skin(self) -> SkinInfo:
        return self.skins.get(self.current_skin_name) or self.get_default_skin()

    def get_default_skin(self) -> SkinInfo:
        if self.skins:
            return next(iter(self.skins.values()))
        return SkinInfo("default", SKINS_DIR / "default")

    def set_current(self, name: str) -> bool:
        if name in self.skins:
            self.current_skin_name = name
            return True
        return False

    def list_skins(self) -> list[SkinInfo]:
        return list(self.skins.values())

    def import_codex_pet(self, source_dir: Path, pet_name: str = None) -> bool:
        """导入 Codex/Petdex 宠物包到 skins/ 目录"""
        pet_json = source_dir / "pet.json"
        if not pet_json.exists():
            return False

        # 查找精灵图：支持 .png 和 .webp
        sheet = None
        for ext in ("spritesheet.png", "spritesheet.webp"):
            p = source_dir / ext
            if p.exists():
                sheet = p
                break
        if not sheet:
            return False

        if not pet_name:
            with open(pet_json, "r", encoding="utf-8") as f:
                pet_data = json.load(f)
            pet_name = pet_data.get("id", source_dir.name)

        target = SKINS_DIR / pet_name
        target.mkdir(parents=True, exist_ok=True)

        import shutil
        shutil.copy2(pet_json, target / "pet.json")
        shutil.copy2(sheet, target / sheet.name)

        # 如果有 skin.json 也一并复制
        skin_json = source_dir / "skin.json"
        if skin_json.exists():
            shutil.copy2(skin_json, target / "skin.json")

        # 重新扫描
        self._scan()
        return True

    def refresh(self):
        self._scan()
