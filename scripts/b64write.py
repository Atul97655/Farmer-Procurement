import sys, base64, pathlib

def write_b64(filepath, b64_str):
    p = pathlib.Path(filepath)
    p.parent.mkdir(parents=True, exist_ok=True)
    content = base64.b64decode(b64_str).decode('utf-8')
    p.write_text(content, encoding='utf-8')
    print(f'[OK] Wrote {filepath}')

if __name__ == '__main__':
    if len(sys.argv) == 2:
        b64_str = sys.stdin.read().strip()
        write_b64(sys.argv[1], b64_str)
    elif len(sys.argv) >= 3:
        write_b64(sys.argv[1], sys.argv[2])