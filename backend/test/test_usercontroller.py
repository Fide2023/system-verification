import pytest
import unittest.mock as mock
from  src.controllers.usercontroller import UserController



class TestGetUserByEmail:
    def test_valid_email(self):
        # Testing a valid email, should return a user object
        email = "jane.doe@gmail.com"
        expected_user = {"email": "jane.doe@gmail.com", "firstName": "Jane", "lastName": "Doe"}

        # Mock using MagicMock
        mockedDAO = mock.MagicMock()
        # Set return value
        mockedDAO.find.return_value = [expected_user]

        # Call function
        controller = UserController(dao=mockedDAO)
        result = controller.get_user_by_email(email)

        # Assertions
        assert result == expected_user
        mockedDAO.find.assert_called_once_with({"email": email})

    def test_invalid_email(self):
        # Testing an invalid email, should return an ValueError
        email = "jane.doe"
        # Mock using MagicMock
        mockedDAO = mock.MagicMock()
        controller = UserController(dao=mockedDAO)

        with pytest.raises(ValueError, match="Error: invalid email address"):
            controller.get_user_by_email(email)

    def test_valid_email_multiple_users(self, capsys):
        # Testing a valid email with multiple users, should return the first user and print an message
        email = "jane.doe@gmail.com"
        expected_users = [
            {"email": "jane.doe@gmail.com", "firstName": "Jane", "lastName": "Doe"}, 
            {"email": "jane.doe@gmail.com", "firstName": "Shane", "lastName": "Shoe"}
        ]


        mockedDAO = mock.MagicMock()
        # Set return value
        mockedDAO.find.return_value = expected_users

        # Call function
        controller = UserController(dao=mockedDAO)
        result = controller.get_user_by_email(email)
        captured = capsys.readouterr()

        # Assertions
        assert result == expected_users[0]
        assert f'Error: more than one user found with mail {email}' in captured.out
        mockedDAO.find.assert_called_once_with({"email": email})


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

    def test_email_with_no_user(self):
        # Test an email with no user, should return None
        email = "john.doe@gmail.com"
        expected_user = None

        # Mock using MagicMock
        mockedDAO = mock.MagicMock()
        # Set return value
        mockedDAO.find.return_value = expected_user

        # Call function
        controller = UserController(dao=mockedDAO)
        result = controller.get_user_by_email(email)

        # Assertions
        assert result == expected_user
        mockedDAO.find.assert_called_once_with({"email": email})




