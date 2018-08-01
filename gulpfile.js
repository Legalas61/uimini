var     gulp         =       require('gulp'),
        pug          =       require('gulp-pug'),
        stylus       =       require('gulp-stylus'),
        plumber      =       require('gulp-plumber'),
        notify       =       require('gulp-notify'),
        concat       =       require('gulp-concat'),
        uglify       =       require('gulp-uglifyjs'),
        jshint       =       require('gulp-jshint'),
        sourcemaps   =       require('gulp-sourcemaps'),
        cssnano      =       require('gulp-cssnano'),
        autoprefixer =       require('gulp-autoprefixer'),
        browserSync  =       require('browser-sync'),
        cache        =       require('gulp-cache'),
        gutil        =       require('gulp-util'),
        rename       =       require("gulp-rename"),
        del          =       require('del'),
        fs           =       require('fs');
var config = {
        
        //DOCS
        devFolder:           './docs/dev',
        buildFolder:         './docs/build',
        secondBuildFolder:   '/static',
        
        //MINIMAL-UI
        cssFolder:           './css',
        stylusFolder:        './stylus'

};

//STYLUS MINIMAL-UI --DEV
gulp.task('style:dev', function(){
    return gulp
        .src(config.stylusFolder + '/main.styl')
        // .pipe(sourcemaps.init())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(stylus({
            //Libs include here - 'devFolder' +'/sylus/libs.styl'
            'include css': true
        }))
        .pipe(autoprefixer({
            //3v for Flex-box
            browsers: ['last 3 version']
        }))
        // .pipe(sourcemaps.write('.'))
        .pipe(rename({ basename: "minimal-ui" }))
        
        .pipe(gulp.dest(config.cssFolder))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.cssFolder))
        
        //Dest min v for docs
        .pipe(gulp.dest(config.buildFolder +config.secondBuildFolder +'/css/'))
        .pipe(browserSync.reload({stream: true}))
});


//STYLUS DOCS --DEV
gulp.task('styleDOCS:dev', function(){
    return gulp
        .src(config.devFolder +'/stylus/main.styl')
        .pipe(sourcemaps.init())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(stylus({
            //Libs include here - 'devFolder' +'/sylus/libs.styl'
            'include css': true
        }))
        .pipe(autoprefixer({
            //3v for Flex-box
            browsers: ['last 3 version']
        }))
        // .pipe(sourcemaps.write('.'))
        // .pipe(gulp.dest(config.buildFolder +config.secondBuildFolder +'/css/'))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.buildFolder +config.secondBuildFolder +'/css/'))
        .pipe(browserSync.reload({stream: true}))
});

//PUG FOR DOCS
gulp.task('pug', function () {
    return gulp
        .src(config.devFolder +'/pug/pages/**/*.pug')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(pug({
                locals: {
                    changelog: JSON.parse(fs.readFileSync('./docs/data/changelog/changelog.json', 'utf8')),
                    nav: JSON.parse(fs.readFileSync('./docs/data/nav.json', 'utf8')),
                    navSidebar: JSON.parse(fs.readFileSync('./docs/data/documentation/nav.json', 'utf8')),
                },
                pretty: true
            }
        ))
        .pipe(gulp.dest(config.buildFolder))
        .on('end', browserSync.reload)
});

//JS DOCS
gulp.task('script:dev', function() {
    return gulp

        //Libs here:
        .src([
         // EXAMPLE:
         // './node_modules/jquery/dist/jquery.min.js',
            config.devFolder +'/js/libs/*.js',
            config.devFolder +'/js/common.js'
        ])
        .pipe(plumber())

        /* 
        Jshint - detects errors and potential problems in JavaScript code.
        Errors are output in the console with syntax highlighting.
        You can add a list of ignored files on - .jshintignore (file is hidden)
        Also, you can comment on 2 lines below if you dont need jshint.
        */
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        
        .pipe(concat('main.js'))
        //TODO uglify
        .pipe(gulp.dest(config.buildFolder +config.secondBuildFolder +'/js'))
        .pipe(browserSync.reload({stream: true}))
});

//IMG DOCS
gulp.task('img:dev', function() {
    return gulp
        .src(config.devFolder +'/img/**/*.{jpg,JPG,gif,png,PNG,svg,ico}')
        .pipe(gulp.dest(config.buildFolder +config.secondBuildFolder +'/img'));

});

//FONTS DOCS
gulp.task('fonts', function() {
    return gulp
        .src(config.devFolder +'/fonts/**/*.*')
        .pipe(gulp.dest(config.buildFolder +config.secondBuildFolder +'/fonts'));

});


//DELETE FOLDER BEFORE DEV
gulp.task('clean', function() {

    //MINIMAL-UI
    return del.sync(config.cssFolder)

    //DOCS
    return del.sync(config.buildFolder)

});


//WATCH DOCS
gulp.task('watch', function(){

    //MINIMAL-UI
    gulp.watch(config.stylusFolder +'/**/*.styl', ['style:dev']);

    //DOCS
    gulp.watch(config.devFolder +'/pug/**/*.pug', ['pug']);
    gulp.watch(config.devFolder +'/stylus/**/*.styl', ['styleDOCS:dev']);
    gulp.watch(config.devFolder +'/js/**/*.js', ['script:dev']);
    gulp.watch(config.devFolder +'/img/**/*.img', ['img:dev']);

});


//SERVER DOCS
gulp.task('serve', function() {
    browserSync({
        server:{
            baseDir: config.buildFolder
        },
        // port: 8080,
        // open: true,
        notify: false
    })
});


//MAIN TASK

//DEV FOR MINIMAL-UI & DOCS
gulp.task('default', ['clean','pug','styleDOCS:dev','style:dev','script:dev','fonts','img:dev','watch','serve']);

//CLEAR CACHE
gulp.task('cache', function() {
    return cache.clearAll();
});


//Error Message
var onError = function(err) {
    notify.onError({
        title:    "Error in " + err.plugin,
        message: err.message
    })(err);
    this.emit('end');
};