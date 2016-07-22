const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(8080);

app.get('/', function (req, res) {
  	res.sendfile(__dirname + '/index.html');
});



let cursors = {};
io.on('connection', function (socket) {
	let cursor = {
		id: socket.id,
		position: {x:null, y:null}
	};


	cursors[cursor.id] = cursor;
	console.log("----------------");
	console.log(cursors);

	socket.emit('hello', cursors);
  	socket.broadcast.emit('new_user', cursor.id);


  	socket.on('move', function (position){
  		cursor.position = position;
		socket.broadcast.emit('move', cursor);
  	});



  	socket.on('disconnect', function (socket) {
		delete cursors[cursor.id];
	});
});

