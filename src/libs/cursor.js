function Cursor(_id, _x, _y, texture){
	const id = _id;
	let x = _x || -100;
	let y = _y || -100;


	let sprite = new PIXI.Sprite(texture);
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
		sprite.position.x = x;
		sprite.position.y = y;

	let hitbox = new window.Matter.Bodies.circle(x, y, 5, {
		friction: 0.1,
		mass: 100,
		isStatic: true
	});



	// -------------------------------------------------------------------------

	function updateSprite(){
		this.sprite.position = this.hitbox.position;
	}

	function updatePosition(position){
		window.Matter.Body.setPosition(hitbox, {
			x: position.x,
			y: position.y
		});
	}

	function kill(){
		window.Matter.Body.setStatic(hitbox, false);
	}

	return {
		id,
		sprite,
		hitbox,
		updateSprite,
		updatePosition,
		kill
	};
}

export default Cursor;