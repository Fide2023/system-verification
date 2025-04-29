describe('Create Task After Login', () => {
  let uid;
  let name;
  let email;

  before(function () {
    // Create test user from fixture
    cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid;
          name = user.firstName + ' ' + user.lastName;
          email = user.email;
        });
      });
  });

  beforeEach(function () {
    // Visit and login
    cy.visit('http://localhost:3000');
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email);
    cy.get('form').submit();
    cy.get('h1').should('contain.text', 'Your tasks, ' + name);
  });

  it('should create a task with video and add todo', () => {
    // Click new task container
    cy.get('.container-element').last().click();

    // Create task with video
    const taskTitle = 'newtask';
    const videoId = 'mNf6U1h3WUs';

    cy.get('.submit-form').within(() => {
      cy.get('input#title').type(taskTitle);
      cy.get('input#url').type(videoId);
      cy.get('input[type="submit"]').click();
    });

    // Open task details
    cy.get('.container-element').first().within(() => {
      cy.get('.title-overlay').should('contain', taskTitle);
      cy.get('a').click();
    });

  
  });
 it('should create a todo under the video ', () => {
  const taskTitle = 'newtask';
  const videoId = 'mNf6U1h3WUs';

  // Reopen the popup by clicking the task
  cy.get('.container-element').first().within(() => {
    cy.get('.title-overlay').should('contain', taskTitle);
    cy.get('a').click();
  });

  // // Ensure the popup is visible
    cy.get('.popup-inner').should('be.visible').within(() => {
      // Verify the video image is present
      cy.get('img')
        .should('have.attr', 'src')
        .and('include', videoId);

  //   // Add a todo item
     cy.get('.todo-list').within(() => {
       cy.get('.inline-form').within(() => {
         cy.get('input[type="text"]')
           .should('exist')
           .type('Watch this video', { force: true });  //force type to avoid visibility error
           cy.get('input[type="submit"]')
           .scrollIntoView()
           .click({ force: true });
      
       });
        // Verify todo was added
      cy.get('.todo-item')
      .should('be.visible')
      .should('contain', 'Watch this video');
  

  //     // Check that the todo was added
  //     cy.contains('.todo-item', 'Watch this video').should('be.visible');
     });
  });
});

  
after(function () {
  // Get all tasks for user
  cy.request({
    method: 'GET',
    url: `http://localhost:5000/tasks/ofuser/${uid}`,
    failOnStatusCode: false
  }).then((taskResponse) => {
    if (taskResponse.status === 200) {
      taskResponse.body.forEach(task => {
        // Delete task (this will cascade delete todos)
        cy.request({
          method: 'DELETE',
          url: `http://localhost:5000/tasks/byid/${task._id.$oid}`,
          failOnStatusCode: false
        });
      });
    }
    
    // Delete test user (this will cascade delete remaining data)
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${uid}`,
      failOnStatusCode: false
    });
  });
});
});