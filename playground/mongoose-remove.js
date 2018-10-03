const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

//Both return the deleted doc
//Todo.findOneAndRemove()
//Todo.findByIdAndRemove()

// Todo.findOneAndRemove({_id:'5bb4bd5d863a971f8350ca31'}).then((result) => {
//
// });

Todo.findByIdAndRemove('5bb4bd5d863a971f8350ca31').then((todo)=>{
  console.log(todo);
});
