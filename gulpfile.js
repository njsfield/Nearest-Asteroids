"use strict";

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  cleanCSS = require('gulp-clean-css'),
  rename = require('gulp-rename'),
     del = require('del'),
 autoprefixer = require('gulp-autoprefixer');


gulp.task("minifyScripts", function() {
  return gulp.src("js/index.js")
    .pipe(uglify())
    .pipe(rename('index.min.js'))
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
    gulp.watch('js/index.js', ['minifyScripts']);
})

gulp.task('watch', ['watchFiles']);

gulp.task("default", ['watchFiles']);
