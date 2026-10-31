# Ghép ảnh kiểm của text-presets/test.mjs thành tờ xem nhanh.
#   thu-<n>.jpg       : 10 khung cuối / tờ (2 cột × 5 hàng), nhãn: preset · bộ chữ · nền · chế độ nền · theme
#   dien-hoat-<n>.jpg : 8 preset / tờ, mỗi hàng 5 khung giữa lúc diễn hoạt + khung cuối
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

d = json.load(open(sys.argv[1])); out = d["out"]
try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
except OSError: font = ImageFont.load_default()

def fit(path, w, h):
    im = Image.open(path).convert("RGB"); r = min(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))))
    c = Image.new("RGB", (w, h), (12, 12, 12)); c.paste(im, ((w - im.width) // 2, (h - im.height) // 2)); return c

TW, TH, LB = 1080, 400, 30
cs = d["cases"]
for s in range((len(cs) + 9) // 10):
    sh = Image.new("RGB", (TW * 2, (TH + LB) * 5), (30, 30, 30)); dr = ImageDraw.Draw(sh)
    for j, c in enumerate(cs[s * 10:s * 10 + 10]):
        x, y = (j // 5) * TW, (j % 5) * (TH + LB)
        dr.text((x + 10, y + 6), c["label"], fill=(255, 220, 0), font=font)
        sh.paste(fit(c["final"], TW, TH), (x, y + LB))
    sh.save(os.path.join(out, f"thu-{s + 1}.jpg"), quality=86)

an = [c for c in cs if c["frames"]]
FW, FH = 420, 230
for s in range((len(an) + 7) // 8):
    sh = Image.new("RGB", (FW * 6, (FH + LB) * 8), (30, 30, 30)); dr = ImageDraw.Draw(sh)
    for j, c in enumerate(an[s * 8:s * 8 + 8]):
        y = j * (FH + LB)
        dr.text((10, y + 6), c["label"] + "   |  " + "  ".join(f"{t:.2f}s" for t in d["frames"]) + "  · cuối", fill=(0, 230, 255), font=font)
        for k, f in enumerate(c["frames"] + [c["final"]]): sh.paste(fit(f, FW - 4, FH), (k * FW, y + LB))
    sh.save(os.path.join(out, f"dien-hoat-{s + 1}.jpg"), quality=84)
print(f"tờ: {(len(cs) + 9) // 10} khung cuối, {(len(an) + 7) // 8} diễn hoạt")
