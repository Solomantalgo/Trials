const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const args=process.argv.slice(2),portIndex=args.indexOf('--port');
const port=Number(process.env.PORT||(portIndex>=0?args[portIndex+1]:5175));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg'};
http.createServer((req,res)=>{let file;try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(__dirname,'.'+(pathname==='/'?'/index.html':pathname));}catch{res.writeHead(400);res.end();return;}if(!file.startsWith(__dirname+path.sep)||!mime[path.extname(file)]||file.endsWith('.test.cjs')){res.writeHead(404);res.end();return;}fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,err?{}:{'Content-Type':mime[path.extname(file)]});res.end(err?'Not found':data);});}).listen(port,'0.0.0.0',()=>console.log(`Trial Salon Advanced: http://localhost:${port}`));
