var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

// Development Tasks 
// -----------------

// Start browserSync server
gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: 'dist'
    }
  })
})

gulp.task('sass', function () {
  return gulp.src('app/sass/main.scss') // Gets main.scss in app/scss
    .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
    .pipe(gulp.dest('dist/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})

// Watchers
gulp.task('watch', function () {
  gulp.watch('app/sass/**/*.scss', ['sass']);
  gulp.watch('app/*.html', ['useref']);
  gulp.watch('app/js/**/*.js', browserSync.reload);
})

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function () {

  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
});

// Optimizing Images 
gulp.task('images', function () {
  return gulp.src('app/images/**/*.+(ico|png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('css', function () {
  return gulp.src('app/css/*')
    .pipe(gulp.dest('dist/css'))
});

gulp.task('scripts', function () {
  return gulp.src('app/js/*')
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist/js'))
});

// Cleaning 
gulp.task('clean', function () {
  return del.sync('dist').then(function (cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function () {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

gulp.task('clean:html', function () {
  return del.sync('dist/*.html');
});

// Build Sequences
// ---------------

gulp.task('default', function (callback) {
  runSequence('clean:dist', ['css', 'sass', 'scripts', 'images', 'useref', 'browserSync', 'watch'],
    callback
  )
})

gulp.task('build', function (callback) {
  runSequence(
    'clean:dist', ['css',
      'sass',
      'scripts',
      'images',
      'useref'
    ],
    callback
  )
})