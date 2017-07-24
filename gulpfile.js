var gulp = require("gulp");
var concat = require("gulp-concat");
var sourcemaps = require("gulp-sourcemaps");
var watch = require("gulp-watch");
var rename = require("gulp-rename");
var fs = require("node-fs-extra");
var pug = require("gulp-pug");
require("high");

var sourceFiles = function(folder) {
  var scan = function(file) {
    var fileList = fs.readdirSync(file);
    return fileList.map(function(child) {
      var stat = fs.statSync(file + "/" + child);
      if (stat.isFile()) {
        return file + "/" + child;
      } else if (stat.isDirectory()) {
        return scan(file + "/" + child);
      }
    });
  };

  var srcs = scan(folder).flatten().sort();
  
  srcs.erase("./src/main.js");
  srcs.unshift("./src/main.js");

  return srcs;
};

gulp.task("default", ["pug", "lib", "concat", "watch"]);

gulp.task("concat", function() {
  gulp.src(sourceFiles("./src"))
    .pipe(sourcemaps.init())
    .pipe(concat("passion.js"))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./build"));
});

// gulp.task("uglify", function() {
//   gulp.src("./build/passion.js")
//     .pipe(uglify())
//     .pipe(rename({
//       extname: ".min.js"
//     }))
//     .pipe(gulp.dest("./build"));
// });

gulp.task("lib", function() {
  fs.copy("./phigl/build/phigl.js", "./lib/phigl.js");
});

gulp.task("watch", function() {
  var srcs = sourceFiles("./src").concat(["./attack-src/*", "./motion-src/*"]);
  gulp.watch(srcs, ["concat", "pug"]);
});

gulp.task("pug", function() {
  gulp.src("./attack-src/*.pug")
    .pipe(pug())
    .pipe(rename({
      extname: ".xml"
    }))
    .pipe(gulp.dest("./asset/attack"));
  gulp.src("./motion-src/*.pug")
    .pipe(pug())
    .pipe(rename({
      extname: ".xml"
    }))
    .pipe(gulp.dest("./asset/motion"));
});
