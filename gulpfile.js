const gulp = require('gulp')
const rename = require('gulp-rename')
const del = require('del')

const postcss = require('gulp-postcss')
const pxtorpx = require('postcss-px2rpx')
// 字体文件转化为base64
const base64 = require('postcss-font-base64')
const htmlmin = require('gulp-htmlmin')
const sass = require('gulp-sass')
const combiner = require('stream-combiner2')

const jsonminify = require('gulp-jsonminify')
const cssnano = require('gulp-cssnano')
const runSequence = require('run-sequence')
const colors = require('ansi-colors')
const log = require('fancy-log')
const filter = require('gulp-filter')

// 引入需要用到的 npm 包
// 生产发布打包流程
const sourcemaps = require('gulp-sourcemaps')          // 方便本地debuge代码
const jdists = require('gulp-jdists')
const through = require('through2')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')

const argv = require('minimist')(process.argv.slice(2))
// 判断 gulp --type prod 命名 type 是否是生产打包
const isProd = argv.type === 'prod'

const src = './client'
const dist = './dist'

const handleError = (err) => {
  console.log('\n')
  log(colors.red('Error!'))
  log('fileName: ' + colors.red(err.fileName))
  log('lineNumber: ' + colors.red(err.lineNumber))
  log('message: ' + err.message)
  log('plugin: ' + colors.yellow(err.plugin))
}

// Gulp 是以 task 为核心的打包工具，
// 针对不同的文件类型（比如通过正则过滤）
// 可以配置不同的流程控制。

gulp.task('wxml', () => {
  return gulp
    .src(`${src}/**/*.wxml`)
    .pipe(gulp.dest(dist))
})



gulp.task('wxss', () => {
  const combined = combiner.obj([
    gulp.src(`${src}/**/*.{wxss,scss}`),
    sass().on('error', sass.logError),
    postcss([pxtorpx(), base64()]),
    isProd
      ? cssnano({
          autoprefixer: false,
          discardComments: {removeAll: true}
        })
      : through.obj(),
    rename((path) => (path.extname = '.wxss')),
    gulp.dest(dist)
  ])

  combined.on('error', handleError)
})

gulp.task('js', () => {
  const f = filter((file) => !/(mock)/.test(file.path))
  gulp
    .src(`${src}/**/*.js`)
    .pipe(isProd ? f : through.obj())
    .pipe(
      isProd
        ? jdists({
            trigger: 'prod'
          })
        : jdists({
            trigger: 'dev'
          })
    )
    .pipe(isProd ? through.obj() : sourcemaps.init())
    .pipe(
      babel({
        presets: ['env']
      })
    )
    .pipe(
      isProd
        ? uglify({
            compress: true
          })
        : through.obj()
    )
    .pipe(isProd ? through.obj() : sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
})

gulp.task('wxs', () => {
  return gulp.src(`${src}/**/*.wxs`).pipe(gulp.dest(dist))
})

gulp.task('images', () => {
  return gulp.src(`${src}/images/**`).pipe(gulp.dest(`${dist}/images`))
})

gulp.task('json', () => {
  return gulp.src(`${src}/**/*.json`).pipe(isProd ? jsonminify() : through.obj()).pipe(gulp.dest(dist))
})

// 聚合类
gulp.task('watch', () => {
  ;['wxml', 'wxss', 'js', 'json', 'wxs'].forEach((v) => {
    gulp.watch(`${src}/**/*.${v}`, [v])
  })
  gulp.watch(`${src}/images/**`, ['images'])
  gulp.watch(`${src}/**/*.scss`, ['wxss'])
})

gulp.task('clean', () => {
  return del(['./dist/**'])
})

gulp.task('dev', ['clean'], () => {
  runSequence('json', 'images', 'wxml', 'wxss', 'js', 'wxs', 'cloud', 'watch')
})

gulp.task('build', ['clean'], () => {
  runSequence('json', 'images', 'wxml', 'wxss', 'js', 'wxs', 'cloud')
})

// cloud-functions 处理方法
const cloudPath = './server/cloud-functions'
gulp.task('cloud', () => {
  return gulp
    .src(`${cloudPath}/**`)
    .pipe(
      isProd
        ? jdists({
            trigger: 'prod'
          })
        : jdists({
            trigger: 'dev'
          })
    )
    .pipe(gulp.dest(`${dist}/cloud-functions`))
})

gulp.task('watch:cloud', () => {
  gulp.watch(`${cloudPath}/**`, ['cloud'])
})

gulp.task('cloud:dev', () => {
  runSequence('cloud', 'watch:cloud')
})