const gulp = require('gulp');
const gutil = require('gulp-util');
const rollup = require('rollup').rollup;
const gulpRollup = require('gulp-rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const paths = {
  src: './src/**/*.js',
  test: './test/**/*.js',
  testFixtures: './test/*.png',
  coverage: './coverage/**/lcov.info',
  coverageDir: './coverage/',
  compiledDir: './.tmp/',
  compiledSrc: './.tmp/src/**/*.js',
  compiledSrcDir: './.tmp/src/',
  compiledTest: './.tmp/test/**/*.js',
  compiledTestDir: './.tmp/test/',
  buildDir: './lib/',
  exampleDir: './examples/node_modules/hatena-blog-api2/lib/'
};

const rollupParams = 
{
    entry: './src/index.js',
    format:'cjs',
    plugins: [
      nodeResolve({ jsnext: true }),
      commonjs()
    ],
    external:[
      'sharp','electron','events','tween.js','oauth','request','wsse','xml2js','fs'
    ]
}

gulp.task('clean', function(done) {
  let del = require('del');
  return del([
    paths.compiledDir,
    paths.coverageDir,
    paths.buildDir
  ], done);
});

gulp.task('coveralls', function() {
  let coveralls = require('gulp-coveralls');
  return gulp
    .src(paths.coverage)
    .pipe(coveralls());
});

gulp.task('build', function() {
  rollup(rollupParams).then(bundle=>{
    bundle.write({
      format: 'cjs',
      dest: `${paths.buildDir}index.js`
    });
  });
});

gulp.task('example',()=>{
  rollup(rollupParams).then(bundle=>{
    bundle.write({
      format: 'cjs',
      dest: `${paths.exampleDir}index.js`
    });
  });
});

gulp.task('compile-src', function() {
  rollup(rollupParams).then(bundle=>{
    bundle.write({
      format: 'cjs',
      dest: `${paths.compiledSrcDir}index.js`
    });
  });
});

gulp.task('copy-test-fixtures', () =>
  gulp
    .src(paths.testFixtures)
    .pipe(gulp.dest(paths.compiledTestDir))
);

gulp.task('compile-test', ['copy-test-fixtures'], function() {
//  let espower = require('gulp-espower');
  return 
    gulpRollup(rollupParams)
    .pipe('index.js')
    .pipe(espower())
    .pipe(gulp.dest(paths.compiledTestDir));
});

gulp.task('test', ['compile-src', 'compile-test'], function() {
  let istanbul = require('gulp-istanbul');
  let mocha = require('gulp-mocha');
  return gulp
    .src(paths.compiledSrc)
    .pipe(istanbul())
    .on('finish', () =>
      gulp
        .src(paths.compiledTest)
        .pipe(mocha().on('error', gutil.log))
        .pipe(istanbul.writeReports(paths.coverageDir))
  );
});

gulp.task('watch', gulp.watch.bind(gulp,[paths.src], ['build','example']));

gulp.task('default', ['build','example']);
