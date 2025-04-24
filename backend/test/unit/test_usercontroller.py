import pytest
import unittest.mock as mock
from  src.controllers.usercontroller import UserController



class TestGetUserByEmail:
    #1. valid email, one user
    #2. valid email, multiple users
    #3. valid email, no user
    @pytest.mark.parametrize('email, users, expected', [
        ("jane.doe@gmail.com", [{"email": "jane.doe@gmail.com", "firstName": "Jane", "lastName": "Doe"}], {"email": "jane.doe@gmail.com", "firstName": "Jane", "lastName": "Doe"}),
        ("jane.doe@gmail.com", [{"email": "jane.doe@gmail.com", "firstName": "Jane", "lastName": "Doe"}, {"email": "jane.doe@gmail.com", "firstName": "Shane", "lastName": "Shoe"}], {"email": "jane.doe@gmail.com", "firstName": "Jane", "lastName": "Doe"}),
        ("jane.doe@gmail.com", None, None),

    ])
    def test_valid_email(self, email, users, expected):

        # Mock using MagicMock
        mockedDAO = mock.MagicMock()
        # Set return value to users
        mockedDAO.find.return_value = users

        # Call function
        controller = UserController(dao=mockedDAO)
        result = controller.get_user_by_email(email)

        # Assert result is equal to expected
        assert result == expected
        mockedDAO.find.assert_called_once_with({"email": email})

    def test_invalid_email(self):
        # Testing an invalid email, should return an ValueError
        email = "jane.doe"
        # Mock using MagicMock
        mockedDAO = mock.MagicMock()
        controller = UserController(dao=mockedDAO)

        with pytest.raises(ValueError, match="Error: invalid email address"):
            controller.get_user_by_email(email)

    def test_database_operation_failure(self):
        # Test database failure, should return an Exception error
        email = "jane.doe@gmail.com"
        # Mock using MagicMock
        mockedDAO = mock.MagicMock()
        # Set return value
        mockedDAO.find.side_effect = Exception("Database error")

        # Call function
        controller = UserController(dao=mockedDAO)
        with pytest.raises(Exception, match="Database error"):
            controller.get_user_by_email(email)
