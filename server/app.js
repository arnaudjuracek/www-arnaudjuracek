const path = require('path');
const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const fs = require('fs');
const jsonfile = require('jsonfile');

// -------------------------------------------------------------------------

const opts = {
	publicDir: '/public',
	port: 8080,

	cursorsMaxLength: 1000,
	cursorsFilename: 'cursors.json'
};
const staticPath = path.join(__dirname, opts.publicDir);



// -------------------------------------------------------------------------

app.use(express.static(staticPath));
server.listen(opts.port, function(){
	console.log('\x1b[36mlistening', staticPath, '\x1b[0m');
});




// -------------------------------------------------------------------------

(function initSocket(){
	const cursorsFile = path.join(__dirname, opts.cursorsFilename);
	let cursors = getCursorsFromFile(cursorsFile);

	let pageID = '/views/index.html';

	// -------------------------------------------------------------------------

	io.on('connection', function (socket) {
		let cursor = {
			id: socket.id,
			// id: socket.request.connection.remoteAddress,
			position: {
				pixel: {x:null, y:null},
				percentage: {x:null, y:null}
			},
			isDead: false,
			isMac: (socket.handshake.headers['user-agent'].toUpperCase().indexOf('MAC') >= 0)
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
				if(Object.keys(cursors).length > opts.cursorsMaxLength){
					if(cursors[index].isDead) delete cursors[index];
				}else break;
			}

			writeCursorsFile(cursorsFile, cursors);
		});
	});


	// -------------------------------------------------------------------------

	function writeCursorsFile(filename, _cursors){
		jsonfile.writeFile(filename, _cursors, {spaces: 2});
	}

	function getCursorsFromFile(filename){
		console.log(filename);
		if(fs.existsSync(filename)){
			console.log("cursors file found");
			return jsonfile.readFileSync(filename);
		}else return {};
	}

})();