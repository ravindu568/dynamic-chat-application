import gulp from 'gulp';
import babel from 'gulp-babel';
import rename from 'gulp-rename';

import {srcGlob} from './globs';

export const dist = () => {
  return gulp.src(srcGlob)
    .pipe(babel())
    .pipe(rename('index.js'))
    .pipe(gulp.dest('.'));
};

gulp.task('dist', dist);
