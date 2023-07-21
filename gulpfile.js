const {src, dest, watch , parallel ,series} = require('gulp');


const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');

// работает со страницами хтмл инклюдит их в одно место
function pages(){
    return src('app/pages/*.html')
    .pipe(include({
        includePaths: 'app/components'
    }))
    .pipe(dest('app'))
    .pipe(browserSync.stream())
}


// работает со шрифтами
function fonts(){
    return src('app/fonts/src/*.*')
    .pipe(fonter({
        formats: ['woff','ttf']
    }))
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts'))
}


function images(){
    // сжимает все картинки за исключением svg
    return src(['app/images/src/*.*','!app/images/src/*.svg'])
    .pipe(newer('app/images/dist'))
    .pipe(avif({ quality : 50}))

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images/dist'))
    .pipe(webp())

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images/dist'))
    .pipe(imagemin())


    .pipe(dest('app/images/dist'))
}
// работает с svg элементами
function sprite (){
    return src('app/images/dist/*.svg')
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite:'../sprite.svg',
                example: true
            }
        }

    }))
    .pipe(dest('app/images/dist'))

}

// компилирует и сжимает стили sccs -> css
function styles() {
    return src('app/scss/style.scss')
    .pipe (autoprefixer({overrideBrowserslist: ['last 10 version']}))
    .pipe(concat('style.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}
// сжимает и работает с js
function scripts() {
    return src('app/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function watching(){
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
    watch(['app/scss/style.scss'], styles)
    watch(['app/images/src'], images)
    watch(['app/js/main.js'], scripts)
    watch(['app/components/*', 'app/pages/*'], pages)
    watch(['app/*.html']).on('change' , browserSync.reload)
}

// обновляет браузер при изменениях browsersync (я ее перенес в ватчер выше)

// переносит из апп в дист сохраняя архитектуру
function building(){
    return src([
        'app/css/style.min.css',
        'app/images/dist/*.*',
        '!app/images/dist/*.svg',
        'app/images/dist/sprite.svg',
        'app/fonts/*.*',
        'app/js/main.min.js',
        'app/**/*.html'
    ]
    ,{base : 'app'})
    .pipe(dest('dist'))
}

function cleanDist() {
    return src('dist')
    .pipe(clean())
}

exports.styles = styles;
exports.fonts = fonts;
exports.images = images;
exports.pages = pages;
exports.building = building;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;

// обьеденяет клин и билд сначала удаляет дист потом переносит в дист изменени 
exports.build = series(cleanDist, building);

exports.default = parallel(styles,images, scripts , pages , watching);