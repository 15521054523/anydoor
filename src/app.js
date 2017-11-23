const http = require('http');
const chalk = require('chalk');
const path = require('path');
const conf = require('./config/defaultConfig');
const route = require('./helper/route');
const openUrl = require('./helper/openUrl');

class Server {
    constructor (config) {
        this.conf = Object.assign({}, conf ,config);
    }
    start() {
        // 创建静态服务器
        const server = http.createServer((req, res) => {
            // 获取文件的目录
            const filePath = path.join(this.conf.root, req.url);
            route(req, res, filePath, this.conf);

        });

        // 启动服务器
        server.listen(this.conf.port, this.conf.hostname, () => {
            const addr = `http://${this.conf.hostname}:${this.conf.port}`;
            console.info(`Server started at ${chalk.green(addr)}`);
            openUrl(addr);
        });
    }
}


module.exports = Server; 

