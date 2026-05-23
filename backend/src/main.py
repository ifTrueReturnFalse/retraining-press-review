from database import init_db
from fastapi import FastAPI
import uvicorn

app = FastAPI()


@app.get("/")
async def hello():
    return {"message": "👋"}


def start():
    init_db()

    uvicorn.run(app, host="0.0.0.0", port=8000)
