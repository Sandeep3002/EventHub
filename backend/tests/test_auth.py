import pytest
from app.utils.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    password = "secretpassword123"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_token_generation():
    data = {"sub": "user_12345", "role": "attendee"}
    token = create_access_token(data)
    assert isinstance(token, str)

    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == "user_12345"
    assert payload.get("role") == "attendee"
