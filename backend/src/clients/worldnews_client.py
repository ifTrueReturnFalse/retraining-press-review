from config import settings
import httpx
from exceptions import NewsAPIError, NewsAPITimeoutError
from tenacity import (
    retry,
    retry_if_exception_type,
    retry_unless_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)
import logging

logger = logging.getLogger("worldnews_client")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    )
    logger.addHandler(handler)


# Apply a retry mechanism to the API call.
# It retries if a `NewsAPIError` occurs, up to 3 attempts.
# The waiting time between retries increases exponentially:
# 1st retry: 2 seconds, 2nd retry: 4 seconds, 3rd retry: 8 seconds.
# This helps to handle transient network issues or temporary API unavailability.
@retry(
    retry=retry_if_exception_type(NewsAPIError)
    & retry_unless_exception_type(NewsAPITimeoutError),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    before_sleep=before_sleep_log(logger, logging.WARNING),
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

    safe_params = {k: v for k, v in params.items() if k != "api-key"}
    logger.info("→ Appel %s avec params=%s", endpoint, safe_params)

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                f"https://api.worldnewsapi.com/{endpoint}", params=params
            )
        except httpx.TimeoutException as error:
            logger.error("Timeout sur %s", endpoint)
            raise NewsAPITimeoutError(
                f"Timeout lors de l'appel à {endpoint}"
            ) from error

        logger.debug(
            "← %s status=%s headers=%s",
            endpoint,
            response.status_code,
            dict(response.headers),
        )

        try:
            data = response.json()
        except ValueError as error:
            logger.error(
                "✗ Réponse non-JSON de %s (status HTTP %s): %s",
                endpoint,
                response.status_code,
                response.text[:500],
            )
            raise NewsAPIError(
                f"Réponse non-JSON de {endpoint} (status HTTP {response.status_code})"
            ) from error

        if data.get("status") == "failure":
            logger.warning("✗ Échec API sur %s: %s", endpoint, data)
            raise NewsAPIError(data.get("message", f"Échec de l'appel à {endpoint}"))

        logger.info("✓ %s OK (status HTTP %s)", endpoint, response.status_code)

        return data
