from fastapi import FastAPI
import uvicorn
from routers import auth

app = FastAPI(title="NewsFoundry API")

app.include_router(auth.router)


@app.get("/")
async def hello():
    """
    Root endpoint that returns a friendly greeting.

    Returns:
        dict: A dictionary containing a wave emoji message.
    """
    return {"message": "👋"}


def start():
    """
    Starts the FastAPI application using the Uvicorn ASGI server.
    Configured to listen on all interfaces (0.0.0.0) at port 8000.
    """
    uvicorn.run(app, host="0.0.0.0", port=8000)
