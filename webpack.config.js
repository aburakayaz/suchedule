const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ProvidePlugin } = require("webpack");

module.exports = {
    entry: path.resolve(__dirname, "js/suchedule.js"),
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "bundle.[hash].js",
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: "html-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "fonts/",
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".js"],
        alias: {
            jquery: "jquery/src/jquery",
        },
        modules: ["node_modules"],
    },
    devtool: "inline-source-map",
    devServer: {
        contentBase: path.resolve(__dirname, "build"),
        hot: true,
    },
    optimization: {
        minimize: true,
    },
    plugins: [
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, "template/template.html"),
            filename: path.resolve(__dirname, "index.html"),
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, "template/template.html"),
            filename: path.resolve(__dirname, "build/index.html"),
        }),
        new ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
    ],
};
