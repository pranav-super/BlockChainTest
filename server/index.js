var express = require('express');

var mySql = require('mysql');
var app = express();

var connection = mySql.createConnection({
  host: 'HOSTNAME',
  user: 'USERNAME',
  password: 'PASSWORD',
  database: "DATABASENAME"
});

connection.connect();

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

app.post('/', async function (req, res) {
  handlePost(req, res);
});

async function handlePost(req, res) { //if status is failed, YOURE IN TROUBLE, if status is false, the user already exists OR the user is not in the DB, if status is true, the user has been created OR the user is in the DB.
//  connection.connect();
  //console.log(req.body);
  const requestBody = req.body;

  //var er = true;





  if (requestBody.reason == 'submitUser') { //in New User
    //add a user
    const username = requestBody.username;
    const password = requestBody.password;
    const hash = requestBody.hash;

    var promiseQuery = new Promise(function(resolve, reject) {
      connection.query("SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "';", function(error, results, fields){
        if (error) {
          //throw error;
          //er = true;
          //res.json({status: 'failed'});
          reject('failed');
        }
        else {
          if (results.length > 0) {
            //res.json({status: 'false'});
            resolve('alreadyExists');
          }
          resolve('doesntExist');
        }
      });
    });

    promiseQuery
      .then(
        function(result) {
          if(result == 'alreadyExists') {
            res.json({status: 'false'}); //shouldn't be hit, the way I wrote the NewUser class
          }
          else {
            //this query runs synchronously
            connection.query("INSERT INTO users ( username, password, hash ) VALUES ( '" + username + "', '" + password + "', '" + hash + "' );", function(error, results, fields){
              if (error) {
                //er = true;
                res.json({status: 'failed'});
                //throw error;
              }
              else {
                //er = false;
                res.json({status: 'true'});
              }
            });
          }

        },

        function(failure) {
          res.json({status: 'failed'});
        }
      );
  }







  else if (requestBody.reason == 'verifyUser') { //in Transaction and in New User
    //add a user
    const username = requestBody.username;
    var hash = '';

    var promiseQuery = new Promise(function(resolve, reject) {
      connection.query("SELECT * FROM users WHERE username='" + username + "';", function(error, results, fields){
        if (error) {
          throw error;
          //er = true;
          //res.json({status: 'failed'});
          reject('failed');
        }
        else {
          if (results.length > 0) {
            //res.json({status: 'false'});
            console.log(results);
            hash = results[0].hash;
            resolve('alreadyExists');
          }
          else {
            resolve('doesntExist');
          }
        }
      });
    });

    promiseQuery
      .then(
        function(result) {
          if(result == 'alreadyExists') {
            res.json({status: 'false', hash: hash});
          }
          else {
            res.json({status: 'true'});
          }
        },

        function(failure) {
          res.json({status: 'failed'});
        }
      );
  }








  else if (requestBody.reason == 'login'){ //in Login
    const username = requestBody.username;
    const password = requestBody.password;
    //check if user is present
    connection.query("SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "';", function(error, results, fields){


      if (error) {
        //throw error;
        //er = true;
        res.json({status: 'failed'});
      }
      else {
        /*er = false;
        console.log(results);
        console.log('.');
        res.json({status: true});*/
        //console.log(results.length);
        if (results.length > 0) {
          //user exists!
          const sqlhash = results[0].hash;
          res.json({status: 'true', hash: sqlhash});
        }
        else {
          //user does not exist
          res.json({status: 'false'});
        }
      }
    });
  }





  else if (requestBody.reason == 'getUsernameFromHash') { //in Landing
    const hash = requestBody.hash;
    connection.query("SELECT * FROM users WHERE hash='" + hash + "';", function(error, results, fields) {
      if (error) {
        res.json({status: 'failed'});
      }
      else {
        if (results.length > 0) {
          const username = results[0].username;
          res.json({status: "user", username: username});
        }
        else {
          res.json({status: "no user"});
        }
      }
    });
  }


  /*else { ///this is to verify if the user is in the DB
    const username = requestBody.username;

    connection.query("SELECT * FROM users WHERE username='" + username + "';", function(error, results, fields){
      if (error) {
        //throw error;
        //er = true;
        res.json({status: 'failed'});
      }
      else {
        /*er = false;
        console.log(results);
        console.log('.');
        res.json({status: true});*
        //console.log(results.length);
        if (results.length > 0) {
          //user exists!
          res.json({status: 'true'});
        }
        else {
          //user does not exist
          res.json({status: 'false'});
        }
      }
    });
  }*/
  //res.json({status: false});
}







//close connection here
//MAKE SURE TO READ UP ON PROMISES, AND AWAITS. MAKE SURE YOU HAVE IT DOWN.
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    /*if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();*/
    console.log("Bye!" + " " + exitCode + " " + options);
    connection.end();
    process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));


//ONLY TAKES POST REQUESTS.
  //ONE TYPE OF POST SENDS USERNAME AND PASSWORD AND VERIFIES IF THE USER EXISTS
  //OTHER TYPE OF POST SENDS USERNAME AND PASSWORD TO ADD TO DATABASE
/*
connection.query('SELECT * FROM users', function(error, results, fields){
  if (error) throw error;
  console.log(results[0].username);
}); //prints first, that's synchronous babey
*/
//connection.end(); //ran synchronously lol
