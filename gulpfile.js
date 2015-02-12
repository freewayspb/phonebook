var
    gulp = require('gulp'),
    concatCss = require('gulp-concat-css'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    notify = require("gulp-notify"),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    opn = require('opn'),
    jade = require('gulp-jade'),
    rename = require("gulp-rename"),
    clean = require("gulp-clean"),
    prefixer = require("gulp-autoprefixer"),
    filter = require('gulp-filter'),
    order = require('gulp-order'),
    wiredep = require('wiredep').stream,
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    rimraf = require('gulp-rimraf'),
    runSequence = require('run-sequence'),
    clean = require('gulp-clean');

// путь к готовому проекту
BuildPath = 'app';

// сборка папки 'app/'
gulp.task('build-old', ['jade', 'less', 'js','vendor-js','images','html','css'], function() {
    gulp.src('_dev/favicon.ico')
        .pipe(gulp.dest(BuildPath));
    gulp.src('_dev/fonts/**/*')
        .pipe(gulp.dest(BuildPath + '/fonts/'));
    gulp.src('_dev/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(BuildPath));
    gulp.src('_php/**/*.php')
        .pipe(gulp.dest(BuildPath))
        .pipe(notify("Build successful Complete!"));
});

// компилируем Jade если не включен webstorm компилятор
gulp.task('jade', function() {
    gulp.src('_dev/_makeups/**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(notify("<%= file.relative %> Complete!"))
        .pipe(gulp.dest('_dev/_makeups/')) // Записываем собранные файлы
});

// Очистка
gulp.task('clean', function () {
    return gulp.src('dist', {read: false}).pipe(clean());
});

// компилируем LESS если не включен webstorm компилятор
gulp.task('less', function() {
    gulp.src(['_dev/_styles/**/*.less'])
        .pipe(less())
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        //.pipe(prefixer())
        //.pipe(concatCss())
        //.pipe(minifycss({
        //    keepBreaks: true
        //}))
        //.pipe(rename({
        //    suffix: '.min'
        //}))
        .pipe(gulp.dest('_dev/_styles/'))
        .pipe(notify("<%= file.relative %> Less Complete!"))
});

// собираем JS
gulp.task('js', function() {
    gulp.src('_dev/_js/**/*.js')
        .pipe(concat('main.js')) // Собираем все JS, кроме тех которые находятся в /app/js/vendor/**
        .on('error', console.log)
        .pipe(uglify())
        .on('error', console.log)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(BuildPath + '/js'))
        .pipe(notify("<%= file.relative %> JS Complete!"))
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
});
// собираем HTML
gulp.task('html', function() {
    gulp.src(['_dev/_makeups/_pages/**/*.html'],['!_dev/_makeups/**/_*.html'])
        .pipe(gulp.dest(BuildPath))
        .pipe(notify("<%= file.relative %> HTML Complete!"))
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
});
// собираем CSS
gulp.task('css', function() {
    gulp.src(['_dev/_styles/_sections/*.css'])
        .pipe(concat('main.css')) // Собираем все CSS, кроме тех которые находятся в /app/css
        .on('error', console.log)
        .pipe(minifycss())
        .on('error', console.log)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(BuildPath + '/css'))
        .pipe(notify("<%= file.relative %> CSS Complete!"))
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
});
//Перенос зависимостей в js
gulp.task('vendor-js', function() {
    gulp.src('_dev/_vendor/_js/**/*.js')
        .pipe(gulp.dest(BuildPath + '/js/vendor'))
        .pipe(notify("<%= file.relative %> JS Complete!"))
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
});
//копируем php
gulp.task('php', function(){
    gulp.src('_dev/_php/**/*.php')
        .pipe(gulp.dest(BuildPath))
        .pipe(notify("<%= file.relative %> PHP Complete!"));
});
// копируем и минимизируем изображения
gulp.task('images', function() {
    gulp.src('_dev/_img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(BuildPath + '/img'))

});

// переброс шрифтов в app
gulp.task('fonts', function () {
    return gulp.src('./_dev/_styles/fonts/*')
        .pipe(gulp.dest(BuildPath + '/css/fonts/'));
});


gulp.task('vendor', function () {
    var assets = useref.assets();

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useref())
        .on('error', console.log)
        .pipe(gulp.dest(BuildPath))
        .pipe(notify("<%= file.relative %> VENDOR Complete!"))
        .on('error', console.log)
        .pipe(connect.reload());
});
gulp.task('bower', function () {
    return gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'components'
        }))
        .pipe(gulp.dest(BuildPath))
        .pipe(notify("<%= file.relative %> BOWER Complete!"));
});

// СБОРКА ПРОЕКТА ДЛЯ ТЕСТА
gulp.task('build', function(cb) {
    runSequence('build-clean',['jade', 'less', 'js','vendor-js','images'],['html','css','php'], cb);
});

gulp.task('build-clean', function() {
    return gulp.src(BuildPath)
        .pipe(clean());
});

// слежка за папкой разработки
gulp.task('watch', function() {
    gulp.watch(['./_dev/_makeups/**/*.html'],['html']);
    gulp.watch(['./_dev/_js/**/*.js'],['js']);
    gulp.watch(['./_dev/_styles/**/*.css', './_dev/_styles/fonts/*'],['css','fonts']);
    gulp.watch(['./_dev/_img/*'],['images']);
});

// server
gulp.task('connect', function() {
    connect.server({
        root: 'app',
        port: 8800,
        livereload: true
    });
    opn('http://localhost:8800/');
});

// задачи по умолчанию
gulp.task('default', ['connect', 'watch']);

function log(error) {
    console.log([
        '',
        "----------ERROR MESSAGE START----------",
        ("[" + error.name + " in " + error.plugin + "]"),
        error.message,
        "----------ERROR MESSAGE END----------",
        ''
    ].join('\n'));
    this.end();
}