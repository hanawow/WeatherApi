"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const fs_1 = require("fs");
const url = require("url");
const parseKeyValue = require("parse-key-value");
const INDEX_PAGE = 'index.html';
const contentTypes = new Map([
    ['html', 'text/html'],
    ['js', 'text/javascript'],
    ['json', 'application/json'],
    ['css', 'text/css']
]);
const scriptParameters = parseKeyValue(process.argv.slice(2));
const port = scriptParameters.port && typeof scriptParameters.port === "number" ? scriptParameters.port : 8080;
http.createServer((req, res) => {
    const reqUrl = url.parse(req.url);
    const ext = reqUrl.href === '/' ? 'html' : reqUrl.pathname.split('.')[1];
    const fileName = reqUrl.href === '/' ? INDEX_PAGE : reqUrl.pathname.substr(1);
    const cType = contentTypes.get(ext);
    fs_1.readFile(fileName, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.write('Resource no found');
            }
            else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write('Server Error');
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': cType });
            res.write(data);
        }
        res.end();
    });
}).listen(port, () => {
    console.log(`Client is available at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map