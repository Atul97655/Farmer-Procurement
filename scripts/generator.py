# Generator script for KrishiSetu
import os, pathlib, sys

def save(rel_path, content):
    p = pathlib.Path(rel_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.strip() + chr(10), encoding='utf-8')
    print(f'[OK] {rel_path}')

print('Generator script initialized')
