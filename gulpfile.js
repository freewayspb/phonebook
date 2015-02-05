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

// путь к готовому проекту
BuildPath = './app/';

// сборка папки 'app/'
gulp.task('build', ['jade', 'less', 'js','images'], function() {
    gulp.src('_dev/favicon.ico')
        .pipe(gulp.dest(BuildPath));
    gulp.src('_dev/fonts/**/*')
        .pipe(gulp.dest(BuildPath + '/fonts/'));
    gulp.src('_dev/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(BuildPath));
});

// компилируем Jade
gulp.task('jade',['wiredep'], function() {
    gulp.src('_dev/_makeups/_pages/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(notify("<%= file.relative %> Complete!"))
        .pipe(gulp.dest(BuildPath)) // Записываем собранные файлы
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
        .pipe(gulp.dest(BuildPath + '/css'))
        .pipe(minifycss({
            keepBreaks: true
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(BuildPath + '/css'))
        .pipe(notify("<%= file.relative %> Less Complete!"))
        .pipe(connect.reload());
});

// собираем JS
gulp.task('js', function() {
    gulp.src('_dev/_js/_modules/**/*.js')
        .pipe(concat('main.js')) // Собираем все JS, кроме тех которые находятся в /app/js/vendor/**
        .on('error', console.log)
        .pipe(gulp.dest(BuildPath + '/js'))
        .pipe(uglify())
        .on('error', console.log)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(BuildPath + '/js'))
        .pipe(notify("<%= file.relative %> JS Complete!"))
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
});

// копируем и минимизируем изображения
gulp.task('images', function() {
    gulp.src('_dev/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(BuildPath + '/img'))

});

// переброс шрифтов в app
gulp.task('fonts', function () {
    return gulp.src('./_dev/_styles/fonts/*')
        .pipe(gulp.dest(BuildPath + '/css/fonts/'));
});
// СБОРКА ПРОЕКТА ДЛЯ ТЕСТА

gulp.task('test-build', ['jade', 'less'], function () {
    var assets = useref.assets(); //Функция плагина gulp-useref

    // Плагин rimraf удаляет каталог в переменной productionPath
    //$.rimraf.sync(productionPath, function (er) {
    //    if (er) throw er;
    //});
    gulp.src(['./app/*.html'])
        // Плагин wiredep обрабатывает зависимости bower
        .pipe(wiredep({
            directory: './components'
        }))
        .pipe(assets).on('error', console.log) // находит блоки build в html и выделяет из них необходимые ресурсы
        //.pipe($.if('*.js', $.uglify())).on('error', log)
        //.pipe($.if('*.css', $.minifyCss({cache:false})))  // Минификация Css не работает в таком контексте, не справляется с путями к css

        // Следующие две строчки были в примере плагина gulp-useref, пока не разбирался зачем они
        .pipe(assets.restore())
        .on('error', console.log)
        .pipe(useref())
        .on('error', console.log)
        .pipe(gulp.dest(BuildPath)).on('error', console.log);
});

// Work witch bower
gulp.task('wiredep', function(){

    gulp.src('./_dev/**/*.less')
        .pipe(wiredep({
            directory: 'components',
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('./_dev'));
    gulp.src('./_dev/**/*.jade')
        .pipe(wiredep({
            directory: 'components',
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('./_dev'));
});
// сборка vendor
gulp.task('vendor', function () {
    var assets = useref.assets();
    return gulp.src('./app/*.html')
        .pipe(assets)
        .pipe(gulpif(['*.js'], uglify()))
        .pipe(gulpif(['*.css'], minifycss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(BuildPath));
});

// слежка за папкой разработки
gulp.task('watch', function() {
    gulp.watch(['./_dev/_jade/**/*.jade', './_dev/_js/**/*.js', './_dev/_styles/**/*.less', './_dev/_styles/fonts/*'],'test-build');
    //gulp.watch('./_dev/_styles/**/*.less', ['less']);
    //gulp.watch('./_dev/_makeups/**/*.jade', ['jade']);
    //gulp.watch('./_dev/_scripts/_modules/*.js', ['js']);
    //gulp.watch('./app/*.html',['vendor']);
    //gulp.watch('bower.json', ['vendor']);
});

// server
gulp.task('connect', function() {
    connect.server({
        root: BuildPath,
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