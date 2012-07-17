var express = require('express')
  , app = express();
  
var poll = {
  "Skrillex": 5,
  "Bon Jovi": 10,
  "Aerosmith": 8,
  "Renée Martel": 14
};

var changed = false;

app.configure('development', function(){
    app.use(express.static(__dirname + '/static'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

var server = app.listen(9123);
var io = require('socket.io').listen(server);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/results', function (req, res) {
  var results = [];
  for(key in poll) {
    results.push({name: key, value: poll[key]})
  }
  
  res.send(results);
});

app.get('/vote', function (req, res) {
  res.sendfile(__dirname + '/vote.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('choices', Object.keys(poll));
  socket.on('vote', function (data) {
    if(data.choice in poll) {
      changed = true
      poll[data.choice]++
    }
  })
});

setTimeout(function sendResults() {
  var results = [];
  if(changed) {
    for(key in poll) {
      results.push({name: key, value: poll[key]})
    }
    io.sockets.emit("results", results);
    changed = false;
  }
  setTimeout(sendResults, 1000);
}, 1000)