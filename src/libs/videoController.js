function videoController(videoSelector, contollersSelector){

	let videos;

	function init(){
		videos = document.querySelectorAll(videoSelector);
		for(let i=0, l=videos.length; i<l; i++){
			let video = videos[i];
			let controls = video.querySelector(contollersSelector);
			let player = video.querySelector('video');

			player.controls = false;
			controls.style.display = '';

			bindControls(player, controls);
		}
	}

	init();



	// -------------------------------------------------------------------------

	function bindControls(player, controls){
		let duration = player.duration;
		let progress = controls.querySelector('#progress');
		let loaded = controls.querySelector('#loaded');

		controls.addEventListener('click', function(){
			if(player.paused || player.ended){
				player.play();
				controls.classList.add('playing');
			}else{
				player.pause();
				controls.classList.remove('playing');
			}
		});

		player.addEventListener('ended', function(){
			player.pause();
			controls.classList.remove('playing');
		 	player.load(); // reshow poster
		});

		player.addEventListener('timeupdate', function(){
			let time = player.currentTime;
			let buffered = player.buffered.end(0)

			progress.style.width = time * (100/player.duration) + "%";
			loaded.style.width = buffered * (100/player.duration) + "%";
		}, false);
	}


	// -------------------------------------------------------------------------

	function revalidate(){
		videos = [];
		init();
	}

	return {
		revalidate
	};
}

export default videoController;