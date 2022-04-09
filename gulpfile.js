const gulp = require('gulp');
const del = require('del');

gulp.task( 'copy-xpt', () => {
    return gulp.src('web/**/*.xpt')
        .pipe(gulp.dest('dist/web'));
});

gulp.task( 'copy-chart.js', () => {
    return gulp.src('node_modules/chart.js/dist/**/*.*')
        .pipe(gulp.dest('dist/web/scripts/node_modules/chart.js'));
});

gulp.task( 'copy-css', () => {
    return gulp.src('web/**/*.css')
        .pipe(gulp.dest('dist/web'));
});

gulp.task( 'clean-all', async () => {
    return del.sync('dist');
});

gulp.task( 'clean-bot', async () => {
    return del.sync('dist/bot');
});

gulp.task( 'clean-web', async () => {
    return del.sync('dist/web');
});

gulp.task( 'copy-js', async () => {
    await gulp.series('copy-chart.js')();
})

gulp.task( 'pack', async () => {
    await gulp.series('clean-web', 'copy-js', 'copy-xpt', 'copy-css')();
});
