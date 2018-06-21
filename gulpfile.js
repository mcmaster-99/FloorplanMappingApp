var gulp = require('gulp');
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	connect = require('gulp-connect');

var jsSource = ['js/*.js'],
	sassSource = ['scss/*.scss'],
	htmlSource = ['*.html'],
	cssOutput = "css",
	output = 'assets';


gulp.task('copy', function(){
	gulp.src('index.html')
	.pipe(gulp.dest(output))
});

gulp.task('log', function(){
	gutil.log('== My Log Task ==')
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
	.pipe(uglify())
	.on('error', (err) => { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
	.pipe(concat('script.js'))
	.pipe(gulp.dest(output))
	.pipe(connect.reload())
});

gulp.task('watch', function(){
	gulp.watch(jsSource, ['js']);
	gulp.watch(sassSource, ['sass']);
	gulp.watch(htmlSource, ['html']);
});

gulp.task('connect', function() {
	connect.server({
		root: '.',
		livereload: true
	});
});

gulp.task('html', function(){
	gulp.src(htmlSource)
	.pipe(connect.reload())
});

gulp.task('default', ['js', 'sass', 'connect', 'watch', 'html']);