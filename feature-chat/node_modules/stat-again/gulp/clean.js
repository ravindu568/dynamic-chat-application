import gulp from 'gulp';
import del from 'del';

import {buildDir} from './globs';

export const clean = () => {
  return del(buildDir);
};

gulp.task('clean', clean);
