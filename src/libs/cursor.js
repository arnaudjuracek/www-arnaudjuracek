function Cursor(_id, _x, _y, _textures){
	const id = _id;
	const textures = _textures;
	let x = _x || -100;
	let y = _y || -100;

	let sprite = new PIXI.Sprite(textures.default);
	let isHover = false;

	let hitbox = new window.Matter.Bodies.circle(x, y, 100, {
		density: 1,
		friction: 0,
		frictionStatic: 0.5,
		frictionAir: 0.03,
		restitution: 1,
		mass: 100,
		isStatic: true
	});



	// -------------------------------------------------------------------------

	function setHover(_isHover){
		this.isHover = _isHover;
		if(_isHover===true) this.sprite.texture = this.textures.pointer;
		else this.sprite.texture = this.textures.default;
	}

	function updateSprite(){
		this.sprite.position.x = Math.floor(this.hitbox.position.x);
		this.sprite.position.y = Math.floor(this.hitbox.position.y);
	}

	function updatePosition(_x, _y){
		window.Matter.Body.setPosition(hitbox, {
			x: _x,
			y: _y
		});
	}

	function kill(){
    window.Matter.Body.scale(hitbox, 0.1, 0.1);
		window.Matter.Body.setStatic(hitbox, false);
	}

	function isDead(){
		return (!this.hitbox.isStatic);
	}

	return {
		id,
		sprite,
		hitbox,
		isHover,
		textures,
		setHover,
		updateSprite,
		updatePosition,
		kill,
		isDead
	};
}

export default Cursor;