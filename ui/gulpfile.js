var gulp = require("gulp");
var reveasy = require("gulp-rev-easy");
const sass = require("gulp-sass");
const watchSass = require("gulp-watch-sass");

gulp.task("reveasy", function (argument) {
    gulp.src("index.html")
      .pipe(reveasy({
        base: 'C:\\Users\\MyName\\Documents\\GitHub\\urlSite\\Design\\DiagnosticDashboard\\urlSiteApp-Angular',
        revMode:'dom',
  			hashLength:7,
  			revType:'hash',
  			suffix:'v',
  			fileTypes:['css', 'js']
      }))
      .pipe(gulp.dest("./"))
});

gulp.task('sass', function(){
  return gulp.src('./sass/urlSite.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest('./css'))
});

gulp.task("sass:watch", () => watchSass([
  "./sass/**/*.{scss,css}"
])
  .pipe(sass())
  .pipe(gulp.dest("./css")));
