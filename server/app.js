const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(8080);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});


// -------------------------------------------------------------------------
const opts = {
	cursorsMaxLength: 1000
};


(function initSocket(){
	let cursors = {};
	let pageID = '/views/index.html';

	io.on('connection', function (socket) {
		let cursor = {
			id: socket.id,
			position: {
				pixel: {x:null, y:null},
				percentage: {x:null, y:null}
			},
			isDead: false
		};

		// CLIENT CONNECTS
		cursors[cursor.id] = cursor;
		socket.emit('hello', cursors);
		socket.emit('page_change', pageID);

		// CLIENT MOVES
		socket.on('user_moves', function (position){
			cursor.position = position;
			socket.broadcast.emit('user_moves', cursor);
		});

		// CLIENT STARTS HOVERING
		socket.on('mouseenter', function(elem_index){
			socket.broadcast.emit('mouseenter', {elem:elem_index, cursor:cursor.id});
		});

		// CLIENT ENDS HOVERING
		socket.on('mouseleave', function(elem_index){
			socket.broadcast.emit('mouseleave', {elem:elem_index, cursor:cursor.id});
		});

		// CLIENT CHANGES PAGE
		socket.on('page_change', function(_pageID){
		 	pageID = _pageID;
			socket.broadcast.emit('page_change', pageID);
		});

		// CLIENTS DISCONNECTS
		socket.on('disconnect', function (socket) {
			io.sockets.emit('user_exits', cursor);
			io.sockets.emit('mouseleave', {elem:null, cursor:cursor.id});
			cursors[cursor.id].isDead = true;

			// delete oldest cursors when limit reached
			for(let index in cursors){
				console.log(index);
				if(Object.keys(cursors).length > opts.cursorsMaxLength){
					if(cursors[index].isDead) delete cursors[index];
				}else break;
			}

		});
	});

})();