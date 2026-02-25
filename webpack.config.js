const path = require('path')
let config;

const bcp_path = path.join(process.cwd(), 'node_modules/butter-component-builder')
if (process.env.NODE_ENV === 'development') {
    config = require(`${bcp_path}/webpack/webpack.dev.config.js`)
} else {
    config = require(`${bcp_path}/webpack/webpack.build.config.js`)
}

// Override babel config to use modern presets
if (config.module && config.module.rules) {
    const babelRule = config.module.rules.find(r => r.use && r.use.loader === 'babel-loader')
    if (babelRule) {
        babelRule.use.options.presets = [
            [require.resolve('@babel/preset-env'), {
                targets: {
                    browsers: ['last 2 versions'],
                    node: '14'
                }
            }],
            [require.resolve('@babel/preset-react'), { runtime: 'automatic' }]
        ]
        babelRule.use.options.plugins = [
            require.resolve('@babel/plugin-transform-object-rest-spread')
        ]
    }
}

module.exports = Object.assign(config, {
    target: 'electron-main',
    entry: Object.assign(config.entry, {index: `${__dirname}/electron/index.js`}),
    externals: {},
    output: {
        path:path.join(process.cwd(), 'build'),
        publicPath: 'build/',
        filename: '[name].js'
    }
})
