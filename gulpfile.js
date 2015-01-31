var
    gulp = require('gulp'),
    concatCss = require('gulp-concat-css'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    notify = require("gulp-notify"),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    opn = require('opn'),
    jade = require('gulp-jade'),
    rename = require("gulp-rename"),
    clean = require("gulp-clean"),
    prefixer = require("gulp-autoprefixer");

// сборка папки 'app/'
gulp.task('build', ['clean', 'jade', 'less', 'js', 'compress-plugins', 'move-php'], function() {
    gulp.src('_dev/favicon.ico')
        .pipe(gulp.dest('app/'))
    gulp.src('_dev/fonts/**/*')
        .pipe(gulp.dest('app/fonts/'))
    gulp.src('_dev/_scripts/_vendor/**/*')
        .pipe(gulp.dest('app/js/vendor/'))
    gulp.src('_dev/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('app/img'))
});

// компилируем Jade
gulp.task('jade', function() {
    gulp.src('_dev/_makeups/_pages/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(notify("<%= file.relative %> Complete!"))
        .pipe(gulp.dest('app')) // Записываем собранные файлы
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
});

// компилируем LESS
gulp.task('less', function() {
    gulp.src(['./_dev/_styles/**/*.less'])
        .pipe(less())
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(prefixer())
        .pipe(concatCss("main.css"))
        .pipe(gulp.dest('app/css'))
        .pipe(minifyCSS({
            keepBreaks: true
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/css'))
        .pipe(notify("<%= file.relative %> Less Complete!"))
        .pipe(connect.reload());
});

// собираем JS
gulp.task('js', function() {
    gulp.src('_dev/_scripts/_modules/**/*.js')
        .pipe(concat('main.js')) // Собираем все JS, кроме тех которые находятся в /app/js/vendor/**
        .on('error', console.log)
        .pipe(gulp.dest('app/js'))
        .pipe(uglify())
        .on('error', console.log)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/js'))
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
});

// собираем и минифицируем JS plugins
gulp.task('compress-plugins', function() {
    gulp.src('_dev/_scripts/_plugins/**/*.js')
        .pipe(concat('plugins.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/js'));
});

// копируем и минимизируем изображения
gulp.task('images', function() {
    gulp.src('_dev/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('app/img'))

});

// перемещение php файлов
gulp.task('move-php', function() {
    gulp.src('_dev/*.php')
        .pipe(gulp.dest('app/'));
    gulp.src('_dev/upload/**/*')
        .pipe(gulp.dest('app/upload/'));
});

// слежка за папкой разработки
gulp.task('watch', function() {
    gulp.watch('_dev/_styles/**/*.less', ['less']);
    gulp.watch('_dev/_makeups/**/*.jade', ['jade']);
    gulp.watch('_dev/_scripts/_modules/*.js', ['js', 'compress-plugins']);
    gulp.watch('_dev/_scripts/_plugins/*.js', ['compress-plugins']);
    gulp.watch('_dev/*.php', ['move-php']);
});

// удаление загруженных картинок
gulp.task('clean', function() {
    gulp.src('app/upload/files/*.*')
        .pipe(clean());
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