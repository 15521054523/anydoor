const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mime = require('./mime');
const compress = require('./compress');
const range =  require('./range');
const isFresh =  require('./cache');


// 拼接绝对路径
const tplPath = path.join(__dirname,'../template/dir.tpl');
// 同步加载该模板文件
const source = fs.readFileSync(tplPath);
// 生成template编译
const template = Handlebars.compile(source.toString());

module.exports = async function (req, res, filePath, conf) {
    try {
        const stats = await stat(filePath);
        // 是否是文件
        if (stats.isFile()) {

            const contentType = mime(filePath);
            res.setHeader('Content-Type', contentType);

            // 读内容是比较慢，因为是一次性全部读出来再一次性全部返回到页面
            // fs.readFile(filePath, (err, data) => {
            //     res.end(data);
            // });

            // 检测是否有缓存
            if (isFresh(stats, req, res)) {
                res.statusCode = 304;
                res.end();
                return;
            }

            let rs;
            const {code, start, end} = range(stats.size, req, res);
            if (code === 200) {
                res.statusCode = 200    ;
                rs = fs.createReadStream(filePath);
            } else {
                res.statusCode = 206;
                rs = fs.createReadStream(filePath, { start, end});
            }

            // 读内容比较快，读一点返回一点到页面（推荐使用）
            if (filePath.match(conf.compress)) {
                rs = compress(rs, req, res)
            }
            rs.pipe(res);
        } 
        //是否是文件夹
        else if(stats.isDirectory()) {
            // 获取文件夹下的所有文件
            const files = await readdir(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            const dir = path.relative(conf.root, filePath);
            const data = {
                // 得到当前目录名
                title: path.basename(filePath),
                // 当前文件夹名
                dir: dir ? `/${dir}` : '',
                // 当前文件夹或者文件
                files: files.map(file => {
                    return {
                        file,
                        icon: mime(file)
                    }
                })
            }
            res.end(template(data));
        }
    } catch(ex) {
        console.error(ex);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`${filePath} is not a directory of  \n ${ex.toString()}`);
    }
}