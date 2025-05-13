describe('create task after login', () => {
  let uid; // user id
  let email; // email of the user
  let taskId; // id of task for deletion

  before(function () {
    // setup everything for tests, create user and task
    cy.fixture('user.json').then((user) => {
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
          taskId = taskResponse.body[0]._id.$oid;
          console.log('Task created with ID:', taskId);
        });
      });
    });
  });

  beforeEach(function () {
    // login and enter view detail mode for the task
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

  // should create a todo under the video
  it('should create a todo under the video', () => {
    cy.get('form.inline-form').within(() => {
      cy.get('input[type="text"]').type('Dont watch this video', { force: true });
      cy.get('input[type="submit"]').click({ force: true });
    });
    cy.get('.todo-list').should('contain', 'Dont watch this video');
  });

  // add button should be disabled when input is empty
  it('should disable the Add button when input is empty', () => {
    cy.get('form.inline-form').within(() => {
      cy.get('input[type="text"]').clear({ force: true });
      cy.get('input[type="submit"]').should('be.disabled');
    });
  });

  // should toogle and untoggle a todo
  it('should toggle a todo', () => {
    cy.contains('.todo-item', 'Dont watch this video').within(() => {
      cy.get('.checker')
        .should('have.class', 'unchecked')
        .click();

      cy.get('.checker').should('have.class', 'checked');

      cy.get('.checker')
        .should('have.class', 'checked')
        .click();

      cy.get('.checker').should('have.class', 'unchecked');
    });
  });

  // should delete a todo
  it('should delete a todo', () => {
    cy.contains('.todo-item', 'Dont watch this video')
      .should('exist')
      .within(() => {
        cy.get('.remover').click();
      });

    cy.contains('.todo-item', 'Dont watch this video').should('not.exist');
  });

  after(function () {
    // delete task
    if (taskId) {
      console.log("Deleting task by id: ", taskId);
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/tasks/byid/${taskId}`,
        failOnStatusCode: false
      });
    }

    // delete user
    if (uid) {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/users/${uid}`
      }).then((response) => {
        cy.log(response.body);
      });
    }

  });
});
