from config import settings
import httpx
from exceptions import NewsAPIError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)


# Apply a retry mechanism to the API call.
# It retries if a `NewsAPIError` occurs, up to 3 attempts.
# The waiting time between retries increases exponentially:
# 1st retry: 2 seconds, 2nd retry: 4 seconds, 3rd retry: 8 seconds.
# This helps to handle transient network issues or temporary API unavailability.
@retry(
    retry=retry_if_exception_type(NewsAPIError),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
)
async def call_worldnews_api(endpoint: str, params: dict) -> dict:
    """Makes an asynchronous request to a specified World News API endpoint.

    This function centralizes API calls to the World News API, handling
    API key injection, request execution, and standardized error management.

    Args:
        endpoint: The API endpoint to call (e.g., "top-news").
        params: A dictionary of query parameters for the API call.

    Returns:
        A dictionary containing the JSON response from the API.

    Raises:
        NewsAPIError: If the request times out, the response is not valid JSON,
                      or the API returns a failure status.
    """
    params = {**params, "api-key": settings.WORLD_NEWS_API_KEY}

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(
                f"https://api.worldnewsapi.com/{endpoint}", params=params
            )
        except httpx.TimeoutException as error:
            raise NewsAPIError(f"Timeout lors de l'appel à {endpoint}") from error

        try:
            data = response.json()
        except ValueError as error:
            raise NewsAPIError(
                f"Réponse non-JSON de {endpoint} (status HTTP {response.status_code})"
            ) from error

        if data.get("status") == "failure":
            raise NewsAPIError(data.get("message", f"Échec de l'appel à {endpoint}"))

        return data
