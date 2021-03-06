const path = require("path")
module.exports = {
    context: path.join(__dirname, "src", "functions"),
    entry: {
        "connect": "./connect.js",
        "createTable": "./createTable.js",
        "websocketLogin": "./websocketLogin.js",
        "update": "./update.js",
    },
    mode: "development",
    target: "node",
    devtool: false,
    output: {
        libraryTarget: "umd",
        path: path.join(__dirname, "build", "webpack"),
        filename: "[name].js"
    }
}