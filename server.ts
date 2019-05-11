import * as http from 'http';
import {readFile} from 'fs';
import * as url from "url";
import * as parseKeyValue from "parse-key-value";

const INDEX_PAGE = 'index.html';
const contentTypes = new Map<string, string>([
    ['html', 'text/html'],
    ['js', 'text/javascript'],
    ['json', 'application/json'],
    ['css', 'text/css']
]);
const scriptParameters = parseKeyValue(process.argv.slice(2));
const port: number = scriptParameters.port && typeof scriptParameters.port === "number" ? scriptParameters.port : 8080;
http.createServer((req, res) => {
    const reqUrl = url.parse(req.url);
    const ext: string = reqUrl.href === '/' ? 'html' : reqUrl.pathname.split('.')[1];
    const fileName: string = reqUrl.href === '/' ? INDEX_PAGE : reqUrl.pathname.substr(1);
    const cType: string = contentTypes.get(ext);
    readFile(fileName, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Resource no found');
            } else {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write('Server Error');
            }
        } else {
            res.writeHead(200, {'Content-Type': cType});
            res.write(data);
        }
        res.end();
    });
}).listen(port, () => {
    console.log(`Client is available at http://localhost:${port}`);
});