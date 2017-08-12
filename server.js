var express = require('express');
var morgan = require('morgan');
var path = require('path');
var https = require('https');
//var cookieParser = require('cookie-parser')
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
app.use(express.cookieParser())

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

app.get('/load.gif', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'load.gif'));
});
app.get('/photo.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'photo.png'));
});


app.get('/getuserlist', function (req, res) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    pool.query('SELECT * FROM users', (err, result) => {
      if(err)
      {
         res.status(500).send(err.toString()); 
      }
      else
      {
          res.send(JSON.stringify(result.rows));
      }
    });
});

app.get('/restartserver', function (req, res) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     initializerestart();
     res.send("Restart Initialized");
});

app.get('/24x7', function (req, res) {
    if(req.cookies.zuid)
    {
      res.sendFile(path.join(__dirname, 'ui', 'home.html'));
    }
    else
    {
        res.sendFile(path.join(__dirname, 'ui', 'login.html')); 
    }
});

function restart(dinoisses,commitid,profile,uid)
{
    var d = new Date();
    var n = d.toString(); 
    console.log(` ${n} restart ! ${dinoisses}! ${commitid} ! ${profile}`);
    
    // create the JSON object
    jsonObject = `{"gitRevision":"${commitid}","gitUrl":"https://github.com/${profile}/imad-app.git"}`;
 
   // prepare the header
   var postheaders = {
    'Content-Type' : 'application/json',
    'Content-Length' : Buffer.byteLength(jsonObject, 'utf8'),
    'Cookie' : `dinoisses=${dinoisses}`
   };
 
    // the post options
    var optionspost = {
        host : 'imad-api.hasura.io',
        port : 443,
        path : '/restart',
        method : 'POST',
        headers : postheaders
    };


    var reqPost = https.request(optionspost, function(res) {

    res.on('data', function(d) {
        console.log('POST result:' +d);
        console.log('POST completed');
        var jd =JSON.parse(d);
        if(jd.success ===  true)
        {
           restartstatus(uid, 'SUCCESS');
        }
        else
        {
            restartstatus(uid, 'FAILED');
        }
        });
    });
 
    // write the json data
    reqPost.write(jsonObject);
    reqPost.end();
    reqPost.on('error', function(e) {
    console.log('error:' +e); 
    restartstatus(uid, 'FAILED');
    });
}

function initializerestart()
{
    pool.query("SELECT * FROM restart WHERE runkey ='START'", (err, result) => {
      if(err)
      {
         console.log(err); 
      }
      else
      {
          
          for(index = 0 ; index < result.rows.length; index++)
          {
              datarow = result.rows[index];
              if(datarow.gitcommit && datarow.gitusername && datarow.dinoisses)
              {
                restart(datarow.dinoisses,datarow.gitcommit,datarow.gitusername,datarow.uid);
              }
              
          }
      }
    });
    
     pool.query("SELECT * FROM restart WHERE runkey ='ME'", (err, result) => {
      if(err)
      {
         console.log(err); 
      }
      else
      {
          
          for(index = 0 ; index < result.rows.length; index++)
          {
              datarow = result.rows[index];
              if(datarow.gitcommit && datarow.gitusername && datarow.dinoisses)
              {
                restart(datarow.dinoisses,datarow.gitcommit,datarow.gitusername,datarow.uid);
              }
              
          }
      }
    });
}


function restartstatus(uid, dst)
{
    var d = new Date().toString(); 
    pool.query('UPDATE restart SET lastrun = $1, laststatus = $2 WHERE uid = $3',[d , dst, uid ]);
}

//setInterval(initializerestart(), 900000);
//900000
// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
   var d = new Date();
   var n = d.toString(); 
  console.log(`${n} IMAD course app listening on port ${port}!`);
});
