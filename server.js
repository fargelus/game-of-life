const express = require('express');
const path = require('path');
const redis = require('redis');

// port
const port = 3000;

// Init app
const app = express();

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.static('.'));

app.listen(port, function () {
  console.log('Server starts at ' + port);
});
