const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '5bb3382f3dcae57fb90091ef11';
//
// if(!ObjectID.isValid(id)){
//   console.log('ID not valid');
// }
// Todo.find({
//   _id: id
// }).then((todos)=>{
//   console.log('Todos: ', todos);
// });

//findOne returns null if the entry does not exist
// Todo.findOne({
//   _id: id
// }).then((todo)=>{
//   console.log('Todo: ', todo);
// });

//if you only look for an entry by a specific id then it's as simple as this
// Todo.findById(id).then((todo)=>{
//   if(!todo){
//     return console.log('Id not found');
//   }
//   console.log('Todo by Id: ', todo);
// }).catch((err)=>{
//   console.log(err);
// });

var userID = '5bad0db532c17679332a0dea';
User.findById(userID).then((user)=>{
  if(!user){
    return console.log('User not found');
  }
  console.log(user);
}).catch((err)=>{
  console.log(err);
});
