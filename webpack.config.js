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
        updateProfile: './netlify/functions/updateProfile.js',
        signUp: './netlify/functions/signUp.js',
        sitePublish: './netlify/functions/sitePublish.js',
        updateProfile: './netlify/functions/updateProfile.js',
        uploadToStorage: './netlify/functions/uploadToStorage.js',
        userCreated: './netlify/functions/userCreated.js',
        userDeleted: './netlify/functions/userDeleted.js',
    },
    output: {
        path: path.resolve(__dirname, 'netlify/functions/bundled'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
    },
    target: 'node',  // Target node environment for Netlify functions
    externals: {
        'firebase-admin': 'commonjs firebase-admin',
        'firebase-functions': 'commonjs firebase-functions',
        'webflow-api': 'commonjs webflow-api',
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
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
        fallback: {
            "fs": false,
            "path": false,
            "os": false
        }
    }
};