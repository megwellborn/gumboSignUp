var express = require('express'); //loading package express
var httpModule = require('http'); //loading package http
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient

var app = express(); //create an express app (to hanle html stuff)
var http = httpModule.Server(app);

app.use(express.static('assets')); //any assets will be found in the folder assets (pics and such)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  console.log('got a GET request');
}); //get request to / is given to responder function

app.get('/verifyAdmin', (req, res) => {
  console.log('got a verifyAdmin GET request');
  console.log(JSON.stringify(req.query));

  var admEmail = req.query.admEmail;
  var admPass = req.query.admPass;

  console.log("AdmEmail" + admEmail);

  var cursor1 = db.collection('admins').findOne({'Aemail': admEmail},
  function(err, account){
    if (err !== null) {
      console.error(err);
      return 1;
    }
    console.log("Found " + JSON.stringify(account));
    if (account !== null) {
      if (admEmail == account.Aemail && admPass == account.Apassword) {
        res.redirect('/admin');
      }
      else {
        res.redirect('/adminLogin');
      }
    }
  });

});

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/about.html');
  console.log('got a GET request');
}); //get request to /about is given to responder function

// Assumptions:
// We want to show only the first N shifts after the CURRENT date
// Set N = 5 for now.
var N = 5;
app.get('/volunteer', (req, res) => {
  //obtain data from shifts into cursor object
  var todaysDate = new Date();
  var stringDate = ('0' + (todaysDate.getMonth()+1)).slice(-2) + '/' +
    ('0' + todaysDate.getDate()).slice(-2) + '/' + todaysDate.getFullYear();
  console.log(stringDate);
  var cursor1 = db.collection('shifts').find({"date":{$gte: stringDate}});
  var cursor2 = db.collection('signup').find();
  //var cursor = db.collection('shifts').find({"date":{$gte: "04/04/2017"}});
  //convert to array to extract shift data
  cursor1.toArray(function(err1, results1){
    if(err1)
    return console.log(err1);
    console.log("got these filtered results:")
    console.log(results1);
    //render shifts.ejs
    cursor2.toArray(function(err2, results2){
      if(err2)
      return console.log(err2);

      res.render('volunteer.ejs', {shifts:results1, signup:results2});
    });
  });
  console.log('got a GET request');
}); //get request to /volunteer is given to responder function

app.get('/location', (req, res) => {
  res.sendFile(__dirname + '/location.html');
  console.log('got a GET request');
}); //get request to /location is given to responder function

app.get('/register', (req, res) => {
  //res.sendFile(__dirname + '/register.html');
  res.render('admin-login.ejs');
  console.log('got a GET request');
});

app.get('/contact', (req, res) => {
  res.sendFile(__dirname + '/contact.html');
  console.log('got a GET request');
}); //get request to /volunteer is given to responder function

app.get('/signup', (req, res) => {
  //obtain data from shifts into cursor object
  var cursor1 = db.collection('shifts').find();
  var cursor2 = db.collection('volunteer').find();
  //convert to array to extract shift data
  cursor1.toArray(function(err1, results1){
    if(err1)
    return console.log(err1);

    cursor2.toArray(function(err2, results2){
      if(err2)
      return console.log(err2);

      //render sign-up.ejs
      res.render('sign-up.ejs', {shifts:results1, volunteer:results2});
    });
  });

  console.log('got a GET request');
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html');
  console.log('got a GET request');
});


app.get('/create-shift', (req, res) => {
  res.sendFile(__dirname + '/shifts.html');
  console.log('got a GET request');
});

app.get('/shifts', (req, res) => {
  //obtain data from shifts into cursor object
  var cursor = db.collection('shifts').find();
  //convert to array to extract shift data
  cursor.toArray(function(err, results){
    if(err)
    return console.log(err);

    //render shifts.ejs
    res.render('shifts.ejs', {shifts:results});
  });
  console.log('got a GET request');
}); //get request to /shift is given to responder function

app.post('/addshift', (req, res) => {
  console.log('got Post /addshift request');
  console.log(req.body);

  db.collection('shifts').save(req.body, (err, result) => {
    if (err)
    return console.log(err);
    console.log('saved to database');
    updateIds();  // update the list of shift IDs since a shift was added
    res.redirect('/shifts');
  });
});

app.get('/adminLogin', (req, res) => {
  res.sendFile(__dirname + '/adminLogin.html');
  console.log('got a GET request');

});


app.post('/addVolunteer', (req, res) => {
  console.log('got Post /addVolunteer request');
  console.log(req.body);

  //create object that stores items needed for signup table
  var signup = {};
  signup.email = req.body.email;
  signup.shiftID = req.body.shiftID;
  signup.numVols = req.body.numVols;

  var vol = {};
  vol.email = req.body.email;
  vol.firstName = req.body.firstName;
  vol.lastName = req.body.lastName;
  vol.orgName = req.body.orgName;
  vol.groupVol = req.body.groupVol;
  vol.numVols = req.body.numVols;

  db.collection('volunteer').save(vol, (err, result) => {
    if (err)
    return console.log(err);
    console.log('volunteer saved to database');
    updateVolunteersIds();  // update the list of volunteer IDs since a volunteer was added
    db.collection('signup').save(signup, (err, result) => {
      if (err)
      return console.log(err);
      console.log('signup record saved to database');
      res.redirect('/location');
    });
  });
});

app.post('/addAdmin', (req, res) => {
  console.log('got Post /addAdmin request');
  console.log(req.body);

  //create object that stores items needed for signup table
  var user = {};
  user.Aemail = req.body.Aemail;
  user.Apassword = req.body.Apassword;

  db.collection('admins').save(user, (err, result) => {
    if (err)
    return console.log(err);
    console.log('admin user saved to database');
    updateAdminIds();  // update the list of admin IDs since an admin was added
    res.redirect('/adminLogin')
  });
});

app.post('/update_delete', (req, res) => {
  console.log('got Post /update_delete request');
  console.log(req.body);
  if(req.body.operationType == "update"){
    // An entry in shifts collection needs to be updated
    // BIG ASSUMPTION: only the capacity should be allowed to be updated in order
    // not to invalidate other collections.
    db.collection('shifts').update(
      {_id: ids[req.body.num]}, // _id of element to be updated
      {$set: {date: req.body.date, start_time: req.body.start_time, end_time: req.body.end_time, num_volunteers: req.body.num_volunteers}}
      , (result) => {
        res.redirect('/shifts');  // update the page
      });
    }
    else if(req.body.operationType == "delete"){
      console.log("deleting a record " + ids[req.body.num]);
      db.collection('shifts').remove(
        {_id: ids[req.body.num]}, true, (result) => {
          updateIds();
          res.redirect('/shifts');
        });
    }
});

function portListener(){
  console.log('Listening on localhost ' + port);
};

var port = process.env.PORT || 3000;

// db will be associated with the database when the connection to
// to MongoLab is established.
var db;
// The ids of current entries in the database are keep in array ids.
var ids = new Array();
var volIds = new Array();
var adminIds = new Array();

// Connect to MongoLab, when the connection is established then
// associate the MongoLab database with variable db and start listening
// to HTML requests.
MongoClient.connect('mongodb://WFUCG:grow@ds113680.mlab.com:13680/campus_garden',
(err, database) => {
  if (err)
    return console.log(err);
  db = database;
  console.log("Connected to Mlab...");
  updateIds((result) => {
    console.log(result);
  });
  http.listen(port, portListener);
});

function updateIds(callback) {
  var cursor = db.collection('shifts').find();
  cursor.toArray(function (err, results) {
    if (err)
    return console.log(err);
    ids = [];
    for (var i = 0; i < results.length; i++) {
      ids.push(results[i]._id);
    }
    if (typeof callback != "undefined")
      callback(ids);
  });
}

function updateVolunteersIds(callback) {
  var cursor = db.collection('volunteer').find();
  cursor.toArray(function (err, results) {
    if (err)
    return console.log(err);
    volIds = [];
    for (var i = 0; i < results.length; i++) {
      volIds.push(results[i]._id);
    }
    if (typeof callback != "undefined")
      callback(volIds);
  });
}

function updateAdminIds(callback) {
  var cursor = db.collection('admins').find();
  cursor.toArray(function (err, results) {
    if (err)
    return console.log(err);
    adminIds = [];
    for (var i = 0; i < results.length; i++) {
      ids.push(results[i]._id);
    }
    if (typeof callback != "undefined")
      callback(adminIds);
  });
}
