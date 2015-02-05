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
    gulpif = require('gulp-if');

// сборка папки 'app/'
gulp.task('build', ['jade', 'less', 'js','images'], function() {
    gulp.src('_dev/favicon.ico')
        .pipe(gulp.dest('app/'));
    gulp.src('_dev/fonts/**/*')
        .pipe(gulp.dest('app/fonts/'));
    gulp.src('_dev/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('app/img'));
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
});

// Очистка
gulp.task('clean', function () {
    return gulp.src('dist', {read: false}).pipe(clean());
});

// компилируем LESS
gulp.task('less', function() {
    gulp.src(['_dev/_styles/**/*.less'])
        .pipe(less())
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(prefixer())
        .pipe(concatCss("main.css"))
        .pipe(gulp.dest('app/css'))
        .pipe(minifycss({
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
    gulp.src('_dev/_js/_modules/**/*.js')
        .pipe(concat('main.js')) // Собираем все JS, кроме тех которые находятся в /app/js/vendor/**
        .on('error', console.log)
        .pipe(gulp.dest('app/js'))
        .pipe(uglify())
        .on('error', console.log)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/js'))
        .pipe(notify("<%= file.relative %> JS Complete!"))
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
});

// копируем и минимизируем изображения
gulp.task('images', function() {
    gulp.src('_dev/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('app/img'))

});

// Work witch bower
gulp.task('wiredep', function(){
    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/components'
        }))
        .pipe(gulp.dest('app'));
});

// сборка vendor
gulp.task('vendor',['wiredep'], function () {
    var assets = useref.assets();
    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(gulpif(['*.js'], uglify()))
        .pipe(gulpif(['*.css'], minifycss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('app'));
});

// слежка за папкой разработки
gulp.task('watch', function() {
    gulp.watch('_dev/_styles/**/*.less', ['less']);
    gulp.watch('_dev/_makeups/**/*.jade', ['jade']);
    gulp.watch('_dev/_scripts/_modules/*.js', ['js']);
    gulp.watch('app/*.html',['wiredep']);
    gulp.watch('bower.json', ['vendor']);
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

//// Переброс файлов компонентов bower в папку проекта
//gulp.task('js:vendor', function () {
//    var vendors = mainBowerFiles();
//
//     return gulp.src(vendors)
//        .pipe(filter('**.js'))
//        .pipe(order(vendors))
//        .pipe(concat('vendor.js'))
//        .pipe(uglify())
//        .pipe(rename({
//            suffix: '.min'
//        }))
//        .pipe(notify("<%= file.relative %> Bower Complete!"))
//        .pipe(gulp.dest('app/js/'))
//});
//
//gulp.task('css:vendor', function () {
//    var vendors = mainBowerFiles();
//
//    return gulp.src(vendors)
//        .pipe(filter('**.css'))
//        .pipe(order(vendors))
//        .pipe(concat('vendor.css'))
//        .pipe(uglify())
//        .pipe(rename({
//            suffix: '.min'
//        }))
//        .pipe(notify("<%= file.relative %> Bower Complete!"))
//        .pipe(gulp.dest('app/css/'));
//});

//gulp.task('default', function() {
//    var bower = require('main-bower-files');
//    var bowerNormalizer = require('gulp-bower-normalize');
//    return gulp.src(bower(), {base: '.app/components'})
//        .pipe(bowerNormalizer({bowerJson: './bower.json'}))
//        .pipe(gulp.dest('./bower_dependencies/'))
//});

// задачи по умолчанию
gulp.task('default', ['connect', 'watch']);