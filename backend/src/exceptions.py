# exceptions.py
class ExternalAPIError(Exception):
    """Base exception for errors related to external API calls."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NewsAPIError(ExternalAPIError):
    """Specific exception for errors originating from the News API.

    This allows for more granular error handling for issues related to news
    fetching, such as timeouts, invalid responses, or API-reported failures.
    """

    pass
