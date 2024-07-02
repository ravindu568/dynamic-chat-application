import path from 'path';

function join(...args) {
  let len = args.length;
  let glob = args[len - 1];

  if (!Array.isArray(glob)) {
    glob = [glob];
  }

  args.pop();

  return glob.map(str => path.join(...args, str));
}

export const srcDir = 'src';
export const testDir = 'test';
export const buildDir = 'build';

export const apps = ['stat-again'];
export const bundleGlob = 'bundle.js';
export const testBundleGlob = 'test_bundle.js';

export const srcGlob = join(srcDir, ['**/*.js', '**/*.jsx']);
export const testGlob = join(testDir, ['**/*.test.js', '**/*.test.jsx']);

export const srcBuildGlob = join(buildDir, srcGlob);
export const testBuildGlob = join(buildDir, testGlob);

export const allSrcGlob = srcGlob.concat(testGlob);
export const allBuildGlob = srcBuildGlob.concat(testBuildGlob);

export const bundleRootGlob = join(buildDir, srcDir, 'index.js');
export const testBundleRootGlob = join(buildDir, testDir, 'stat-again.test.js');
export const bundleBuildGlob = join(buildDir, bundleGlob);
export const testBundleBuildGlob = join(buildDir, testBundleGlob);
