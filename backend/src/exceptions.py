class ExternalAPIError(Exception):
    """Base exception for errors related to external API calls."""

    def __init__(self, message: str):
        """
        Initializes a new instance of the `ExternalAPIError` class.

        Args:
            message (str): A descriptive error message.
        """
        self.message = message
        super().__init__(message)


class NewsAPIError(ExternalAPIError):
    """Specific exception for errors originating from the News API.
    This allows for more granular error handling for issues related to news fetching,
    such as timeouts, invalid responses, or API-reported failures.
    """

    pass


class NewsAPITimeoutError(NewsAPIError):
    """Specific exception for errors originating from the News API.
    This allows for more granular error handling for issues related to news fetching,
    such as timeouts, invalid responses, or API-reported failures.
    """

    pass


class MistralAPIError(ExternalAPIError):
    """Specific exception for errors originating from the Mistral AI API.
    This allows for more granular error handling for issues related to Mistral AI
    service, such as authentication failures, rate limits, or model errors.
    """

    pass
