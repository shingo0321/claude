"""学習ノート(topics/*/notes.md)から音声ファイル(MP3)を生成する。

使い方(study/ で実行):
    pip install edge-tts imageio-ffmpeg
    python tools/make-audio.py                  # 変更のあったノートだけ生成
    python tools/make-audio.py --force          # すべて作り直す
    python tools/make-audio.py associate-foundations   # 試験を絞る

出力: <試験>/audio/<ドメインのフォルダ名>.mp3 と manifest.json(ハッシュ。変更検知用)。
読み方は assets/js/read-aloud-dict.js(ブラウザ読み上げと共通の読み辞書)を使う。
"""
import asyncio
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

import edge_tts
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
EXAMS = ["associate-foundations", "developer-foundations", "architect-foundations", "architect-professional"]
VOICE = "ja-JP-NanamiNeural"
RATE = "+0%"
BITRATE = "24k"      # 通信量節約のため(元の合成結果は48kbps)。音声は聞き取りに十分
CHUNK = 900          # 1回の合成に渡す最大文字数
CONCURRENCY = 4
VERSION = "2"        # 抽出・読み辞書のロジックを変えたら上げる(全再生成のため)

LETTERS = dict(zip("ABCDEFGHIJKLMNOPQRSTUVWXYZ", [
    "エー", "ビー", "シー", "ディー", "イー", "エフ", "ジー", "エイチ", "アイ", "ジェイ", "ケー", "エル", "エム",
    "エヌ", "オー", "ピー", "キュー", "アール", "エス", "ティー", "ユー", "ブイ", "ダブリュー", "エックス", "ワイ", "ゼット"]))


def load_dict():
    src = (ROOT / "assets/js/read-aloud-dict.js").read_text(encoding="utf-8")
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    body = src[src.index("{"): src.rindex("}") + 1]
    return json.loads(body)


DICT = load_dict()
_lower = {k.lower(): v for k, v in DICT.items()}
_keys = sorted(DICT.keys(), key=len, reverse=True)
_re = re.compile(r"(^|[^A-Za-z0-9])(" + "|".join(re.escape(k) for k in _keys) + r")(?![A-Za-z0-9])", re.I)
_acro = re.compile(r"(^|[^A-Za-z0-9])([A-Z]{2,6})(?![A-Za-z0-9])")


def pron(text):
    t = _re.sub(lambda m: m.group(1) + _lower.get(m.group(2).lower(), m.group(2)), text)
    t = _acro.sub(lambda m: m.group(1) + "".join(LETTERS[c] for c in m.group(2)), t)
    return t.replace("_", " ")


def inline(t):
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", t)
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"https?://\S+", "リンク", t)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"[`*]|~~", "", t)
    t = re.sub(r"(?<![A-Za-z0-9])_+|_+(?![A-Za-z0-9])", "", t)  # 強調の _ だけ除去(tool_use は残す)
    return re.sub(r"\s+", " ", t).strip()


def extract(md):
    """Markdownを読み上げ用の行のリストにする(コード・図は除外、表は1行ずつ)。"""
    md = re.sub(r"\A---\r?\n.*?\r?\n---\r?\n", "", md, flags=re.S)
    lines, fence = [], False
    for raw in md.splitlines():
        s = raw.strip()
        if s.startswith("```") or s.startswith("~~~"):
            fence = not fence
            continue
        if fence or not s or re.fullmatch(r"[-*_]{3,}", s) or re.fullmatch(r"\|?[\s:|-]+\|?", s):
            continue
        m = re.match(r"(#{1,6})\s+(.*)", s)
        if m:
            h = inline(m.group(2))
            h = re.sub(r"^\d+\.\s*", "", h)
            if h:
                lines.append(h + "。")
            continue
        if s.startswith("|"):
            cells = [inline(c) for c in s.strip("|").split("|")]
            row = "。 ".join(c for c in cells if c)
            if row:
                lines.append(row)
            continue
        s = re.sub(r"^>\s*", "", s)
        if re.match(r"^(\*\*)?(出典|注記)(\*\*)?\s*[::]", s):  # 出典・注記の行は読み上げない
            continue
        s = re.sub(r"^([-*+]|\d+\.)\s+", "", s)
        s = inline(s)
        if s:
            lines.append(s)
    return lines


def chunks(lines):
    cur, out = "", []
    for ln in lines:
        ln = pron(ln)
        if cur and len(cur) + len(ln) + 1 > CHUNK:
            out.append(cur)
            cur = ""
        cur += ln + "\n"
    if cur:
        out.append(cur)
    return out


async def synth_one(sem, text):
    async with sem:
        for attempt in range(4):
            try:
                buf = bytearray()
                async for ev in edge_tts.Communicate(text, VOICE, rate=RATE).stream():
                    if ev["type"] == "audio":
                        buf += ev["data"]
                if buf:
                    return bytes(buf)
            except Exception as e:  # noqa: BLE001
                print("  retry:", type(e).__name__, e)
            await asyncio.sleep(2 + attempt * 3)
        raise RuntimeError("音声合成に失敗しました")


def transcode(src, dst):
    """モノラル24kHz・低ビットレートのMP3へ変換する(通信量の節約)。"""
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-i", str(src),
                    "-ac", "1", "-ar", "24000", "-c:a", "libmp3lame", "-b:a", BITRATE, str(dst)], check=True)


async def build(notes_path, out_path):
    lines = extract(notes_path.read_text(encoding="utf-8"))
    parts = chunks(lines)
    sem = asyncio.Semaphore(CONCURRENCY)
    datas = await asyncio.gather(*[synth_one(sem, p) for p in parts])
    out_path.parent.mkdir(parents=True, exist_ok=True)
    raw = out_path.with_suffix(".raw.mp3")
    raw.write_bytes(b"".join(datas))
    transcode(raw, out_path)
    raw.unlink()
    return len(parts), len("".join(parts))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    exams = args or EXAMS
    for exam in exams:
        base = ROOT / exam
        mpath = base / "audio" / "manifest.json"
        manifest = json.loads(mpath.read_text(encoding="utf-8")) if mpath.exists() else {}
        for notes in sorted((base / "topics").glob("*/notes.md")):
            name = notes.parent.name
            out = base / "audio" / (name + ".mp3")
            digest = hashlib.sha256((VERSION + VOICE + RATE + notes.read_text(encoding="utf-8")).encode("utf-8")).hexdigest()[:16]
            if not force and out.exists() and manifest.get(name) == digest:
                print("skip  ", exam, name)
                continue
            n, chars = asyncio.run(build(notes, out))
            manifest[name] = digest
            mpath.parent.mkdir(parents=True, exist_ok=True)
            mpath.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print("made  ", exam, name, f"{n}chunks {chars}chars {out.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
