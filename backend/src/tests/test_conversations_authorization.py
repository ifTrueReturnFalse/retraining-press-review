from tests.conftest import auth_headers


def test_get_own_conversation_succeeds(client, user_a, conversation_of_user_a):
    """
    Test case: A user can successfully access their own conversation.

    Args:
        client (TestClient): The FastAPI test client.
        user_a (UserModel): The user 'Alice'.
        conversation_of_user_a (ConversationModel): A conversation belonging to 'Alice'.
    """
    # Make a GET request to retrieve the conversation using user_a's authorization headers.
    response = client.get(
        f"/conversations/{conversation_of_user_a.id}",
        headers=auth_headers(user_a),
    )

    # Assert that the request was successful (HTTP 200 OK).
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["id"] == conversation_of_user_a.id


def test_get_other_users_conversation_is_forbidden(
    client, user_b, conversation_of_user_a
):
    """
    Test case: A user cannot access another user's conversation.

    Args:
        client (TestClient): The FastAPI test client.
        user_b (UserModel): The user 'Bob'.
        conversation_of_user_a (ConversationModel): A conversation belonging to 'Alice'.
    """
    # Make a GET request to retrieve conversation_of_user_a using user_b's authorization headers.
    response = client.get(
        f"/conversations/{conversation_of_user_a.id}",
        headers=auth_headers(user_b),
    )

    # Assert that the request was forbidden (HTTP 403 Forbidden).
    assert response.status_code == 403
    assert response.json()["success"] is False
