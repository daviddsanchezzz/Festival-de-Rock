const { src, dest, watch, parallel } = require("gulp")
const sass = require("gulp-sass")(require("sass"))
const plumber = require("gulp-plumber");

const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const avif = require('gulp-avif');

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');

const tercerjs = require('gulp-terser-js');


function css(done){
    //Identificar el archivo SASS, compilarlo y almacenarlo

    src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass())
    .pipe( postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest("build/css"))

    done();
}

function versionWebp(done){

    import('gulp-webp').then(webp => {
        const opciones = {
            quality: 50
        };
        src('src/img/**/*.{png,jpg}')
            .pipe(webp.default(opciones))
            .pipe(dest('build/img'));

        done();
    }).catch(err => {
        console.error('Error importing gulp-webp:', err);
        done(err);
    });
}
function versionAvif(done){
    const opciones = {
        quality: 50
    };

    src('src/img/**/*.{jpg,png}') // Solo procesa imágenes en formatos JPEG y PNG
    .pipe(avif(opciones))
    .on('error', function(err) {
        console.error('Error processing images with AVIF:', err.message);
        done(err);
    })
    .pipe(dest('build/img'));

    done();
}

function imagenes(done){
    const opciones ={
        optimizationLevel: 3
    }

    src('src/img/**/*.{png,jpg}')
    .pipe(cache(imagemin(opciones)))
    .pipe(dest('build/img'));

    done();
}

function javascript(done){
    src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(tercerjs())
    .pipe(sourcemaps.write('.'))
    .pipe(dest('build/js'))

    done();
}

function dev(done){

    watch('src/scss/**/*.scss', css)
    watch('src/js/**/*.js', javascript)
    done();
}

exports.css = css;
exports.js = javascript
exports.versionWebp = versionWebp;
exports.versionAvif = versionAvif;
exports.imagenes = imagenes;
exports.dev = parallel(imagenes, versionWebp, versionAvif,javascript,dev);
