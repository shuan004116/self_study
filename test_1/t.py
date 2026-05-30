import sys
sys.path.insert(0, "e:/claude_test/desktop-pet")
from spritesheet import Spritesheet
from pathlib import Path
ss = Spritesheet(Path("e:/claude_test/desktop-pet/resources/skins/ikun-hoops"))
print(ss.get_all_states())
for s in ss.get_all_states():
    print(s, ss.get_frame_count(s))
