import gulp from 'gulp';

import './test';
import './clean';
import './dist';
import './lint';

gulp.task('prepublish', gulp.series('test', 'lint', 'clean', 'dist'));
