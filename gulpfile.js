"use strict";

var      gulp = require('gulp'),
       concat = require('gulp-concat'),
       uglify = require('gulp-uglify'),
     cleanCSS = require('gulp-clean-css'),
       rename = require('gulp-rename'),
          del = require('del'),
 autoprefixer = require('gulp-autoprefixer'),
        babel = require('gulp-babel');


gulp.task("combineScripts", function() {
  return gulp.src(["js/graphmaker.js","js/app.js"])
    .pipe(concat("scripts.js"))
    .pipe(gulp.dest('js'))
    .pipe(uglify())
    .pipe(rename("scripts.min.js"))
    .pipe(gulp.dest('js'));
});

gulp.task('minifyCSS', function() {
  return gulp.src('css/style.css')
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('css'));
});

gulp.task('watchFiles', function() {
    gulp.watch('css/style.css', ['minifyCSS']);
    gulp.watch('js/app.js', ['combineScripts']);
    gulp.watch('js/graphmaker.js', ['combineScripts']);
})

gulp.task('watch', ['watchFiles']);

gulp.task("default", ['watchFiles']);
