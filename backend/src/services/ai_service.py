from pydantic_ai import Agent, RunContext
from pydantic_ai.models.mistral import MistralModel
from pydantic_ai.providers.mistral import MistralProvider
from pydantic_ai.messages import ModelMessagesTypeAdapter
from config import settings
from dataclasses import dataclass
from services.news_service import search_news, store_article_urls


@dataclass
class AgentDeps:
    """A container for dependencies injected into the AI agent's context.

    Attributes:
        system_prompt: The dynamic part of the system prompt (e.g., daily news).
        conversation_id: The ID of the current conversation for context.
    """
    system_prompt: str
    conversation_id: int


model = MistralModel(
    "mistral-small-latest", provider=MistralProvider(api_key=settings.MISTRAL_API_KEY)
)

agent = Agent(model, deps_type=AgentDeps)


@agent.system_prompt
async def base_prompt():
    """Defines the core persona of the AI agent.

    Returns:
        The base system instruction for the agent.
    """
    return "Tu es un assistant pour pigistes."


@agent.system_prompt
async def build_system_prompt(ctx: RunContext[AgentDeps]):
    """Injects dynamic context (e.g., news) into the system prompt.

    Args:
        ctx: The agent's run context, containing dependencies like the news string.

    Returns:
        The formatted system prompt including the latest news.
    """
    # ctx.deps contains the top news fetched from the news_service
    return f"Voici les actualistés du jour :\n{ctx.deps.system_prompt}"


@agent.tool
async def fetch_news(ctx: RunContext[AgentDeps], query: str, language: str = "fr", country: str = "fr") -> str:
    """Searches for news articles and stores their URLs in the conversation context.

    This tool allows the AI agent to perform targeted news searches and automatically
    persists the article URLs to the current conversation's metadata for future
    reference, such as for generating a press review.

    Args:
        ctx: The agent's run context, used to access the `conversation_id`.
        query: The search keywords.
        language: The ISO 639-1 language code (default: "fr").
        country: The ISO 3166 country code (default: "fr").

    Returns:
        A formatted string of news titles and summaries for the LLM to process.
    """

    conversation_id = ctx.deps.conversation_id
    # Call the external news API service
    result = await search_news(query, country, language)

    # Extract URLs to persist them in the conversation's metadata
    url_list = [news.url for news in result.news if news.url]

    # Inline: Update the database with the newly discovered article URLs
    store_article_urls(url_list, conversation_id)

    # Format the results for the LLM to process
    return "\n".join(f"- {news.title}: {news.summary}" for news in result.news)


async def chat(
    user_message: str, history_json: str, system_prompt: str, conversation_id: int,
) -> tuple[str, str]:
    """Processes a user message using the AI agent and its tools.

    Args:
        user_message: The new message from the user.
        history_json: The existing conversation history as a JSON string.
        system_prompt: The dynamic context (e.g., news) for the system prompt.
        conversation_id: The ID of the current conversation.

    Returns:
        A tuple containing the agent's response and the updated history as a
        JSON string.
    """
    # Deserialize the JSON history into a list of Pydantic AI message objects
    history = ModelMessagesTypeAdapter.validate_json(history_json)

    # Run the agent with the current message and the loaded history
    result = await agent.run(
        user_message,
        message_history=history,
        deps=AgentDeps(system_prompt, conversation_id),
    )

    # result.all_messages() contains the full conversation including the new exchange.
    # We serialize it back to JSON to persist it in the database.
    new_history = ModelMessagesTypeAdapter.dump_json(result.all_messages()).decode(
        "utf-8"
    )
    return result.output, new_history
