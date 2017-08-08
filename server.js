var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;

var config = {
  user: 'pk155mail',
  database:'pk155mail',
  host:'db.imad.hasura-app.io',
  port:'5432',
  password: process.env.DB_PASSWORD
};


var app = express();
app.use(morgan('combined'));

var pool = new Pool(config);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


app.get('/getuserlist', function (req, res) {
    
    pool.query('SELECT * FROM users', (err, result) => {
      if(err)
      {
         res.status(500).send(err.toString()); 
      }
      else
      {
          res.send(JSON.stringify(result));
      }
    });
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
