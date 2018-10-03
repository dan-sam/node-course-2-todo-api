const _ = require('lodash');
const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require('mongodb');

var {mongoose} = require("./db/mongoose.js");
var {Todo} = require("./models/todo.js");
var {User} = require("./models/user.js");


var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});


app.get('/todos', (req, res) => {
  Todo.find().then((todos)=>{
    res.send({todos});
  }, (err) => {
    res.status(400).send(err);
  });
});




app.get('/todos/:id', (req, res) => {

  var id = req.params.id;
  //res.send(req.params);
    if(!ObjectID.isValid(id)){
      return res.status(404).send();
    }


    Todo.findById(id).then((todo) => {
      if(!todo){
        return res.status(404).send();
      }
      res.status(200).send({todo});
    }).catch((err) => {
      res.status(400).send();
    });

});



app.delete('/todos/:id', (req, res)=>{
  //get the id
  var id = req.params.id;

  // validate the id => not valid? return 404
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }
  //remove todo by id
    //success => if no doc, send 404 | if doc found, send 200
    //error => 400 with empty body
  Todo.findByIdAndRemove(id).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }
    res.status(200).send({todo});
    }).catch((err) => {
      res.status(400).send();
    });
});


app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;

  //pick fields from the request body if they exist
  var body = _.pick(req.body, ['text', 'completed']);

  // validate the id => not valid? return 404
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }
  else{
    body.completed = false;
    body.completedAt = null;
  }

  //Update uses certail sets of parameters, e.g. $set, $inc, just like we did
  //in mongodb-update.js

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }

    res.status(200).send({todo});

  }).catch((err) => {
    res.status(400).send();
  });

});



app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app: app
};
