describe('Logging into the system', () => {
  let uid; // user id
  let email; // email of the user
  let taskId

  before(function () {
    // create a fabricated user from a fixture
    cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid;
          email = user.email;

          cy.request({
            method: 'POST',
            url: 'http://localhost:5000/tasks/create',
            form: true,
            body: {
              title: 'new task',
              description: 'Test task description',
              url: 'hello',
              userid: uid,
              todos: "watch this video"
            },
            failOnStatusCode: false
          }).then((taskResponse) => {
            taskId = taskResponse.body_id;
            console.log('Task created with ID:', taskId);
            cy.visit('http://localhost:3000');
          cy.contains('div', 'Email Address')
            .find('input[type=text]')
            .type(email);
          cy.get('form').submit();

          // click into created task
          cy.get('.container-element').first().within(() => {
            cy.get('.title-overlay').should('contain', 'new task');
            cy.get('a').click();
          });
          });

          // login and create task
          
        });
      });
  });

  beforeEach(function () {
    // Only login before each test
    cy.visit('http://localhost:3000');
    cy.contains('div', 'Email Address')
            .find('input[type=text]')
            .type(email);
          cy.get('form').submit();

          cy.get('.container-element').first().within(() => {
            cy.get('.title-overlay').should('contain', 'new task');
            cy.get('a').click();
          });
  });

  it('should create a todo under the video', () => {
  cy.get('form.inline-form').within(() => {
    cy.get('input[type="text"]').type('Dont watch this video', { force: true });
    cy.get('input[type="submit"]').click({ force: true });
  });
  cy.get('.todo-list').should('contain', 'Dont watch this video');
});


  it('should toggle a todo', () => {
  cy.contains('.todo-item', 'Dont watch this video').within(() => {
    cy.get('.checker')
      .should('have.class', 'unchecked')
      .click();

    // Re-query the element after click to check updated class
    cy.get('.checker').should('have.class', 'checked');
  });
});

  it('should delete a todo', () => {
  cy.contains('.todo-item', 'Dont watch this video')
    .should('exist') // Make sure it exists first
    .within(() => {
      cy.get('.remover').click();
    });

  // Wait for it to be removed from the DOM
  cy.contains('.todo-item', 'Dont watch this video').should('not.exist');
});

  after(function () {
    if (uid) {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/users/${uid}`
      }).then((response) => {
        cy.log(response.body);
      });
    }
    if (taskId) {
      cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/tasks/byid/${taskId}`,
      failOnStatusCode: false
    });
    }
  });
});
