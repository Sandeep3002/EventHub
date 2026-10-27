import sys
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Ensure the 'backend' directory is on sys.path so that `app.*` imports work
# when this file is executed from the repo root (e.g. by Vercel serverless).
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    os.chdir(str(BACKEND_DIR))
except Exception:
    pass

# pyrightconfig.json adds 'backend' as an extraPath so Pyrefly/Pyright
# can resolve the `app` package at edit-time without raising missing-import.
from app.main import app  # noqa: E402

# Vercel / serverless entry-point
handler = app
