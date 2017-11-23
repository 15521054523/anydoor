const path = require('path');

const mimeTypes = {
    css: 'text/css',
    gif: 'image/gif',
    html: 'text/html',
    ico: 'image/x-icon',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'text/javascript',
    json: 'application/json',
    pdf: 'application/pdf',
    png: 'image/png',
    svg: 'image/svg+xml',
    swf: 'application/x-shockwave-flash',
    tiff: 'image/tiff   ',
    txt: 'image/plain',
    wav: 'audio/x-wav',
    wma: 'audio/x-ms-wma',
    wmv: 'video/x-ms-wmv',
    xml: 'text/xml'
}

module.exports = (filePath) => {
    // 获取文件的后缀并且以 点 分割获取最后一个元素并转换为小写
    let ext = path.extname(filePath).split('.').pop().toLowerCase();

    if (!ext) {
        ext = filePath;
    }

    return mimeTypes[ext] || mimeTypes['txt'];
}