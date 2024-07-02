import gulp from 'gulp';
import eslint from 'gulp-eslint';

import {allSrcGlob} from './globs';

export const lint = () => {
  return gulp.src(allSrcGlob)
    .pipe(eslint())
    .pipe(eslint.format());
};

gulp.task('lint', lint);
