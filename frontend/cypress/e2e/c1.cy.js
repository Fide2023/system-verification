describe('Create Todo Item', () => {
  let uid;
  let email;
  let taskId;
  
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

        // Create task via API
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
        });
      });
    });
  });
  

  beforeEach(() => {
    // Login and navigate to task
    cy.visit('http://localhost:3000');
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email);
    cy.get('form').submit();
    
    cy.get('.container-element').first().within(() => {
      cy.get('a').click();
    });
  });

  it('should create a new todo item', () => {
    const todoText = 'New todo item';
    
    cy.get('form.inline-form').within(() => {
      cy.get('input[type="text"]').type(todoText);
      cy.get('input[type="submit"]').click();
    });

    cy.get('.todo-list')
      .should('contain', todoText)
     
  });
  it('should disable the Add button when input is empty', () => {
    cy.get('form.inline-form').within(() => {
      cy.get('input[type="text"]').clear({ force: true });
      cy.get('input[type="submit"]').should('be.disabled');
    });
  });
 
  after(() => {
    // Cleanup
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