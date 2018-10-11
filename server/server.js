require('./config/config.js');

const _ = require('lodash');
const express = require("express");
const bodyParser = require("body-parser");
const {ObjectID} = require('mongodb');

var {mongoose} = require("./db/mongoose.js");
var {Todo} = require("./models/todo.js");
var {User} = require("./models/user.js");
var {authenticate} = require("./middleware/authenticate.js")

var app = express();
const port = process.env.PORT;

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



// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token)=>{
    res.header('x-auth', token).send(user);
  }).catch((err) => {
    res.status(400).send(err);
  });
});


app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});



app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(user);
      });
  }).catch((err) => {
      res.status(400).send();
  });

  // var hashedPassword;
  //
  // bcrypt.genSalt(10, (err, salt) => {
  //   bcrypt.hash(body.password, salt, (err, hash) => {
  //     hashedPassword = hash;
  //   });
  // });
  //
  // User.findOne({email}).then((user) => {
  //   bcrypt.compare(user.password, hashedPassword, (err, res) => {
  //     if(res){
  //       return res.status(200).send(user);
  //     }
  //     res.status(404).send();
  //   });
  // }).catch((err) => {
  //   res.status(400).send(err);
  // });
});



app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app: app
};
