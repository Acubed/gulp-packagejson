var gulp = require('gulp');
var packagejson = require('./index');

gulp.task('default', function () {
	gulp.src('./index.js').pipe(packagejson({name:'gulp-packagejson'})).pipe(gulp.dest(''));
});
