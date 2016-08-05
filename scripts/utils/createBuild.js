const fs                = require('fs-extra');
const path              = require('path');
const webpack           = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const mu                = require('mu2');
const createConfig      = require('./createConfig');
const sh                = require('./Shell');
const walk              = require('fs-walk');
const resize            = require('./resize.js');

function createBuild(options = {}) {

  const config        = createConfig(options);
  const pagesPath     = path.join(config.options.paths.src, 'pages.config.js');
  const pagesConfig   = require(pagesPath);
  const muDefaultRoot = './';
  let hash, compiler, output;

  const buildMustache = () => {
	return new Promise((resolve, reject) => {
	  const compilerData = {
		hash: hash,
		isProduction: true
	  };
	  for (const k in pagesConfig.pages) {
		const page = pagesConfig.pages[k];
		let filename = path.join(output,k);
		fs.ensureDir(path.dirname(filename), function (err) {
			const fileStream = fs.createWriteStream(filename);
			const templateStream = mu.compileAndRender(page.template,
			Object.assign({compiler: compilerData}, page.data));
			templateStream.pipe(fileStream);
			templateStream.on('error', (e) => reject(e));
			fileStream.on('finish', () => resolve());
		});
	  }
	});
  }

  const resizeImages = () => {
	return new Promise((resolve, reject) => {
		const imageDirectory = path.join(output, 'assets/projects/');
		const sizes = {
			large: 1600,
			// medium: 1280,
			// small: 640
		}

		walk.filesSync(imageDirectory, function(basedir, filename, stat, next){
			if((/\.(gif|jp?g|tiff|png)$/i).test(filename)){
				let file = path.join(basedir, filename);

  				for(let dirname in sizes){
					let output = path.join(basedir, dirname, filename);
					let size = sizes[dirname];
					resize({
				      	input: file,
				      	output: output,
				      	width: size
				    });
				}

				// low-fi image for lazyloading
				resize({
					input: file,
					output: path.join(basedir, 'low', filename),
					width: 44,
					quality: 0.1,
					deleteAfterResize: true
				});
  			}
		});

	});
  }

  const run = () => {
	return new Promise((resolve, reject) => {
	  mu.root = (pagesConfig.options && pagesConfig.options.cwd)
		? pagesConfig.options.cwd : muDefaultRoot;
	  compiler = webpack(config.webpackConfig);
	  compiler.apply(new ProgressBarPlugin());
	  compiler.run((err, stats) => {
		if (!err) {
		  hash = stats.hash;
		  output = stats.compilation.outputOptions.path;
		  sh.info('Start building mustache templates...');
		  buildMustache()
		    .then(() => {
		      resolve()
		      sh.success('Build completed\n');
		    })
		    .catch((e) => {
		      reject(e)
		      sh.error('Build failed\n');
		    });

		  sh.info('Start resizing images in projects/...');
		  resizeImages()
			.then(() => {
			  resolve()
			  sh.success('Images successfully resized\n');
			})
			.catch((e) => {
			  reject(e)
			  sh.error('Failed to resize images\n');
			});
		} else {
		  reject(err);
		}
	  });
	});
  }

  return { run };

}

module.exports = createBuild;
