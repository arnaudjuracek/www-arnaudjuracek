function Cursor(x, y, texture){

	let sprite = new PIXI.Sprite(texture);
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
		sprite.position.x = x;
		sprite.position.y = y;


	let hitbox = new window.Matter.Bodies.circle(x, y, 5, {
		friction: 0.1,
		mass: 100
	});


	function updateSprite(){
		this.sprite.position = this.hitbox.position;
	}

	return {sprite, hitbox, updateSprite};
}

export default Cursor;