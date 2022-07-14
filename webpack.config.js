const path = require('path')

module.exports = {
    entry: './src/client.ts',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, {
            test: /\.(glsl|vs|fs)$/,
            loader: 'ts-shader-loader',
            exclude: /node_modules/,
        }],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js','.fs','.vs'],
    },
    output: {
        filename: 'pack.js',
        path: path.resolve(__dirname, 'dist'),
    }
}