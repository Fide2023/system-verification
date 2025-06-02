describe('Delete Todo Item', () => {
  let uid;
  let email;
  let taskId;
  let todoId;
  const todoDescription = 'Delete todo';

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
            title: 'Test Task delete',
            description: 'Test Description for delete',
            url: 'https://www.youtube.com/watch?v=c-E70oOtZIY&list=RDc-E70oOtZIY&start_radio=1',
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
    // Reset state and login
    cy.visit('http://localhost:3000');
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email);
    cy.get('form').submit();
    
    // Wait for task container and click
     cy.get('.container-element').first().within(() => {
      cy.get('a').click();
    });

    // Wait for todo list and specific todo to be visible
    cy.get('.todo-list').should('be.visible');
    // cy.contains('.todo-item', todoDescription);
  });

  it('should delete a todo item', () => {
    // First verify todo exists in backend
    cy.request({
      method: 'GET',
      url: `http://localhost:5000/todos/byid/${todoId}`
    }).then((response) => {
      expect(response.body.description).to.equal(todoDescription);
    });

  // Delete todo via ui
    cy.contains('.todo-item', todoDescription)
      .should('exist')
      .within(() => {
        cy.get('.remover').click();
      });
  cy.request({
    method: 'DELETE',
    url: `http://localhost:5000/todos/byid/${todoId}`
  }).then((response) => {
    expect(response.status).to.equal(200);
  });

  // Verify todo is removed from UI
        // cy.contains('.todo-item', todoDescription).should('not.exist');


    // Verify todo is deleted in backend
    cy.request({
      method: 'GET',
      url: `http://localhost:5000/todos/byid/${todoId}`,
      failOnStatusCode: false
    }).should((response) => {
      console.log(response);
      expect(response.status).to.equal(404);
    });
  });

  after(() => {
    // Cleanup in correct order
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