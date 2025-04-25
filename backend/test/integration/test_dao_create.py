import pytest
from src.util.dao import DAO
from pymongo.errors import WriteError
from bson import ObjectId

@pytest.fixture(scope="function")
def test_dao():
    dao = DAO("user")
    dao.drop()  # Clean before each test
    yield dao
    dao.drop()  # Clean after each test

def test_create_valid_user(test_dao):
    data = {"firstName": "Alice", "lastName": "Smith", "email": "alice@example.com"}
    result = test_dao.create(data)
    assert result["firstName"] == "Alice"
    assert result["email"] == "alice@example.com"
    assert "_id" in result

def test_create_missing_first_name(test_dao):
    data = {"lastName": "Smith", "email": "bob@example.com"}
    with pytest.raises(WriteError):
        test_dao.create(data)

def test_create_last_name_wrong_type(test_dao):
    data = {"firstName": "Bob", "lastName": 123, "email": "bob@example.com"}
    with pytest.raises(WriteError):
        test_dao.create(data)

def test_create_with_tasks_valid(test_dao):
    data = {
        "firstName": "Charlie",
        "lastName": "Brown",
        "email": "charlie@example.com",
        "tasks": [ObjectId()]
    }
    result = test_dao.create(data)
    assert isinstance(result["tasks"], list)

def test_create_with_invalid_tasks(test_dao):
    data = {
        "firstName": "Dana",
        "lastName": "White",
        "email": "dana@example.com",
        "tasks": ["not-an-object-id"]
    }
    with pytest.raises(WriteError):
        test_dao.create(data)

def test_create_empty_input(test_dao):
    with pytest.raises(WriteError):
        test_dao.create({})

def test_create_duplicate_email_allowed(test_dao):
    # MongoDB schema does not enforce email uniqueness via validator
    data = {"firstName": "Eve", "lastName": "Doe", "email": "eve@example.com"}
    test_dao.create(data)
    test_dao.create(data)  # should succeed unless unique index is manually added