"""Generate homepage thumbnails; originals remain available to project pages.

Run from the repository root with Python and Pillow installed.
"""
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    "image/fgo/saber-1.jpg",
    "games/pixel-forge/img/branding/pixel-forge-poster.png",
    "games/paper-days/poster.png",
    "games/pawjong/images/poster.png",
    "image/cases/temple.jpg",
    "image/cases/ganle-analysis.jpg",
    "image/cases/planner-play.png",
    "image/hero/PixelNihongoImg1.png",
    "image/projects/correction/corrector-gameplay.png",
    "image/projects/vr/VR_Unity_VolunteerRelated_00.png",
    "image/projects/ue/VR_pianoKeys.png",
    "image/projects/ue/UE_Blueprint_Piano_02.png",
    "image/projects/game-prototype/PygameBattleImg.png",
    "image/gameplay/splatoon-power.jpg",
    "image/gameplay/gris-meet.jpg",
    "image/gameplay/fgo-saber.jpg",
    "image/gameplay/acg-exhibition.jpg",
]

output = ROOT / "image/homepage"
output.mkdir(exist_ok=True)
before = after = 0
for source in SOURCES:
    path = ROOT / source
    # Include the parent folder to distinguish the two game posters.
    target = output / f"{path.parent.name}-{path.stem}.webp"
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image.thumbnail((960, 960), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=82, method=6)
    before += path.stat().st_size
    after += target.stat().st_size
print(f"Homepage images: {before:,} -> {after:,} bytes ({1 - after / before:.1%} smaller)")
