var gulp = require('gulp')
var babel = require('gulp-babel')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var del = require('del')
 
var paths = {
  scripts: {
    src: 'lib/index.js',
    dest: 'dist/',
  }
}

const clean = () => del([ 'dist' ])

function scripts() {
  return gulp.src(paths.scripts.src, { sourcemaps: false })
    .pipe(babel({
      plugins: [
        '@babel/plugin-proposal-optional-chaining',
      ]
    }))
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.basename = "wx-formidable.min"
    }))
    .pipe(gulp.dest(paths.scripts.dest))
}
 
function watch() {
  gulp.watch(paths.scripts.src, scripts)
}

var build = gulp.series(clean, gulp.parallel(scripts))

exports.clean = clean
exports.scripts = scripts
exports.watch = watch
exports.build = build

exports.default = build