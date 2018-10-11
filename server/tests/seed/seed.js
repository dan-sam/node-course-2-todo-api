const{ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();


const users = [{
  _id: userOneId,
  email: 'andrew@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'asdf@example.com',
  password: 'userTwoPass'
}];

const todos = [{
  _id: new ObjectID(),
  text : 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 123
}];


const populateTodods = (done)=>{
  Todo.remove({}).then(()=>{
    return Todo.insertMany(todos);
  }).then(()=>done());
}


const populateUsers = (done) => {
  User.remove({}).then(() => {

    //==> We have to do it this way with .save() because we want the passwords
    //to be hashed. Check out in user.js, we defined with UserSchema.pre('save'...
    //that passwords have to be hashed first before (pre) .save() is called

    //both return a promise
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    //this one waits until all promises inside are fulfilled
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {todos, populateTodods, users, populateUsers};
