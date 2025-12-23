DnDMapBuilder — Offline run instructions

This repository contains a small browser-based map builder. The `scripts/make-offline.ps1` helper will download the required vendor JS files into `vendor/js/` and update `index.html` to reference the local copies.

Quick start (Windows / PowerShell):

1. Open PowerShell in the project root (where `index.html` is).
2. Run the helper script:

    .\scripts\make-offline.ps1

If your execution policy blocks the script, run:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
    .\scripts\make-offline.ps1

What the script does:
- Attempts to download `jscolor.min.js` and `html2canvas.min.js` into `vendor/js/`.
- Replaces common CDN script tags in `index.html` with local `vendor/js/` paths.

If the automatic download fails:
- Manually download compatible builds and place them exactly as:
  - `vendor/js/jscolor.min.js`
  - `vendor/js/html2canvas.min.js`
- Re-open `index.html` in a browser (double-click) or run a local server (recommended).

Notes:
- If all assets are local and `index.html` uses plain script tags (no dynamic cross-origin fetches), double-clicking `index.html` will usually work.
- If you encounter problems when opening via `file://`, use the local server method above.