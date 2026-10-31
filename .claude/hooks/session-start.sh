#!/bin/bash
# Cài đặt tự động cho phiên Claude Code trên cloud (thay setup script dán tay, HUONG-DAN bước 4):
#   ffmpeg · Python cho nhận diện giọng / tách người (~/.asr: faster-whisper, rembg…) · node_modules.
# Chạy mỗi lần mở phiên; phần đã cài xong thì bỏ qua (so mã băm). Chỉ chạy trên cloud.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}"
HOOK=.claude/hooks/session-start.sh

# ffmpeg (gói hệ thống: kiểm mỗi lần, có rồi thì thôi)
command -v ffmpeg >/dev/null || { apt-get update -qq && apt-get install -y -qq ffmpeg; }

# Python ~/.asr: cài lại khi hook này đổi (danh sách gói nằm ngay dưới)
ASR="$HOME/.asr"; asr_hash="$ASR/.session-start.sha256"
if ! sha256sum --check --status "$asr_hash" 2>/dev/null; then
  rm -f "$asr_hash"
  export PATH="$HOME/.local/bin:$PATH"
  command -v uv >/dev/null || python3 -m pip install -q --user uv
  [ -x "$ASR/bin/python" ] || uv venv -q "$ASR"
  VIRTUAL_ENV="$ASR" uv pip install -q faster-whisper numpy imageio pillow "rembg[cpu]" opencv-python-headless
  sha256sum "$HOOK" > "$asr_hash"
fi

# node_modules: cài lại khi package.json / package-lock.json / hook đổi
npm_hash=node_modules/.session-start.sha256
if ! sha256sum --check --status "$npm_hash" 2>/dev/null; then
  rm -f "$npm_hash"
  npm install --no-audit --no-fund
  sha256sum "$HOOK" package.json package-lock.json > "$npm_hash"
fi
