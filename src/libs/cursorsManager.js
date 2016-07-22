import PIXI from 'libs/pixi.js';
import Matter from 'matter-js'; window.Matter = Matter;
import io from 'socket.io-client';
import Cursor from 'libs/cursor.js';


function cursorsManager(_opts){
	const opts = Object.assign({
		collid: false,
		collidRadius: 12,
		worldBoundaries: true,
		elem: document.getElementById('cursors') || document.body,
		socket_adress: 'http://localhost:8080',
		hoverableElementsSelector: 'a'
	}, _opts);


	const
		Engine = window.Matter.Engine,
		World = window.Matter.World,
		Bodies = window.Matter.Bodies,
		Events = window.Matter.Events;

	let stage, engine, renderer, textures, socket;
	let elements = document.querySelectorAll(opts.hoverableElementsSelector);
	let cursors = {};



	// -------------------------------------------------------------------------

	(function initEngine(){
		engine = Engine.create(/*document.body*/);
		engine.world.gravity.x = 0;
		engine.world.gravity.y = 0;

		if(opts.worldBoundaries){
			let w = window.innerWidth,
				h = window.innerHeight,
				offset = 50,
				boundaries = [
					Bodies.rectangle(w*.5, -offset, w + 2 * offset, 100, { isStatic: true }),
					Bodies.rectangle(w*.5, h + offset, w + 2 * offset, 100, { isStatic: true }),
					Bodies.rectangle(w + offset, h*.5, 100, h + 2 * offset, { isStatic: true }),
					Bodies.rectangle(-offset, h*.5, 100, h + 2 * offset, { isStatic: true })
				];
			World.add(engine.world, boundaries);
		}

		Engine.run(engine);
	})();


	(function initRenderer(){
		renderer = PIXI.autoDetectRenderer(
			window.innerWidth,
			window.innerHeight,
			{
				transparent: true,
			}
		);

		stage = new PIXI.Container();
		if(window.devicePixelRatio === 2){
			textures = {
				default: PIXI.Texture.fromImage('assets/images/cursors/default@2x.png'),
				pointer: PIXI.Texture.fromImage('assets/images/cursors/pointer@2x.png')
			}
		}else{
			textures = {
				default: PIXI.Texture.fromImage('assets/images/cursors/default.png'),
				pointer: PIXI.Texture.fromImage('assets/images/cursors/pointer.png')
			}
		}

		opts.elem.appendChild(renderer.view);
	})();


	(function initPhysics(){
		if(opts.collid){
			let cursor = Bodies.circle(0, 0, opts.collidRadius, { isStatic : true });
			World.add(engine.world, cursor);

			window.addEventListener('mousemove', function(e){
				Matter.Body.setPosition(cursor, {
					x : e.pageX + 3,
					y : e.pageY + 5
				});
			});
		}
	})();


	(function updateRenderer() {
		requestAnimationFrame(updateRenderer);

		for(let id in cursors){
			if(cursors.hasOwnProperty(id)){
				let cursor = cursors[id];
				cursor.updateSprite();
			}
		}

		renderer.render(stage);
	})();



	// -------------------------------------------------------------------------

	(function initSocketEvent(){
		socket = io(opts.socket_adress);

		socket.on('connection', function(clients){
			// cursors = clients;
		});

		socket.on('user_enters', function(c){
			let cursor = new Cursor(c.id, c.position.x, c.position.y, textures.default);
			add(cursor);
		});

		socket.on('user_exits', function(c){
			kill(cursors[c.id]);
		});

		socket.on('user_moves', function(c){
			let cursor = cursors[c.id] || add(new Cursor(c.id, c.position.x, c.position.y, textures.default));;
			cursor.updatePosition(c.position);
		});

		socket.on('mouseenter', function(data){
			cursors[data.cursor].changeSprite(textures.pointer);

			let elem = elements[data.elem];

			addToCursorsList(elem, data.cursor);
			elem.classList.add('hover');
		});

		socket.on('mouseleave', function(data){
			cursors[data.cursor].changeSprite(textures.default);

			if(data.elem){
				let elem = elements[data.elem];
				removeFromCursorsList(elem, data.cursor);
				if(getCursorsList(elem).length==0){
					elem.classList.remove('hover');
				}
			}else{
				for(let i=0, l=elements.length; i<l; i++){
					let elem = elements[i];
					removeFromCursorsList(elem, data.cursor);
					if(getCursorsList(elem).length==0){
						elem.classList.remove('hover');
					}
				}
			}
		});

		function getCursorsList(elem){
			let cursorsList = elem.getAttribute('data-cursors');
			if(cursorsList) return cursorsList.split(',');
			else return [];
		}

		function addToCursorsList(elem, cursorID){
			let curList = getCursorsList(elem);
			curList.push(cursorID);
			elem.setAttribute('data-cursors', curList);
		}

		function removeFromCursorsList(elem, cursorID){
			let curList = getCursorsList(elem);
			let index = curList.indexOf(cursorID);
			if(index > -1) curList.splice(index, 1);
			elem.setAttribute('data-cursors', curList);
		}

	})();


	(function initSocketCursorEventForwarding(){
		window.addEventListener('mousemove', function(e){
			// setTimeout(function(){
				socket.emit('user_moves', {
					x: e.pageX,
					y: e.pageY
				});
			// }, 100);
		});

		for(let i=0, l=elements.length; i<l; i++){
			let elem = elements[i];
			elem.addEventListener('mouseenter', function(){
				socket.emit('mouseenter', i);
			});

			elem.addEventListener('mouseleave', function(){
				socket.emit('mouseleave', i);
			});
		}
	})();



	// -------------------------------------------------------------------------

	function add(cursor){
		cursors[cursor.id] = cursor;
		stage.addChild(cursor.sprite);
		World.add(engine.world, cursor.hitbox);

		return cursor;
	}

	function kill(cursor){
		cursor.kill();

		return cursor;
	}

	function populate(n){
		for(let i=0; i<n; i++){
			let x = Math.random() * window.innerWidth;
			let y = Math.random() * window.innerHeight;
			let id = Math.random() * 999999;

			let cursor = new Cursor(id, x, y, textures.default);
			cursor.kill();
			add(cursor);
		}
	};



	return {
		add,
		populate
	};
}

export default cursorsManager;