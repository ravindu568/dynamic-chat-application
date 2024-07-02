import gulp from 'gulp';
import mocha from 'gulp-mocha';

import {testBuildGlob} from './globs';
import './build';

export const test = () => {
  return gulp.src(testBuildGlob)
    .pipe(mocha());
};

gulp.task('test', gulp.series('build', test));
