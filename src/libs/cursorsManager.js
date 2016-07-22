import PIXI from 'libs/pixi.js';
import Matter from 'matter-js'; window.Matter = Matter;
import io from 'socket.io-client';
import Cursor from 'libs/cursor.js';


function cursorsManager(_opts){
	const opts = _opts;
	const
		Engine = window.Matter.Engine,
		World = window.Matter.World,
		Bodies = window.Matter.Bodies,
		Events = window.Matter.Events;

	let stage, engine, renderer, texture;
	let cursors = [];



	// -------------------------------------------------------------------------

	(function initEngine(){
		engine = Engine.create();
		engine.world.gravity.x = 0;
		engine.world.gravity.y = 0;

		let w = window.innerWidth;
		let h = window.innerHeight;
		let offset = 50;
		World.add(engine.world, [
  			Bodies.rectangle(w*.5, -offset, w + 2 * offset, 100, { isStatic: true }),
  			Bodies.rectangle(w*.5, h + offset, w + 2 * offset, 100, { isStatic: true }),
  			Bodies.rectangle(w + offset, h*.5, 100, h + 2 * offset, { isStatic: true }),
  			Bodies.rectangle(-offset, h*.5, 100, h + 2 * offset, { isStatic: true })
		]);

		Engine.run(engine);
	})();


	(function initRenderer(){
	 	renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight ,{backgroundColor : 0xffffff});
		stage = new PIXI.Container();
		texture = PIXI.Texture.fromImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAUCAYAAAC9BQwsAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNAay06AAAAAUdEVYdENyZWF0aW9uIFRpbWUAOC83LzEwvsEqxgAAAe9JREFUOI2N081qE1EUB/Bz7teY3GEGRwYSELsQbBkLboTZFGaW4tZko4us8hozD+ADaBKMD2AK2eQBwmySbLIxCW6sIKEgQqMQQ9o6x02nTNU0OXC5m/O7By7/A57nca21JiKaz+c1y7IKnufxKIoQbivHcQwpZZmuajgcVkzTLG7FlmUVOOcPiYh83yciSnfCpmkWOef7REQAsDu+ggcZ3Bn/D+6EN8FNOI5j3ApvxdvgJrwTzOPxePzCtu07eZjmm/LNfx/DMO7+A33fp9ls9jHDrVbrS6/X+4CIrxDxGWPsiVLq3g2YTeh2u8fNZvMkP5UxdsQ5P5BSlrXWOp+clIhSRHyJiNXsIQCgdrv9aTKZvFZKudkSMMYYAcAFAABj7DkifkbEr0mSvK/X6ycAAI1G45Hruk+JCLXWl9VqNc22o8QYe8w535dSloUQDxhjR/mpRJQKIe47jmPEcYysVCpdGobxU0p5qpQ6LRaLZ0KIH4j4PUmSd4PBgIiIRqPRWwC4jpyoVCppp9NZL5fLc601ua5L0+k0XSwWZ2EYviGiYwAgRPwmhFgZhpHeCHsW4CiKMAgCZllWQSnlCiH2hBB72ccEQcAAAHgG+/3+9V2r1WC9Xv9erVbniPhLKbW0bXt1eHh4EYYh9ft9+ANDWHBBjehDcAAAAABJRU5ErkJggg==');

		document.body.appendChild(renderer.view);
	})();


	(function initPhysics(){
		if(opts.collid){
			let cursor = Bodies.circle(0, 0, 50, { isStatic : true });
			World.add(engine.world, cursor);

			window.addEventListener('mousemove', function(e){
				Matter.Body.setPosition(cursor, {x : e.pageX, y : e.pageY});
			});
		}

		// window.addEventListener('click', function(e){
		// 	// var newcursor = Bodies.circle(e.pageX, e.pageY, 10);
		// 	// bodies.push(newcursor);
		// 	// bunnies.push(createBunny());
		// 	var newcursor = createBunny(e.pageX, e.pageY);
		// 	bunnies.push(newcursor);
		// 	newcursor.body.isSleeping = true;
		// 	World.add(engine.world, newcursor.body);
		// });
	})();


	(function updateRenderer() {
		requestAnimationFrame(updateRenderer);

		for(var c in cursors) cursors[c].updateSprite();
		renderer.render(stage);
	})();



	// -------------------------------------------------------------------------

	function add(cursor){
		cursors.push(cursor);
		stage.addChild(cursor.sprite);
		World.add(engine.world, cursor.hitbox);
	}

	function populate(n){
		for(let i=0; i<n; i++){
			let x = Math.random() * window.innerWidth;
			let y = Math.random() * window.innerHeight;
			add(new Cursor(x, y, texture));
		}
	};



	return {add, populate};
}

export default cursorsManager;