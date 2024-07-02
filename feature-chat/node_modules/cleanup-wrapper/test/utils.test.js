import gulp from 'gulp';
import path from 'path';
import {expect} from 'chai';
import {tmpDir, chDir, overrideMethod} from '../src/cleanup-wrapper';
import {expectEventuallyDeleted} from 'stat-again';

describe('Testing tmpDir wrapper', function () {
  before(function () {
    this.dirty = function (dir = 'tmp_utils') {
      return new Promise((resolve, reject) => {
        gulp.src('.babelrc').pipe(gulp.dest(dir))
          .on('end', resolve)
          .on('error', reject);
      });
    };
    this.clean = tmpDir('tmp_utils', this.dirty);
  });

  it(`tmpDir wrapper cleans up dir`, function () {
    return this.clean().then(() => {
      return expectEventuallyDeleted('tmp_utils', 50, 10);
    });
  });

  it(`tmpDir wrapper cleans up [...dirs]`, function () {
    const dirs = ['tmp_utils1', 'tmp_utils2'];
    return tmpDir(dirs, () => Promise.all(
      dirs.map(dir => this.dirty.bind(this, dir))
    ))().then(() => {
      return Promise.all(dirs.map(dir => expectEventuallyDeleted(dir, 50, 10)));
    });
  });

  it(`If dir already exists, tmpDir wrapper throws an error`,
    tmpDir('tmp_utils', function () {
      return this.dirty().then(this.clean)
        .catch(err => {
          expect(err).to.match(
            /Error: Dir '.*' already exists/);
        });
    }));
});

describe('Testing chDir wrapper', function () {
  before(function () {
    this.cwd = process.cwd();
    this.chdir = path.join(this.cwd, 'src');
    this.tmpdir = path.join(this.cwd, 'test');

    this.dirty = function (chdir) {
      expect(process.cwd()).to.equal(this.chdir);
      process.chdir(chdir);
      expect(process.cwd()).to.equal(this.tmpdir);
    };
    this.clean = chDir(this.chdir, this.dirty);
  });

  it(`chDir wrapper restores cwd after running`, function () {
    expect(process.cwd()).to.equal(this.cwd);
    expect(this.clean.bind(this, this.tmpdir)).not.to.throw();
    expect(process.cwd()).to.equal(this.cwd);
    expect(this.dirty.bind(this, this.tmpdir)).to.throw();
    expect(process.cwd()).to.equal(this.cwd);
    process.chdir(this.chdir);
    expect(this.dirty.bind(this, this.tmpdir)).not.to.throw();
    expect(process.cwd()).to.equal(this.tmpdir);
    expect(this.clean.bind(this, this.tmpdir)).not.to.throw();
    expect(process.cwd()).to.equal(this.cwd);
  });
});

describe('Testing overrideMethod wrapper', function () {
  before(function () {
    this.object = {
      _name: 'original',
      name () {
        return this._name;
      },
    };

    this.dirty = function (object) {
      expect(object.name()).to.equal('overridden');
    };
    this.clean = overrideMethod(this.object, 'name', function () {
      return 'overridden';
    }, this.dirty);
  });

  it(`overrideMethod wrapper restores object after running`, function () {
    expect(this.dirty.bind(undefined, this.object)).to.throw(Error,
      /expected 'original' to equal 'overridden'/);
    expect(this.clean.bind(undefined, this.object)).not.to.throw();
    expect(this.object.name()).to.equal('original');
  });
});
