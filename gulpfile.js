let gulp = require('gulp');
let clean = require('gulp-clean');
let gulpif = require('gulp-if');
let babel = require('gulp-babel');
let uglify = require('gulp-uglify');
let cssmin = require('gulp-cssmin');
let htmlmin = require('gulp-html-minifier');
let importCss = require('gulp-import-css');

function isJs(file) {
    return file.path.endsWith('.js') && !file.path.endsWith('.min.js');
}

function isCss(file) {
    return file.path.endsWith('.css') && !file.path.endsWith('common.css');
}

function isHtml(file) {
    return file.path.endsWith('.html');
}

function clear() {
    return gulp.src('dist/**/*.*').pipe(clean());
}

function buildCommonCss() {
    return gulp.src('src/css/common.css')
        .pipe(importCss())
        .pipe(gulp.dest('dist/css/'));
}

function build() {
    return gulp.src('src/**/*.*')
        .pipe(gulpif(isJs, babel({presets: ['@babel/env']})))
        .pipe(gulpif(isJs, uglify({mangle: true})))
        .pipe(gulpif(isCss, cssmin()))
        .pipe(gulpif(isHtml, htmlmin({
            removeComments               : true, // 清除HTML注释
            collapseWhitespace           : true, // 压缩空格
            collapseBooleanAttributes    : true, // 省略布尔属性的值
            removeEmptyAttributes        : true, // 删除所有空格作属性值
            removeScriptTypeAttributes   : true, // 删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
            minifyJS                     : true, // 压缩页面JS
            minifyCSS                    : true  // 压缩页面CSS
        })))
        .pipe(gulp.dest('dist/'));
}

exports.default = gulp.series(clear, buildCommonCss, build);