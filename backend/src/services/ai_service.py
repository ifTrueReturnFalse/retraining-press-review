from pydantic_ai import Agent, RunContext
from pydantic_ai.models.mistral import MistralModel
from pydantic_ai.providers.mistral import MistralProvider
from pydantic_ai.messages import ModelMessagesTypeAdapter
from config import settings
from dataclasses import dataclass
from services.news_service import search_news, store_article_urls


@dataclass
class AgentDeps:
    system_prompt: str
    conversation_id: int


model = MistralModel(
    "mistral-small-latest", provider=MistralProvider(api_key=settings.MISTRAL_API_KEY)
)

agent = Agent(model, deps_type=AgentDeps)


@agent.system_prompt
async def base_prompt():
    """
    Defines the core persona of the AI agent.

    @returns {str} The base system instruction.
    """
    return "Tu es un assistant pour pigistes."


@agent.system_prompt
async def build_system_prompt(ctx: RunContext[AgentDeps]):
    """
    Injects dynamic context (news) into the system prompt.

    @param {RunContext[str]} ctx - The context containing dependencies (news string).
    @returns {str} The formatted prompt with current news.
    """
    # ctx.deps contains the top news fetched from the news_service
    return f"Voici les actualistés du jour :\n{ctx.deps.system_prompt}"


@agent.tool
async def fetch_news(
    ctx: RunContext[AgentDeps], query: str, language: str = "fr", country: str = "fr"
) -> str:
    """
    Search for specific news articles based on a query and store their URLs for context.

    @param {RunContext[AgentDeps]} ctx - The execution context containing dependencies.
    @param {str} query - The search keywords.
    @param {str} language - The language code, ISO 6391 language code (default 'fr').
    @param {str} country - The country code, ISO 3166 country code (default 'fr').
    @returns {str} A formatted string of titles and summaries.
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
    user_message: str, history_json: str, system_prompt: str, conversation_id: int
) -> tuple[str, str]:
    """
    Processes a user message within a specific conversation context using the AI agent.

    Args:
        user_message (str): The new message sent by the user.
        history_json (str): The existing conversation history serialized as a JSON string.

    Returns:
        tuple[str, str]: A tuple containing (agent_response, updated_history_json).
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
