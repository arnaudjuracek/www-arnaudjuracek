function Views(_opts){
	const opts = Object.assign({
		linkSelector: 'a.views',
		sectionID: '#view'
	}, _opts);

	let links;
	let page = document.querySelector(opts.sectionID);



	// -------------------------------------------------------------------------

	(function bindLinks(){
		links = document.querySelectorAll(opts.linkSelector);
		for(let i=0, l=links.length; i<l; i++){
			let link = links[i];
			link.addEventListener('click', function(e){
				let pageID = link.getAttribute('data-page');
				if(pageID) loadView(pageID);

				e.preventDefault();
			});
		}
	})();


	function loadView(url){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onload = function() {
  			if (request.status >= 200 && request.status < 400) {
    			var resp = request.responseText;
    			page.innerHTML = resp;
  			}
		};
		request.send();
	}



	// -------------------------------------------------------------------------

	return {
		links,
		loadView
	};

}

export default Views;