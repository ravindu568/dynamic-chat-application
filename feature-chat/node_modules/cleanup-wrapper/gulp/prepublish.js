import gulp from 'gulp';

import './test';
import './clean';
import './dist';

gulp.task('prepublish', gulp.series('test', 'distclean', 'dist'));
