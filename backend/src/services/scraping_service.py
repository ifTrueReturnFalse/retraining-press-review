import aiohttp
import asyncio
import trafilatura
from typing import Optional, List, cast
from llama_index.core import Document


async def fetch_html(
    session: aiohttp.ClientSession, url: str, semaphore: asyncio.Semaphore
) -> Optional[str]:
    """Asynchronously fetches the HTML content of a single URL.

    Uses a semaphore to limit concurrent requests and handles potential
    client errors or timeouts gracefully.

    Args:
        session: The `aiohttp.ClientSession` to use for the request.
        url: The URL to fetch.
        semaphore: An `asyncio.Semaphore` to limit concurrency.

    Returns:
        The HTML content as a string if successful, otherwise `None`.
    """
    async with semaphore:
        try:
            async with session.get(url) as response:
                if response.status != 200:
                    return None
                html = await response.text()
                return html
        except (aiohttp.ClientError, asyncio.TimeoutError):
            return None


async def scrape_articles(urls: List[str]) -> List[Document]:
    """
    Asynchronously scrapes content from a list of URLs, extracts relevant text,
    and returns them as LlamaIndex Document objects.

    This function uses aiohttp for concurrent fetching and trafilatura for robust
    content extraction from HTML. It limits concurrent requests to prevent overwhelming
    servers and includes a timeout for each request.

    Args:
        urls (List[str]): A list of URLs to scrape.

    Returns:
        List[Document]: A list of LlamaIndex Document objects, each containing
                        the extracted text and metadata (url, title, date) from a scraped article.
                        Articles that fail to fetch or extract content are skipped.
    """
    # Initialize a semaphore to limit the number of concurrent HTTP requests.
    # This prevents overwhelming the target servers and manages resource usage.
    semaphore = asyncio.Semaphore(5)
    # Set a client timeout for HTTP requests to prevent indefinite waits.
    timeout = aiohttp.ClientTimeout(total=10)

    # Create an aiohttp client session for making asynchronous HTTP requests.
    async with aiohttp.ClientSession(timeout=timeout) as session:
        # Create a list of tasks, each fetching HTML for a given URL concurrently.
        tasks = [fetch_html(session, url, semaphore) for url in urls]
        # Run all fetch tasks concurrently and gather their results.
        htmls = await asyncio.gather(*tasks)

    documents = []
    # Process each fetched HTML content and its corresponding URL.
    for url, html in zip(urls, htmls):
        if html is None:
            # Skip if HTML fetching failed for this URL.
            continue

        # Use trafilatura to perform bare content extraction from the HTML.
        # The 'as_dict=True' argument ensures the output is a dictionary.
        extracted = cast(dict, trafilatura.bare_extraction(html, as_dict=True))

        if extracted is None or not extracted.get("text"):
            # Skip if trafilatura failed to extract content or no text was found.
            continue

        # Create a LlamaIndex Document object with the extracted text and metadata.
        document = Document(
            text=extracted.get("text"),
            metadata={
                "url": url,
                "title": extracted.get("title"),
                "date": extracted.get("date"),
            },
        )
        documents.append(document)

    return documents
