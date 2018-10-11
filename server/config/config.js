//If we are on heroku, this evn var will be set to production
//If we run test, it will be set to "test" as specified in package.json
//If we just run server.js locally on a pc, this env var will not be set
//and it will use 'development'.
var env = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test'){
  var config = require('./config.json');
  //if you want to use a variable to access a property then you use these brackets: []
  var envConfig = config[env];
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
  //Now all the env vars are loded into the process. We can use them everywhere
  //in our code.
}
