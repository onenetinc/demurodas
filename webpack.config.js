const path = require('path');

module.exports = {
    mode: 'production',  // Use 'development' for easier debugging during development
    entry: {
        checkForApprovals: './netlify/functions/checkForApprovals.js',
        createZip: './netlify/functions/createZip.js',
        deleteFromStorage: './netlify/functions/deleteFromStorage.js',
        demo: './netlify/functions/demo.js',
        gaUsers: './netlify/functions/gaUsers.js',
        generateProductPdfs: './netlify/functions/generateProductPdfs.js',
        getPrivateWfData: './netlify/functions/getPrivateWfData.js',
        getProfile: './netlify/functions/getProfile.js',
        loadGridData: './netlify/functions/loadGridData.js',
        resetPassword: './netlify/functions/resetPassword.js',
        signUp: './netlify/functions/signUp.js',
        sitePublish: './netlify/functions/sitePublish.js',
        updateProfile: './netlify/functions/updateProfile.js',
        uploadToStorage: './netlify/functions/uploadToStorage.js',
        userCreated: './netlify/functions/userCreated.js',
        userDeleted: './netlify/functions/userDeleted.js',
        hello: './netlify/functions/hello.js',
    },
    output: {
        path: path.resolve(__dirname, 'netlify/functions/bundled'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
    },
    target: 'node',  // Target node environment for Netlify functions
    externals: {
        'webflow-api': 'commonjs webflow-api',
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
        'playwright': 'commonjs playwright',  // ✅ Use Playwright instead of Puppeteer
        '@sparticuz/chromium': 'commonjs @sparticuz/chromium',  // ✅ Ensure correct Chromium externalization
        yargs: 'commonjs yargs',
        'yargs-parser': 'commonjs yargs-parser'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    resolve: {
        fallback: {}
    }
};
