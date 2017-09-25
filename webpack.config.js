var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: './src/js/grid.js',

	output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist'
    },

    devServer: {
      historyApiFallback: true,
    },
	
	node: {
		fs: "empty"
	}
};
