const gulp = require('gulp');
const rollup = require('rollup').rollup;
const gulpRollup = require('gulp-rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const paths = {
  src: './src/**/*.js',
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
    paths.buildDir
  ], done);
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

gulp.task('watch', gulp.watch.bind(gulp,[paths.src], ['build','example']));

gulp.task('default', ['build','example']);
