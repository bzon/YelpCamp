'use strict';

var gulp = require('gulp'),
    sonar = require('gulp-sonar'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    build = require('ci-build-helper'),
    gulpsync = require('gulp-sync')(gulp),
    shell = require('gulp-shell'),
    gutil = require('gulp-util');

gulp.task('sonarqube', function () {
    var options = {}
    build.sonar.jdbc.url = "jdbc:mysql://sonar-mysql:3306/sonar";
    options.sonar = build.sonar;
    return gulp.src('.')
        .pipe(sonar(options));
});