import pytest
from pymongo.errors import WriteError
from src.util.dao import DAO
import os

class TestCreateMethod:
    """Integration tests for the create method in DAO class"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test database and cleanup after tests"""
        # Setup test database
        os.environ['MONGO_URL'] = 'mongodb://localhost:27017'
        self.test_collection = 'user'  # Using user collection for tests
        self.dao = DAO(collection_name=self.test_collection)
        
        yield  # Run tests
        
        # Cleanup after tests
        self.dao.drop()

    def test_create_valid_user(self):
        """Test creating a valid user object that meets all validator requirements"""
        # Arrange
        valid_user = {
            "firstName": "John",
            "lastName": "Doe", 
            "email": "john.doe@test.com"
        }

        # Act
        result = self.dao.create(valid_user)

        # Assert
        assert result is not None
        assert result['firstName'] == valid_user['firstName']
        assert result['lastName'] == valid_user['lastName']
        assert result['email'] == valid_user['email']
        assert '_id' in result

    def test_create_missing_required_field(self):
        """Test creating user without required field should fail"""
        # Arrange
        invalid_user = {
            "firstName": "John",
            # Missing required lastName
            "email": "john.doe@test.com"
        }

        # Act & Assert
        with pytest.raises(WriteError):
            self.dao.create(invalid_user)

    def test_create_duplicate_unique_field(self):
        """Test creating user with duplicate unique field (email) should fail"""
        # Arrange
        user1 = {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@test.com"
        }
        user2 = {
            "firstName": "Jane",
            "lastName": "Doe",
            "email": "john.doe@test.com"  # Same email
        }

        # Act & Assert
        self.dao.create(user1)
        with pytest.raises(WriteError):
            self.dao.create(user2)

    def test_create_wrong_field_type(self):
        """Test creating user with wrong field type should fail"""
        # Arrange
        invalid_user = {
            "firstName": 123,  # Should be string
            "lastName": "Doe",
            "email": "john.doe@test.com"
        }

        # Act & Assert
        with pytest.raises(WriteError):
            self.dao.create(invalid_user)

    def test_create_with_additional_fields(self):
        """Test creating user with additional non-schema fields"""
        # Arrange
        user_with_extra = {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@test.com",
            "age": 30  # Extra field not in schema
        }

        # Act
        result = self.dao.create(user_with_extra)

        # Assert
        assert result is not None
        assert result['firstName'] == user_with_extra['firstName']
        assert result['lastName'] == user_with_extra['lastName']
        assert result['email'] == user_with_extra['email']
        assert 'age' in result
        assert '_id' in result