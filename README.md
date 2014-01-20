# [gulp](https://github.com/wearefractal/gulp)-packagejson

> Create a npm-compatible package.json from various project metadata


## Install

Install with [npm](https://npmjs.org/package/gulp-packagejson)

```
npm install --save-dev gulp-packagejson
```


## Example

```js
var gulp = require('gulp');
var packagejson = require('gulp-packagejson');

gulp.task('default', function () {
	gulp.src('.')
		.pipe(packagejson())
		.pipe(gulp.dest('.'));
});
```


## API

### packagejson(options)

Options has the following options:

None right now, but there may be options to enable/disable features like git, yaml, and other sources.


## License

Unlicense (Public Domain)
