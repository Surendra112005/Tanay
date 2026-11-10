import os
import subprocess
import sys

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


def test_main_import_starts_without_heavy_model_loads():
    completed = subprocess.run(
        [sys.executable, '-c', 'import main'],
        capture_output=True,
        text=True,
        timeout=60,
        cwd=BASE_DIR,
    )

    assert completed.returncode == 0, completed.stdout + completed.stderr
