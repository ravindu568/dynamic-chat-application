import gulp from 'gulp';
import del from 'del';

import {buildDir, distDir} from './globs';

export const clean = () => {
  return del([buildDir]);
};

export const distClean = () => {
  return del([buildDir, distDir]);
};

gulp.task('clean', clean);
gulp.task('distclean', distClean);
