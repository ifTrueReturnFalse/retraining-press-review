import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import uvicorn
from routers import auth, conversations
from config import settings
from services.press_review_service import init_llama_index
from schemas.response import ApiResponse
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_llama_index()
    yield


app = FastAPI(title="NewsFoundry API", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(conversations.router)


@app.get("/", response_model=ApiResponse[str])
async def hello():
    """
    Root endpoint that returns a friendly greeting.

    Returns:
        dict: A dictionary containing a wave emoji message.
    """
    return ApiResponse(success=True, message="👋")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exception: HTTPException):
    """
    Global handler for FastAPI HTTPException.

    Args:
        request (Request): The incoming HTTP request.
        exception (HTTPException): The raised HTTP exception.

    Returns:
        JSONResponse: A standardized error response using ApiResponse schema.
    """
    return JSONResponse(
        status_code=exception.status_code,
        content=ApiResponse(success=False, message=exception.detail).model_dump(),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exception: Exception):
    """
    Catch-all handler for unhandled exceptions to prevent leaking internal details.

    Args:
        request (Request): The incoming HTTP request.
        exception (Exception): The raw exception object.

    Returns:
        JSONResponse: A 500 Internal Server Error response.
    """
    return JSONResponse(
        status_code=500,
        content=ApiResponse(
            success=False, message="Une erreur interne est survenue"
        ).model_dump(),
    )


def start():
    """
    Starts the FastAPI application using the Uvicorn ASGI server.
    Configured to listen on all interfaces (0.0.0.0) at port 8000.
    """
    dev_mode = settings.APP_ENV == "development"

    uvicorn.run(
        "main:app" if dev_mode else app, host="0.0.0.0", port=8000, reload=dev_mode
    )
