'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var pkgtool = require('./pkgtool');

module.exports = function (options) {

	return through.obj(function (file, enc, cb) {
		var self = this;

		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-packagejson', 'Streaming not supported'));
			return cb();
		}
		
		pkgtool.parseDir(file.cwd, options, function(err, packageObject){
			//if(options.name) packageObject.name = options.name;
			var out = new gutil.File({
            cwd: file.cwd,
            base: file.cwd,
            path: path.join(file.cwd, 'package.json'),
            contents: Buffer(JSON.stringify(packageObject,null,"\t")+"\n")
		    });
			self.push(out);
			cb();
		});
	});
};
