const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const args = process.argv.slice(2);
const flag = args.indexOf('--port');
const port = Number(process.env.PORT || (flag >= 0 && args[flag + 1]) || 5173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'};
http.createServer((req,res)=>{
 let pathname;
 try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch {res.writeHead(400);res.end('Bad request');return;}
 const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
 if (!file.startsWith(root + path.sep) || !types[path.extname(file)]) {res.writeHead(404);res.end('Not found');return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]});res.end(data);});
}).listen(port,'0.0.0.0',()=>console.log(`Trial Salon Demo is running at http://localhost:${port}`));
