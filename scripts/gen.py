# Builder script
import os, pathlib

def write_file(rel_path, content):
    p = pathlib.Path(rel_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.strip() + '\n', encoding='utf-8')
    print(f'[OK] Wrote {rel_path}')

print('Script loaded')
