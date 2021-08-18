// @ts-check
const gulp = require("gulp");
const { buildProject, watchProject, cleanProject } = require("./scripts/build");

gulp.task("clean", () => cleanProject("tsconfig.json"));
gulp.task("build", () => buildProject("tsconfig.json"));
gulp.task("watch", () => watchProject("tsconfig.json"));
gulp.task("default", gulp.task("build"));