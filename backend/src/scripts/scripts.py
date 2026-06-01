import subprocess
import sys
from config import settings


def start_db():
    cmd = [
        "docker",
        "run",
        "--name",
        "newsfoundry-db",
        "-e",
        f"POSTGRES_USER={settings.DATABASE_USER}",
        "-e",
        f"POSTGRES_PASSWORD={settings.DATABASE_PASSWORD}",
        "-e",
        f"POSTGRES_DB={settings.DATABASE}",
        "-p",
        "5432:5432",
        "-d",
        "postgres:17",
    ]

    result = subprocess.run(cmd)
    sys.exit(result.returncode)


def stop_db():
    cmd = [
        "docker",
        "stop",
        "newsfoundry-db",
    ]

    result = subprocess.run(cmd)
    sys.exit(result.returncode)
