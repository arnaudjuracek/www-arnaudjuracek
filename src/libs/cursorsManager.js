import PIXI from 'libs/pixi.js';
import Matter from 'matter-js'; window.Matter = Matter;
import io from 'socket.io-client';
import Cursor from 'libs/cursor.js';


function cursorsManager(_opts){
	const opts = Object.assign({
		elem: document.getElementById('cursors') || document.body,
		eventForwarding: {
			ws_adress: 'http://localhost:8080',
			hoverableElementsSelector: 'a',
		},
		physics: {
			collid: true,
			collidRadius: 12
		},
		engine: {
			constraintIterations: 2, 	// default 2
			positionIterations: 6, 		// default 6
			velocityIterations: 4,		// default 4
			enableSleeping: false		// default false
		}
	}, _opts);


	const
		Engine = window.Matter.Engine,
		World = window.Matter.World,
		Bodies = window.Matter.Bodies,
		Events = window.Matter.Events;

	let windowWidth = window.innerWidth;
	let windowHeight = window.innerHeight;
	window.addEventListener('resize', function(){
		setTimeout(function(){
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;

			updateEngineSize(windowWidth, windowHeight);
			updateRendererSize(windowWidth, windowHeight);
		}, 300);
	});

	let stage, engine, renderer, textures, socket;
	let worldBoundaries = [];
	let elements = document.querySelectorAll(opts.eventForwarding.hoverableElementsSelector);
	let cursors = {};



	// -------------------------------------------------------------------------

	(function initEngine(){
		engine = Engine.create(opts.engine);
		engine.world.gravity.scale = 0;

		updateEngineSize(windowWidth, windowHeight);
		World.add(engine.world, worldBoundaries);
		Engine.run(engine);
	})();


	function updateEngineSize(w, h){
		engine.world.bounds = { min: { x: 0, y: 0 }, max: { x: w, y: h } };

		World.remove(engine.world, worldBoundaries);
		worldBoundaries = [
			Bodies.rectangle(w*.5, -50, w + 2*50, 100, { isStatic: true }),
			Bodies.rectangle(w*.5, h + 50, w + 2*50, 100, { isStatic: true }),
			Bodies.rectangle(w + 50, h*.5, 100, h + 2*50, { isStatic: true }),
			Bodies.rectangle(-50, h*.5, 100, h + 2*50, { isStatic: true })
		];
		World.add(engine.world, worldBoundaries);
	}


	(function initRenderer(){
		renderer = PIXI.autoDetectRenderer(
			windowWidth,
			windowHeight,
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


	function updateRendererSize(w, h){
		renderer.resize(w, h);
	}


	(function initPhysics(){
		if(opts.physics.collid){
			let cursor = Bodies.circle(0, 0, opts.physics.collidRadius, { isStatic : true });
			World.add(engine.world, cursor);

			window.addEventListener('mousemove', function(e){
				Matter.Body.setPosition(cursor, {
					x : e.pageX,
					y : e.pageY
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
		socket = io(opts.eventForwarding.ws_adress);

		socket.on('hello', function(clients){
			for(let c in clients){
				let client = clients[c];

				// let x = client.position.percentage.x * windowWidth;
				// let y = client.position.pixel.y;
				let x = client.position.pixel.x;
				let y = client.position.pixel.y;

				let cursor = new Cursor(client.id, x, y, textures.default);
				if(client.isDead) cursor.kill();
				add(cursor);
			}
		});

		socket.on('user_exits', function(c){
			kill(cursors[c.id]);
		});

		socket.on('user_moves', function(c){
			// let x = c.position.percentage.x * windowWidth;
			// let vw = x/c.position.percentage.x;
			// let y = c.position.percentage.y * vw;
			let x = c.position.pixel.x;
			let y = c.position.pixel.y;

			let cursor = cursors[c.id] || add(new Cursor(c.id, x, y, textures.default));;
			cursor.updatePosition(x, y);
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
					pixel:{
						x: e.pageX,
						y: e.pageY
					},
					percentage:{
						x: (e.pageX/windowWidth),
						y: (e.pageY/windowHeight)
					}
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
			let x = Math.random() * windowWidth;
			let y = Math.random() * windowHeight;
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