import pytest
import unittest.mock as mock
from src.util.dao import DAO
from pymongo.errors import WriteError
from pymongo import MongoClient

user_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["firstName", "lastName", "email"],
        "properties": {
            "firstName": {
                "bsonType": "string",
                "description": "the first name of a user must be determined"
            }, 
            "lastName": {
                "bsonType": "string",
                "description": "the last name of a user must be determined"
            },
            "email": {
                "bsonType": "string",
                "description": "the email address of a user must be determined",
                "uniqueItems": True
            },
            "tasks": {
                "bsonType": "array",
                "items": {
                    "bsonType": "objectId"
                }
            }
        }
    }
}

class TestDAO:

    @pytest.fixture
    def sut(self):
        with mock.patch("src.util.dao.getValidator", autospec=True) as mockedValidator:
            mockedValidator.return_value = user_validator
            dao = DAO(collection_name="user")
            # clean database collection before test, ensuring it is ready for tests
            dao.collection.delete_many({})

        # return dao for testing
        yield dao
        # clean database collection after test for a proper teardown
        dao.collection.delete_many({})
    
    @pytest.mark.parametrize('body', [
        {"firstName": 123, "lastName": "Doe", "email": "jane.doe@gmail.com"},
        {"firstName": "Jane", "lastName": 123, "email": "jane.doe@gmail.com"},
        {"firstName": "Jane", "lastName": "Doe", "email": 123},
        {"firstName": "Jane", "lastName": "Doe"}
    ])
    @pytest.mark.integration
    def test_invalid_input(self, sut, body):

        with pytest.raises(WriteError):
            sut.create(body)
    
    @pytest.mark.integration
    def test_valid_input(self, sut):
        body = {"firstName": "Jane",
                "lastName": "Doe",
                "email": "jane.doe@gmail.com"}

        dataObject = sut.create(body)
        result = {"firstName": dataObject["firstName"],
                        "lastName": dataObject["lastName"], 
                        "email": dataObject["email"]}
        assert result == body