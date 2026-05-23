import subprocess
import sys
import os
from dotenv import load_dotenv


def start_db():
    load_dotenv()

    cmd = [
        "docker",
        "run",
        "--name",
        "newsfoundry-db",
        "-e",
        f"POSTGRES_USER={os.getenv('DATABASE_USER')}",
        "-e",
        f"POSTGRES_PASSWORD={os.getenv('DATABASE_PASSWORD')}",
        "-e",
        f"POSTGRES_DB={os.getenv('DATABASE')}",
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
