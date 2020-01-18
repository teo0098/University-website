const path = require('path');

module.exports = {
    mode: "production",
    entry: {
        "index": "./frontend/public/src/index.ts",
        "students": "./frontend/public/src/students.ts",
        "signup": "./frontend/public/src/signup.ts",
        "settings": "./frontend/public/src/settings.ts"
    },  
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "./frontend/public/src"),
        publicPath: ''
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};