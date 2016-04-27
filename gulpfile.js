var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var concatCss = require('gulp-concat-css');
var concatJs = require('gulp-concat');
var uglify = require('gulp-uglify');
var prefix = require('gulp-autoprefixer');

gulp.task('all_scripts', ['scripts', 'scripts_admin']);
gulp.task('all_styles', ['styles', 'styles_admin']);

gulp.task('styles', function() {
  gulp.src([
    './bower_components/normalize-css/normalize.css',
    './assets/stylesheets/main.scss'
  ])
    .pipe(sass())
    .pipe(concatCss('main.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('./public/assets/stylesheets'));
});

gulp.task('styles_admin', function() {
  gulp.src([
    './bower_components/normalize-css/normalize.css',
    './bower_components/purecss/src/**/css/*.css',
    './assets/stylesheets/admin.scss'
  ])
    .pipe(sass())
    .pipe(prefix())
    .pipe(concatCss('admin.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('./public/assets/stylesheets'));
});

gulp.task('scripts', function() {
  gulp.src([
    '!./assets/javascript/admin/**/*.js',
    './assets/javascript/**/*.js'
  ])
    .pipe(concatJs('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/javascript'));
});

gulp.task('scripts_admin', function() {
  gulp.src([
    './bower_components/jquery/dist/jquery.js',
    './bower_components/moment/moment.js',
    './bower_components/marked/lib/marked.js',
    './bower_components/handlebars/handlebars.js',
    './bower_components/ember/ember.js',
    './bower_components/ember-data/ember-data.js',
    './assets/javascript/admin/vendor/editor.js',
    './assets/javascript/admin/app.js'
  ])
    .pipe(concatJs('admin.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/javascript'));
});
