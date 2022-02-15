const gulp = require('gulp');
const del = require('del');

gulp.task( 'copy-xpt', () => {
    return gulp.src('web/**/*.xpt')
        .pipe(gulp.dest('dist/web'));
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

gulp.task( 'pack', async () => {
    await gulp.series('clean-web', 'copy-xpt', 'copy-css')();
});
