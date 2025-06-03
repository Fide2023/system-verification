
describe('Toggle Todo Item', () => {
  let uid;
  let email;
  let taskId;
  let todoId;
  const todoDescription = 'Test todo for toggling';

  before(function () {
    // Create test user
    cy.fixture('user.json').then((user) => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then((response) => {
        uid = response.body._id.$oid;
        email = user.email;

        // Create task without todos array
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/tasks/create',
          form: true,
          body: {
            title: 'Test Task',
            description: 'Test Description',
            url: 'mNf6U1h3WUs',
            userid: uid,
            todos: "watch this video"
          }
        }).then((taskResponse) => {
          taskId = taskResponse.body[0]._id.$oid;

          // Create todo via API
          cy.request({
            method: 'POST',
            url: 'http://localhost:5000/todos/create',
            form: true,
            body: {
              taskid: taskId,
              description: todoDescription,
              done: false
            }
          }).then((todoResponse) => {
            todoId = todoResponse.body._id.$oid;
          });
        });
      });
    });
  });

  beforeEach(() => {
    // Reset todo state before each test
    if (todoId) {
      cy.request({
        method: 'PUT',
        url: `http://localhost:5000/todos/byid/${todoId}`,
        form: true,
        body: {
          data: JSON.stringify({'$set': {'done': false}})
        }
      });
    }

    // Login and navigate to task
    cy.visit('http://localhost:3000');
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email);
    cy.get('form').submit();
    
    cy.get('.container-element').first().within(() => {
      cy.get('a').click();
    });

    // Wait for todo list to be visible
    cy.get('.todo-list').should('be.visible');
  });

  it('should toggle todo from unchecked to checked', () => {
    // Verify initial state via backend
     cy.request({
      method: 'GET',
      url: `http://localhost:5000/todos/byid/${todoId}`
    }).then((response) => {
      expect(response.body.done).to.be.false;
    });

    // Toggle via backend API
    cy.request({
      method: 'PUT',
      url: `http://localhost:5000/todos/byid/${todoId}`,
      form: true,
      body: {
        data: JSON.stringify({'$set': {'done': true}})
      }
    });

    // Verify UI reflects the change
    // cy.contains('.todo-item', todoDescription)
    //   .find('.checker')
    //   .should('have.class', 'checked');

    // Verify backend state updated
    cy.request({
      method: 'GET',
      url: `http://localhost:5000/todos/byid/${todoId}`
    }).then((response) => {
      expect(response.body.done).to.be.true;
    });
  });
 it('should toggle todo from checked to unchecked via backend', () => {
    // First toggle to checked state
    cy.request({
      method: 'PUT',
      url: `http://localhost:5000/todos/byid/${todoId}`,
      form: true,
      body: {
        data: JSON.stringify({'$set': {'done': true}})
      }
    });

    // Verify initial checked state
    cy.request({
      method: 'GET',
      url: `http://localhost:5000/todos/byid/${todoId}`
    }).then((response) => {
      expect(response.body.done).to.be.true;
    });

    // Toggle to unchecked via backend API
    cy.request({
      method: 'PUT',
      url: `http://localhost:5000/todos/byid/${todoId}`,
      form: true,
      body: {
        data: JSON.stringify({'$set': {'done': false}})
      }
    });

    // Verify UI reflects the change
    cy.contains('.todo-item', todoDescription)
      .find('.checker')
      .should('not.have.class', 'checked');

    // Verify backend state updated
    cy.request({
      method: 'GET',
      url: `http://localhost:5000/todos/byid/${todoId}`
    }).then((response) => {
      expect(response.body.done).to.be.false;
    });
  });

    // Verify UI reflects the change
    // cy.contains('.todo-item', todoDescription)
    //   .find('.checker')
    //   .should('not.have.class', 'checked');

    // Verify backend state updated
    
  


  after(() => {
    // Cleanup in correct order
    if (todoId) {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/todos/byid/${todoId}`,
        failOnStatusCode: false
      });
    }
    if (taskId) {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/tasks/byid/${taskId}`,
        failOnStatusCode: false
      });
    }
    if (uid) {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/users/${uid}`,
        failOnStatusCode: false
      });
    }
  });
});