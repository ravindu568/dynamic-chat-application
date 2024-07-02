import gulp from 'gulp';

import './test';
import './watch';

gulp.task('tdd', gulp.series('test', 'watch'));
