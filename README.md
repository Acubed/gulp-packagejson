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
		.pipe(packagejson({name:'project-npm-name'}))
		.pipe(gulp.dest('.'));
});
```


## API

### packagejson(options)

Options has the following options:

* name: the npm name of your package


## License

Unlicense (Public Domain)
