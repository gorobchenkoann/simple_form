import { src, dest, series, parallel, watch } from 'gulp';
import del from 'del';
import less from 'gulp-less';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browserSync from 'browser-sync';

const server = browserSync.create();

const PATHS = {
    styles: {
        src: './src/styles/index.less',
        dist: './dist/styles'
    },
    scripts: {
        src: './src/js/**/*.js',
        dist: './dist/js'
    },
    images: {
        src: './src/assets/images/*.{png, jpg}',
        dist: './dist/assets/images'
    }
}
  
function clean() {
    return del('./dist')
}

function copy() {
    return src([
            './src/*.html',
            './src/js/lib/**/*'
        ], {
            base: 'src'
        })
        .pipe(dest('./dist/'))
}

function images() {
    return src(PATHS.images.src)
        .pipe(imagemin())
        .pipe(dest(PATHS.images.dist))
}

function jsTranspile() {
    return browserify({
        entries: './src/js/index.js'
    })
    .transform('babelify', { presets: ['@babel/preset-env'] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(dest(PATHS.scripts.dist)) // При разработке указать src 
    .pipe(server.stream());
}

function cssTranspile() {
    return src(PATHS.styles.src)
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(dest(PATHS.styles.dist))
        .pipe(server.stream());
}

function serve(done) {
    server.init({
        server: {
            baseDir: './src'
        },
        open: true
    });
    done();
}

function watchFiles() {
    watch('./src/*.html', parallel(copy));
    watch(PATHS.styles.src, parallel(cssTranspile));
    // Не следим за bundle.js, поскольку это приводит к рекурсивному запуску таска
    watch([PATHS.scripts.src, '!./src/js/bundle.js' ], parallel(jsTranspile));
}

exports.dev = parallel(watchFiles, serve);
exports.build = series(clean, copy, parallel(cssTranspile, jsTranspile, images));