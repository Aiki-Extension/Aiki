
module.exports = {
    entry : {
        init: './dist/init.js',
        options: './dist/optionsPage/options.js',
        tooltip: './dist/tooltipPage/tooltip.js',
        statistics: './dist/statisticsPage/statistics.js',
        inject: './dist/contentInjection/inject.js',
        tour: './dist/introTour/introTour.js',
        dataconsent: './dist/dataCollection/dataCollection.js'
    },

    output: {
        path : __dirname + '/dist/js-src',
        // filename: __filename.replace('.js$','') + '.bundle.js'
        filename: '[name].bundle.js'
    }

}
