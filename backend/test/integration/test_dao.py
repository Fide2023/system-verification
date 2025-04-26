import pytest
import unittest.mock as mock
from src.util.dao import DAO
from pymongo.errors import WriteError

# validator schema picked from static/validators/user.json
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
    """ Testing doa.create to ensure proper validation of data being sent into the database """

    @pytest.fixture
    def sut(self):
        # mock getValidator to return our user.json schema
        with mock.patch("src.util.dao.getValidator", autospec=True) as mockedValidator:
            mockedValidator.return_value = user_validator
            dao = DAO(collection_name="testingUser")
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
        # assert an WriteError takes place with invalid input data
        with pytest.raises(WriteError):
            sut.create(body)
    
    @pytest.mark.parametrize('body', [
        {"firstName": "Jane", "lastName": "Doe", "email": "jane.doe@gmail.com"},
        {"firstName": "Jane", "lastName": "Doe", "email": "jane.doe"}
    ])
    @pytest.mark.integration
    def test_valid_input(self, sut, body):

        # ensure correct object is created in the database collection
        dataObject = sut.create(body)
        result = {"firstName": dataObject["firstName"],
                        "lastName": dataObject["lastName"], 
                        "email": dataObject["email"]}
        assert result == body

    def test_non_unique_email(self, sut):
        # testing adding two objects to the database with the same email
        # should not work if the unique tag for the validation is correct
        body1 = {"firstName": "Jane", "lastName": "Doe", "email": "jane.doe@gmail.com"}
        body2 = {"firstName": "Jane", "lastName": "Doe", "email": "jane.doe@gmail.com"}

        dataObject1 = sut.create(body1)
        dataObject2 = sut.create(body2)

        # ensure both are using the same email, should not be possible
        assert dataObject1["email"] == dataObject2["email"]