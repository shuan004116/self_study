import sys
sys.path.insert(0, "e:/claude_test/desktop-pet")

from pathlib import Path
from skin_manager import SkinManager
from spritesheet import Spritesheet

sm = SkinManager()
print("Skins:", [s.name for s in sm.list_skins()])

skin = sm.get_skin("ikun-hoops")
if skin:
    ss = Spritesheet(skin.directory)
    print("States:", ss.get_all_states())
    for s in ss.get_all_states():
        print(f"  {s}: {ss.get_frame_count(s)} frames")
else:
    print("ikun-hoops not found")
