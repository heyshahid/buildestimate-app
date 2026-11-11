from PIL import Image, ImageDraw, ImageFont
import os

def generate_icons(base_dir):
    for size in [192, 512]:
        img = Image.new('RGBA', (size, size), (15, 23, 42, 255)) # Slate 900
        draw = ImageDraw.Draw(img)
        
        # Rounded border / inner glow
        border_pad = int(size * 0.05)
        corner_r = int(size * 0.22)
        draw.rounded_rectangle(
            [border_pad, border_pad, size - border_pad, size - border_pad],
            radius=corner_r,
            outline=(51, 65, 85, 255),
            width=max(2, int(size * 0.015))
        )
        
        # Grid lines
        for step in range(1, 4):
            pos = int(size * step / 4)
            draw.line([(border_pad, pos), (size - border_pad, pos)], fill=(30, 41, 59, 255), width=max(1, int(size * 0.005)))
            draw.line([(pos, border_pad), (pos, size - border_pad)], fill=(30, 41, 59, 255), width=max(1, int(size * 0.005)))
            
        # Draw Yellow/Amber Hardhat
        center_x = size // 2
        hat_w = int(size * 0.55)
        hat_h = int(size * 0.35)
        top_y = int(size * 0.22)
        
        # Dome
        draw.chord(
            [center_x - hat_w // 2, top_y, center_x + hat_w // 2, top_y + hat_h * 2],
            start=180, end=0,
            fill=(245, 158, 11, 255) # Amber 500
        )
        # Ridge
        ridge_w = int(size * 0.08)
        draw.rectangle(
            [center_x - ridge_w // 2, top_y, center_x + ridge_w // 2, top_y + hat_h],
            fill=(251, 191, 36, 255) # Amber 400
        )
        # Rim
        rim_y = top_y + hat_h
        rim_h = max(4, int(size * 0.06))
        rim_w = int(size * 0.65)
        draw.rounded_rectangle(
            [center_x - rim_w // 2, rim_y, center_x + rim_w // 2, rim_y + rim_h],
            radius=rim_h // 2,
            fill=(217, 119, 6, 255) # Amber 600
        )
        
        # Blueprint Ruler / Chevron
        rule_y = int(size * 0.70)
        draw.line(
            [(int(size * 0.25), rule_y), (center_x, int(size * 0.82)), (int(size * 0.75), rule_y)],
            fill=(14, 165, 233, 255), # Sky 500
            width=max(3, int(size * 0.025))
        )
        # Center pip
        pip_r = max(4, int(size * 0.03))
        draw.ellipse(
            [center_x - pip_r, int(size * 0.82) - pip_r, center_x + pip_r, int(size * 0.82) + pip_r],
            fill=(56, 189, 248, 255)
        )
        
        out_path = os.path.join(base_dir, f'icon-{size}.png')
        img.save(out_path, 'PNG')
        print(f"Saved: {out_path}")

generate_icons(r'D:\BuildEstimate\icons')
generate_icons(r'C:\Users\ahmad\.gemini\antigravity\scratch\buildestimate\icons' if os.path.exists(r'C:\Users\ahmad\.gemini\antigravity\scratch\buildestimate') else r'D:\BuildEstimate\icons')
