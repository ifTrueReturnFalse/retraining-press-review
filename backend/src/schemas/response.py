from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """
    A generic wrapper for all API responses to ensure a consistent structure.

    Attributes:
        success (bool): Indicates if the request was processed successfully.
        message (Optional[str]): A human-readable message providing more context about the response.
        data (Optional[T]): The actual payload of the response, which can be of any type.
    """
    success: bool
    message: Optional[str] = None
    data: Optional[T] = None
