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

	let stage, engine, renderer, texture, socket;
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
		renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight ,{transparent:true});
		stage = new PIXI.Container();
		texture = PIXI.Texture.fromImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAUCAYAAAC9BQwsAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNAay06AAAAAUdEVYdENyZWF0aW9uIFRpbWUAOC83LzEwvsEqxgAAAe9JREFUOI2N081qE1EUB/Bz7teY3GEGRwYSELsQbBkLboTZFGaW4tZko4us8hozD+ADaBKMD2AK2eQBwmySbLIxCW6sIKEgQqMQQ9o6x02nTNU0OXC5m/O7By7/A57nca21JiKaz+c1y7IKnufxKIoQbivHcQwpZZmuajgcVkzTLG7FlmUVOOcPiYh83yciSnfCpmkWOef7REQAsDu+ggcZ3Bn/D+6EN8FNOI5j3ApvxdvgJrwTzOPxePzCtu07eZjmm/LNfx/DMO7+A33fp9ls9jHDrVbrS6/X+4CIrxDxGWPsiVLq3g2YTeh2u8fNZvMkP5UxdsQ5P5BSlrXWOp+clIhSRHyJiNXsIQCgdrv9aTKZvFZKudkSMMYYAcAFAABj7DkifkbEr0mSvK/X6ycAAI1G45Hruk+JCLXWl9VqNc22o8QYe8w535dSloUQDxhjR/mpRJQKIe47jmPEcYysVCpdGobxU0p5qpQ6LRaLZ0KIH4j4PUmSd4PBgIiIRqPRWwC4jpyoVCppp9NZL5fLc601ua5L0+k0XSwWZ2EYviGiYwAgRPwmhFgZhpHeCHsW4CiKMAgCZllWQSnlCiH2hBB72ccEQcAAAHgG+/3+9V2r1WC9Xv9erVbniPhLKbW0bXt1eHh4EYYh9ft9+ANDWHBBjehDcAAAAABJRU5ErkJggg==');

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
			let cursor = new Cursor(c.id, c.position.x, c.position.y, texture);
			add(cursor);
		});

		socket.on('user_exits', function(c){
			kill(cursors[c.id]);
		});

		socket.on('user_moves', function(c){
			let cursor = cursors[c.id] || add(new Cursor(c.id, c.position.x, c.position.y, texture));;
			cursor.updatePosition(c.position);
		});

		socket.on('mouseenter', function(index){
			let elem = elements[index];
			// elem.setAttribute('data-cursorID', data.cursor);
			elem.classList.add('hover');
		});

		socket.on('mouseleave', function(index){
			let elem = elements[index];
			// elem.removeAttribute('data-cursorID', data.cursor);
			elem.classList.remove('hover');
		});

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

			let cursor = new Cursor(id, x, y, texture);
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