'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

const bodyParser = require('body-parser');
const dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGOLAB_URI);

const LinkSchema = mongoose.Schema;

const linkSchema = new LinkSchema({
  link: String,
  shortUrl: Number
});

const Link = mongoose.model('Link', linkSchema);


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

let urlencodedParser = bodyParser.urlencoded({ extended: false });

let counter = 1;

app.post('/api/shorturl/new', urlencodedParser, function(req, res) {  
  let patternUrl = /^(https?:\/\/)?(www[.])?(.+[.].+)/g;  
  let postUrl = req.body.url.replace(patternUrl, "$3");
  
  dns.lookup(postUrl, function (err, addresses) {
    if(err) {
      res.json({"error":"invalid URL"});
    }
    else {
      let link = new Link({
        link: req.body.url,
        shortUrl: counter
      });
      link.save().then(() => counter++);
      
      res.json({"original_url": req.body.url, "short_url": counter});
    }
  });
  
});

app.get('/api/shorturl/([0-9])', function(req, res){
  let enterUrl = req.url.replace('/api/shorturl/', '');
  Link.findOne({"shortUrl":enterUrl}, function (err, data) {
    if(err) {
      res.json({"error":"Something went wrong"});
    }
    else {
      console.log(data.link);
      res.redirect(data.link);
    }
  });
  //res.end("Why we have reached this point? o_O");
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});