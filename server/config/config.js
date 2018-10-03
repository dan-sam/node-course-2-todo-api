//If we are on heroku, this evn var will be set to production
//If we run test, it will be set to "test" as specified in package.json
//If we just run server.js locally on a pc, this env var will not be set
//and it will use 'development'.
var env = process.env.NODE_ENV || 'development';

console.log('env *****', env);

if(env === 'development'){
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
}
else if(env === 'test'){
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
