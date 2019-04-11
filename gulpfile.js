var gulp = require('gulp');
	babel = require('gulp-babel'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	babel = require('gulp-babel'),
	uglify = require('gulp-terser'),
	browserify = require('browserify'),
	webpack = require('webpack-stream'),
	babelify = require('babelify'),
	babelregister = require('babel-core'),
	concat = require('gulp-concat'),
	connect = require('gulp-connect');

var jsSource = ['js/*.js'],
	jsxSource = ['js/*.jsx'],
	sassSource = ['scss/*.scss'],
	htmlSource = ['*.html'],
	cssOutput = "css",
	output = "js";

/*gulp.task('copy', function(){
	gulp.src('index.html')
	.pipe(gulp.dest(output))
});

gulp.task('log', function(){
	gutil.log('== My Log Task ==')
});*/

gulp.task('html', function(){
	gulp.src(htmlSource)
	.pipe(connect.reload())
});

gulp.task('sass', function(){
	gulp.src(sassSource)
	.pipe(sass({style: 'expanded'}))
		.on('error', gutil.log)
	.pipe(gulp.dest(cssOutput))
	.pipe(connect.reload())
});

gulp.task('js', function(){
	gulp.src(jsSource)
	.pipe(connect.reload());
});

gulp.task('watch', function(){
	gulp.watch(jsSource, ['js']);
	gulp.watch(sassSource, ['sass']);
	gulp.watch(htmlSource, ['html']);
});

gulp.task('connect', function() {
	connect.server({
		port:'8000',
		root: '.',
		livereload: true
	});
});

gulp.task('default', ['js', 'sass', 'connect', 'watch', 'html']);