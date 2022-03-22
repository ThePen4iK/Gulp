const project_folder = "dist";
const source_folder = "app";

const path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/*.js",
    img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp|mp4)",
    fonts: source_folder + "/fonts/**/*.*",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp|mp4)",
    fonts: source_folder + "/fonts/**/*.*",
  },
  clean: "./" + project_folder + "/",
};
const { src, dest, parallel } = require("gulp");
const gulp = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browsersync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const del = require("del");
const cleanCss = require("gulp-clean-css");
const rename = require("gulp-rename");
const fileinclude = require("gulp-file-include");

// Сервер - gulp browsersync
function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/",
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
      .pipe(fileinclude())
      .pipe(dest(path.build.html))
      .pipe(browsersync.stream());
}
// Конвертирование стилей в css - gulp styles
function styles() {
  return src(path.src.css)
      .pipe(
          scss({
            outputStyle: "expanded",
          })
      )
      .pipe(
          autoprefixer({
            overrideBrowserslist: ["last 10 versions"],
            cascade: true,
            grid: true,
          })
      )
      .pipe(dest(path.build.css))
      .pipe(cleanCss())
      .pipe(
          rename({
            extname: ".min.css",
          })
      )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream());
}
// Объединение js файлов и их минифицирование
function scripts() {
  return src([
    // 'node_modules/jquery/dist/jquery.js',
    path.src.js,
  ])
      .pipe(fileinclude())

      .pipe(concat("script.js"))
      .pipe(dest(path.build.js))

      .pipe(uglify())

      .pipe(rename({
        suffix: ".min"
      }))

      .pipe(dest(path.build.js))
      .pipe(browsersync.stream());
}
// Для сжатия картинок - gulp img
function images() {
  return src(path.src.img)
      .pipe(
          imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
              plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
            }),
          ])
      )
      .pipe(dest(path.build.img));
}

function fonts() {
  return src(path.src.fonts).pipe(dest(path.build.fonts));
}

function clean() {
  return del(path.clean);
}

// Для билда проекта - gulp build
//function build() {
//  return src(
//    [
//      "app/css/style.css",
//      "app/fonts/**/*",
//      "app/js/script.min.js",
//      "app/*.html",
//    ],
//    { base: "app" }
//  ).pipe(dest("dist"));
//}

// Следим за всеми подпапками и файлами - gulp watchFiles
function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], styles);
  gulp.watch([path.watch.js], scripts);
  gulp.watch([path.watch.img], images);
  gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(
    clean,
    gulp.parallel(styles, html, scripts, images, fonts)
);
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.scripts = scripts;
exports.styles = styles;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
