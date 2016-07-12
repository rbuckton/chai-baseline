var gulp = require("gulp")
  , tsb = require("gulp-tsb")
  , del = require("del");

var project = tsb.create("src/tsconfig.json");
gulp.task("clean", cb => del(["out"], cb));
gulp.task("build", () => gulp.src("src/**/*.ts", { base: "src" })
    .pipe(project())
    .pipe(gulp.dest("out")));
gulp.task("watch", ["build"], () => gulp.watch(["src/**/*.ts"], ["build"]));
gulp.task("default", ["build"]);