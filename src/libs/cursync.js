import io from 'socket.io-client';

function Cursync(opts){
	const
		self = this,
		cursors = {};

	const socket = io(opts.socket.adress);



	socket.on('connection', function(clients){
		self.cursors = clients;
	});



	window.addEventListener('mousemove', function(e){
		setTimeout(function(){
			let obj = {
				x : e.pageX,
				y : e.pageY
			};
			socket.emit('move', obj);
		}, 100);
	});




	socket.on('new_user', function(id){
		console.log('new_user !', id);
		self.cursors[id] = createBunny();
		bunnies.push(self.cursors[id]);
		// console.log(cursors);
	});


	socket.on('move', function(cursor){
		// setTimeout(function(){
			// console.log(cursor);
			if(!self.cursors[cursor.id]){
				self.cursors[cursor.id] = createBunny();
				bunnies.push(cursors[cursor.id]);
			}
			Matter.Body.setPosition(self.cursors[cursor.id].body, {x: cursor.position.x, y: cursor.position.y});
		// }, 100);
	});




}

export default Cursync;