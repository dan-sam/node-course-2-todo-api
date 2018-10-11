const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');
const {User} = require('./../models/user.js');
const {todos, populateTodods, users, populateUsers} = require('./seed/seed.js');

beforeEach(populateUsers);
beforeEach(populateTodods);


describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test Todo Text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res)=> {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create todo with invalid body data', (done)=>{
    var emptyText = '';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({emptyText})
      .expect(400)
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('GET /todos', ()=>{
  it('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(1);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it('should return not todo doc created by other users', (done) => {
    request(app)
    .get(`/todos/${todos[1]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('should return 404 if todo not found', (done) => {

    var hexId = new ObjectID().toHexString();

    request(app)
    .get(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
    .get('/todos/123')
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

});


describe('DELETE /todos/:id', () =>{
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo._id).toBe(hexId);
    })
    .end((err, res) => {
      if(err){
        return done(err);
      }

      Todo.findById(hexId).then((todo)=>{
        expect(todo).toBeFalsy();
        done();
      }).catch((err) => {
        done(err);
      });

    });
  });

  it('should not remove a todo from other users', (done) => {
    var hexId = todos[0]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .end((err, res) => {
      if(err){
        return done(err);
      }

      Todo.findById(hexId).then((todo)=>{
        expect(todo).toBeTruthy();
        done();
      }).catch((err) => {
        done(err);
      });

    });
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
    .get('/todos/123')
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {

    var hexId = todos[0]._id.toHexString();
    var newText = 'New text for todo';

    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .send({
      completed: true,
      text: newText
    })
    .expect(200)
    .expect((res)=> {
      expect(res.body.todo.text).toBe(newText);
      expect(res.body.todo.completed).toBe(true);
      expect(typeof res.body.todo.completedAt).toBe('number');
    })
    .end(done);
  });

  it('should not update the todo of other users', (done) => {

    var hexId = todos[0]._id.toHexString();
    var newText = 'New text for todo';

    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .send({
      completed: true,
      text: newText
    })
    .expect(404)
    .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    //grab id of second todo item
    var hexId = todos[1]._id.toHexString();
    //update text, set completed to false
    var newText = 'New text for 2nd todo.';
    var oldText = todos[1].text;

    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .send({text: newText, completed: false})
    //200
    .expect((res)=> {
      expect(res.body.todo.text).toBe(newText);
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toBeFalsy();
    })
    .end(done);
    //text is changed, completed is false, completedAt is null (.toBeFalsy)

  });
});


describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
    .get('/users/me')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect(res => {
      expect(res.body._id).toBe(users[0]._id.toHexString());
      expect(res.body.email).toBe(users[0].email);
    })
    .end(done);
  });

  it('should return a 401 if not authenticated', (done) => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect(res => {
      expect(res.body).toEqual({});
    })
    .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
    .post('/users')
    .send({email, password})
    .expect(200)
    .expect(res => {
      expect(res.headers['x-auth']).toBeTruthy();
      //User toBeTruthy instead of toExist because of new versions etc.
      expect(res.body._id).toBeTruthy();
      expect(res.body.email).toBe(email);
    })
    .end((err) => {
      if(err){
        return done(err);
      }

      User.findOne({email}).then((user) => {
        expect(user.email).toBeTruthy();
        //use .not.toBe() instead of toNotBe() because of new versions etc.
        expect(user.password).not.toBe(password);
        done();
      }).catch((err) => done(err));

    });
  });

  it('should return validation errors if request invalid', (done) => {
    var email = 'exampleexample.com';
    var password = 'abc';

    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
    .post('/users')
    .send({email: users[0].email, password: '123abcasdf!'})
    .expect(400)
    .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
    .post('/users/login')
    .send({email: users[1].email, password: users[1].password})
    .expect(200) //btw .expect((res) => {...}); is a custom expect function
    .expect((res) => {
      expect(res.headers['x-auth']).toBeTruthy();
    })
    .end((err, res) => {
      if(err){
        return done(err);
      }
      User.findById(users[1]._id).then((user) => {
        //.toMatchObject instead of .toInclude => this is an Upgrade
        expect(user.tokens[1]).toMatchObject({
          access: 'auth',
          token: res.headers['x-auth']
        });
        done();
      }).catch((err) => done(err)); //the part .catch((err) => done(err)) gets you a useful error message
    });
  });

  it('should reject invalid login', (done) => {
    request(app)
    .post('/users/login')
    .send({email: users[0].email, password: users[0].password+'a'})
    .expect(400) //btw .expect((res) => {...}); is a custom expect function
    .expect((res) => {
      expect(res.headers['x-auth']).toBeFalsy();
    })
    .end((err, res) => {
      if(err){
        return done(err);
      }
      User.findById(users[1]._id).then((user) => {
        expect(user.tokens.length).toBe(1);
        done();
      }).catch((err) => done(err)); //the part .catch((err) => done(err)) gets you a useful error message
    });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on log out', (done) => {
    request(app)
    //delete request to /users/me/tokens
    .delete('/users/me/token')
    //set x-auth equal to tokens
    .set('x-auth', users[0].tokens[0].token)
    //expect 200
    .expect(200)
    .end((err, res) => {
      if(err){
        return done(err);
      }
      //find user, verify tokens array has length of zero
      User.findById(users[0]._id).then((user) => {
        expect(user.tokens.length).toBe(0);
        done();
      }).catch((err) => done(err));
    });
  });
});
