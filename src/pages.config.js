const async = require('async');
const fs = require('fs');
const yaml = require('js-yaml');



// -------------------------------------------------------------------------

const options = {
	'root': `${__dirname}/`,
	'cwd': `${__dirname}/templates`
}


let pages = {
	'index.html': {
		template: 'index.mustache',
		data: {
			links: [],
			meta: {
				title: 'Arnaud Juracek',
				description: 'portfolio',
				pageID: 'home'
			}
		}
	}
};


// -------------------------------------------------------------------------

(function getViews(dirname){
	let filenames = fs.readdirSync(dirname);
	let links = [];

	(function assignPages(){
		for(let i=0, l=filenames.length; i<l; i++){

			let filename = filenames[i];
			if(filename.indexOf('.txt') > -1){
				let basename = filename.split('.txt').shift();
				try{

					let file = fs.readFileSync(dirname + filename, 'utf8');
					let view = yaml.safeLoad(file);

					let page = makePage(view);
					pages['views/' + basename + '.html'] = page.view;
					pages[basename + '.html'] = page.full;

					let link = makeLink(basename, page.view);
					if(link) links.push(link);

				}catch(e){
					console.log(e);
				}
			}
		}
	})();

	(function sortLinksbyDate(){
		links.sort(function(a, b){
			var a = a.date.timestamp,
				b = b.date.timestamp;
			if(a > b) return -1;
			if(a < b) return 1;
			return 0;
		});
	})();

	(function assignLinks(){
		for(let id in pages){
			pages[id].data.links = links;
		}
	})();

	function makePage(view){
		let page = {
			template: view.template + ".mustache",
			data: {
				meta: {
					title: 'Arnaud Juracek',
					description: 'portfolio',
					pageID: view.template
				},
				view : {}
			}
		};

		(function assignYAMLKeys(){
			for(let key in view){
				let value = view[key];
				if(Array.isArray(value)){
					let o = [];
					for(let k in value) o.push({value: value[k]});
					value = o;
				}
				page.data.view[key] = value;
			}
		})();

		(function parseDate(){
			if(page.data.view.date){
				let date = new Date(page.data.view.date);
				page.data.view.date = {
					timestamp: date.getTime(),
					year: date.getFullYear(),
					month: date.getMonth(),
					day: date.getDate()
				};
			}
		})();

		return {
			view: clone(page),
			full: Object.assign(page, {template: 'index.mustache'})
		};
	}

	function makeLink(basename, page){
		if(page.data.view.title){
			return {
					id: '/views/' + basename + '.html',
					href: '/' + basename + '.html',
					date: page.data.view.date,
					title: page.data.view.title
				};
		}else return null;
	}

})(options.root + 'views/');


function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}

// -------------------------------------------------------------------------


// console.log(pages);
module.exports = { options, pages };