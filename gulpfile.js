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
    rename((path) => (path.extname = '.wxss')),
    gulp.dest(dist)
  ])

  combined.on('error', handleError)
})

gulp.task('js', () => {
  gulp
    .src(`${src}/**/*.js`)
    // 如果是 prod，则触发 jdists 的 prod trigger
    // 否则则为 dev trigger
    .pipe(
      isProd ? jdists({trigger: 'prod'}) 
      : jdists({trigger: 'dev'})
    )
    // 如果是 prod，则传入空的流处理方法，不生成 sourcemap
    .pipe(isProd ? through.obj() : sourcemaps.init())
    // 使用babel处理js文件
    .pipe(
      babel({
        presets: ['env']
      })
    )
    // 如果是prod 则使用uglify 压缩js
    .pipe(
      isProd ? uglify({compress: true}) : through.obj()
    )
    // 如果prod ,则传入空的流的处理方法， 不生成sourcemaps
    .pipe(isProd ? through.obj() : sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
})

gulp.task('wxs', () => {
  return gulp.src(`${src}/**/*.wxs`).pipe(gulp.dest(dist))
})

gulp.task('images', () => {
  return 
  gulp
   .src(`${src}/images/**`)
   .pipe(gulp.dest(`${dist}/images`))
})

gulp.task('json', ()=> {
  return gulp 
          .src(`${src}/**/*.json`)
          .pipe(gulp.dest(dist))
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