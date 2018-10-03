const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');

const todos = [{
  _id: new ObjectID(),
  text : 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 123
}];

beforeEach((done)=>{
  Todo.remove({}).then(()=>{
    return Todo.insertMany(todos);
  }).then(()=>done());
});


describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test Todo Text';

    request(app)
      .post('/todos')
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
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it('should return 404 if todo not found', (done) => {

    var hexId = new ObjectID().toHexString();

    request(app)
    .get(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
    .get('/todos/123')
    .expect(404)
    .end(done);
  });

});


describe('DELETE /todos/:id', () =>{
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
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

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
    .get('/todos/123')
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

  it('should clear completedAt when todo is not completed', (done) => {
    //grab id of second todo item
    var hexId = todos[1]._id.toHexString();
    //update text, set completed to false
    var newText = 'New text for 2nd todo.';
    var oldText = todos[1].text;

    request(app)
    .patch(`/todos/${hexId}`)
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
