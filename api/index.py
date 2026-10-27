import sys
import os
from pathlib import Path

# Add backend directory to sys.path so that 'app' module imports work properly
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    os.chdir(str(BACKEND_DIR))
except Exception:
    pass

from app.main import app

# Provide both 'app' (ASGI) and 'handler' (Serverless function entry point)
handler = app
