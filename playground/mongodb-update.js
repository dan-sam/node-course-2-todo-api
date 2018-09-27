// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if(err){
    return console.log("Unable to connect to MongoDB server.");
  }

  console.log("connected to MongoDB server.");

  const db = client.db('TodoApp');

  //Operator Docs ==> https://docs.mongodb.com/manual/reference/operator/update/

  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectID("5bacea23863a971f8350a05e")
  // }, {
  //   $set: {
  //     completed: true
  //   }
  // }, {
  //     returnOriginal: false
  //
  // }).then((result)=>{
  //   console.log(result);
  // });


  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID("5b927964e16dfb2d50d6f191")
  }, {
    $set: {
      name: 'Dan'
    },
    $inc: {
      age: 1
    }
  }, {
      returnOriginal: false

  }).then((result)=>{
    console.log(result);
  });

  //db.close();
});
