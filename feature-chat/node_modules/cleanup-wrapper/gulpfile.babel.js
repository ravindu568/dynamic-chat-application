import gulp from 'gulp';
import {usePlumbedGulpSrc} from 'plumb-gulp';
import autoreload from 'autoreload-gulp';

import './gulp/tdd';
import './gulp/prepublish';

usePlumbedGulpSrc();

gulp.task('default', autoreload('tdd'));
