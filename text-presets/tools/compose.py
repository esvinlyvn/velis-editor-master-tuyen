import json, sys
from PIL import Image, ImageDraw
# ghép ảnh mẫu (trái) với bản dựng (phải) thành 4 tờ đối chiếu — xem tools/compare.mjs
W=sys.argv[1] if len(sys.argv)>1 else "work/textref"; d=json.load(open(f"{W}/cmp/box.json"))
H=220
def fit(im):
    im=im.convert("RGB"); r=H/im.height; im=im.resize((max(1,int(im.width*r)),H))
    if im.width>700: im=im.resize((700,int(H*700/im.width)))
    c=Image.new("RGB",(720,H),"black"); c.paste(im,(0,0)); return c
cells=[]
for i,(x0,y0,x1,y1) in enumerate(d["BOX"]):
    pg=Image.open(f"{W}/{d['PAGES'][i//10]}").crop((x0,y0,x1,y1))
    try: m=Image.open(f"{W}/cmp/m{i}.png")
    except FileNotFoundError: continue
    c=Image.new("RGB",(1440,H+40),(32,32,32)); c.paste(fit(pg),(0,40)); c.paste(fit(m),(720,40))
    ImageDraw.Draw(c).text((8,8),f"#{i+1} {d['ids'][i]}   MAU | THU VIEN",fill=(255,230,0))
    cells.append(c)
for k in range(4):
    sh=Image.new("RGB",(2880,(H+40)*5),"black")
    for j,c in enumerate(cells[k*10:k*10+10]): sh.paste(c,((j//5)*1440,(j%5)*(H+40)))
    sh.save(f"{W}/cmp/sheet{k}.jpg",quality=85)
# tờ phụ: khung cuối ổn định của video diễn hoạt (bpk_<id>.png) cạnh bản dựng
bc=[]
for i,pid in enumerate(d["ids"][:40]):
    try: ref=Image.open(f"{W}/bpk_{pid}.png"); m=Image.open(f"{W}/cmp/m{i}.png")
    except FileNotFoundError: continue
    c=Image.new("RGB",(1440,H+40),(32,32,32)); c.paste(fit(ref),(0,40)); c.paste(fit(m),(720,40))
    ImageDraw.Draw(c).text((8,8),f"#{i+1} {pid}   MAU (video 2) | THU VIEN",fill=(0,230,255))
    bc.append(c)
for k in range((len(bc)+9)//10):
    sh=Image.new("RGB",(2880,(H+40)*5),"black")
    for j,c in enumerate(bc[k*10:k*10+10]): sh.paste(c,((j//5)*1440,(j%5)*(H+40)))
    sh.save(f"{W}/cmp/sheetB{k}.jpg",quality=85)
