describe('Create Task After Login', () => {
  let uid;
  let name;
  let taskId;
  let email;
  const taskTitle = 'newtask';
  const videoId = 'mNf6U1h3WUs';

  before(function () {
    // Create test user from fixture
    cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user,
          failOnStatusCode: false
        }).then((response) => {
          uid = response.body._id.$oid;
          name = user.firstName + ' ' + user.lastName;
          email = user.email;

          // Create task once after user creation
          cy.request({
            method: 'POST',
            url: 'http://localhost:5000/tasks/create',
            form: true,
            body: {
              title: taskTitle,
              description: 'Test task description',
              url: videoId,
              userid: uid
            },
            failOnStatusCode: false
          }).then((taskResponse) => {
            taskId = taskResponse.body_id;
            console.log('Task created with ID:', taskId);
          });
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
    cy.get('h1').should('contain.text', 'Your tasks, ' + name);
  });
 

  it('should create a todo under the video', () => {
    // Open task details
    cy.get('.container-element').first().within(() => {
      cy.get('.title-overlay').should('contain', taskTitle);
      cy.get('a').click();
    });

    // Add todo in popup
    cy.get('.popup-inner').should('be.visible').within(() => {
      cy.get('.todo-list').within(() => {
        cy.get('.inline-form').within(() => {
          cy.get('input[type="text"]')
            .should('exist')
            .type('Watch this video', { force: true });
          cy.get('input[type="submit"]')
            .scrollIntoView()
            .click({ force: true });
        });

        // Verify todo was added
        cy.get('.todo-item')
          .should('be.visible')
          .should('contain', 'Watch this video');
      });
    });
  });
  it('should toggle specific todo item', () => {
    // Open task details
    cy.get('.container-element').first().within(() => {
      cy.get('a').click();
    });
  
    // Ensure popup and todos are loaded
    cy.get('.popup-inner').should('be.visible');
    cy.get('.todo-item').should('exist');
  
    // Find the todo and check it
    cy.contains('.todo-item', 'Watch this video').within(() => {
      cy.get('.checker')
        .should('have.class', 'unchecked')
        .click()
        .should('have.class', 'checked');
    });
  });
  it('should delete specific todo item', () => {
  // Open task details
  cy.get('.container-element').first().within(() => {
    cy.get('a').click();
  });

  // Ensure popup and todos are loaded
  cy.get('.popup-inner').should('be.visible');
  cy.get('.todo-item').should('exist');

  // Store the initial count
  cy.get('.todo-item').then($items => {
    const initialCount = $items.length;

    // Delete the specific todo item
    cy.contains('.todo-item', 'Watch this video').within(() => {
      cy.get('.checker').should('have.class', 'checked'); // Confirm it's checked
      cy.get('.remover').click(); // Delete
    });

    // Wait for DOM update and verify item count
    cy.get('.todo-item').should('have.length.lessThan', initialCount);
    cy.contains('.todo-item', 'Watch this video').should('not.exist');
  });
});
after(function () {
  if (taskId) {
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/tasks/byid/${taskId}`,
      failOnStatusCode: false
    });
  }
});

// Second after hook - Delete user after tasks are cleaned up
after(function () {
  if (uid) {
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${uid}`,
      failOnStatusCode: false
    });
  }
});
  
});
