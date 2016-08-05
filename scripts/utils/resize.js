const async = require('async');
const fs = require('fs-extra');
const im = require('imagemagick');
const maxworkers = require('os').cpus().length;
const path = require('path');
const sh = require('./Shell');


module.exports = resize;

function resize(params) {
	let queue = async.queue(resizeimg, maxworkers);

	queue.push({
		input: params.input,
		output: params.output,
		width: params.width,
		height: params.height,
		quality: params.quality || 0.8,
		deleteAfterResize: params.deleteAfterResize
	});
}

function resizeimg(params, cb){
	fs.ensureDir(path.dirname(params.output), function(err){
		if(err){
			console.log(err);
		}else{
			im.resize({
				srcPath: params.input,
				dstPath: params.output,
				width:   params.width,
				quality: params.quality
			}, function(err, stdout, stderr){
				if(err) sh.error(stderr);
				else if(params.deleteAfterResize){
					fs.unlinkSync(params.input);
					sh.error(params.input);
				}
				else sh.success(params.output);
			});
		}
	});
}