import subprocess
import sys
from config import settings


def start_db():
    container_name = "newsfoundry-db"

    # Check if container exists
    check_cmd = ["docker", "ps", "-a", "-q", "-f", f"name=^/{container_name}$"]
    container_exists = subprocess.run(check_cmd, capture_output=True, text=True).stdout.strip()
    print(container_exists)

    if container_exists:
        print(f"Starting the existing container : {container_name}")
        cmd = ["docker", "start", container_name]
    else:
        print(f"Creating and lauching the container : {container_name}")
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
