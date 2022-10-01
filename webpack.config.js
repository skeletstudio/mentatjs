

const path = require('path');

module.exports = {
    entry: './build/index.js',
    output: {
        filename: 'mentatjs.min.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'var',
        library: 'mentatjs'
    },
    optimization: {
        minimize: true
    },

};