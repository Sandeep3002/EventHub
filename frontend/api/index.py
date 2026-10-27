import sys
import os
from pathlib import Path

# Add frontend directory to sys.path so 'app' module can be imported
FRONTEND_DIR = Path(__file__).resolve().parent.parent
if str(FRONTEND_DIR) not in sys.path:
    sys.path.insert(0, str(FRONTEND_DIR))

try:
    os.chdir(str(FRONTEND_DIR))
except Exception:
    pass

from app.main import app

handler = app
