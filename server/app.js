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
	socket.broadcast.emit('user_enters', cursor);


	socket.on('user_moves', function (position){
		cursor.position = position;
		socket.broadcast.emit('user_moves', cursor);
	});

	socket.on('mouseenter', function(elem_index){
		socket.broadcast.emit('mouseenter', elem_index);
	});

	socket.on('mouseleave', function(elem_index){
		socket.broadcast.emit('mouseleave', elem_index);
	});

	socket.on('disconnect', function (socket) {
		io.sockets.emit('user_exits', cursor);
		// socket.broadcast.emit('exit', cursor);
		delete cursors[cursor.id];
	});
});

