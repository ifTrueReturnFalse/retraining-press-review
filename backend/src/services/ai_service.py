from pydantic_ai import Agent, RunContext
from pydantic_ai.models.mistral import MistralModel
from pydantic_ai.providers.mistral import MistralProvider
from pydantic_ai.messages import ModelMessagesTypeAdapter
from config import settings

model = MistralModel(
    "mistral-small-latest", provider=MistralProvider(api_key=settings.MISTRAL_API_KEY)
)

agent = Agent(model, deps_type=str)


@agent.system_prompt
async def base_prompt():
    """
    Defines the core persona of the AI agent.

    @returns {str} The base system instruction.
    """
    return "Tu es un assistant pour pigistes."


@agent.system_prompt
async def build_system_prompt(ctx: RunContext[str]):
    """
    Injects dynamic context (news) into the system prompt.

    @param {RunContext[str]} ctx - The context containing dependencies (news string).
    @returns {str} The formatted prompt with current news.
    """
    # ctx.deps contains the top news fetched from the news_service
    return f"Voici les actualistés du jour :\n{ctx.deps}"


@agent.tool_plain
async def fetch_news(query: str) -> str:
    """
    Fetches the latest news based on a search query.

    @param {str} query - The search terms to look for in news articles.
    @returns {str} A string containing news data or a placeholder.
    """
    # This tool is registered as a 'plain' tool, meaning it doesn't require
    # the RunContext to be passed as an argument.
    return f"Nothing to see here yet ! But here is a candy 🍬"


async def chat(
    user_message: str, history_json: str, system_prompt: str
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
    result = await agent.run(user_message, message_history=history, deps=system_prompt)

    # result.all_messages() contains the full conversation including the new exchange.
    # We serialize it back to JSON to persist it in the database.
    new_history = ModelMessagesTypeAdapter.dump_json(result.all_messages()).decode(
        "utf-8"
    )
    return result.output, new_history
