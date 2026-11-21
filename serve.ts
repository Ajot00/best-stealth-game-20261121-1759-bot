import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('./game',import.meta.url))),port=Number(process.argv[2])||8080;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'};
createServer((req,res)=>{let path;try{path=decodeURIComponent(new URL(req.url||'/',`http://127.0.0.1:${port}`).pathname)}catch{res.writeHead(400).end();return}if(path.endsWith('/'))path+='index.html';const file=resolve(join(root,normalize(path)));if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return}let size;try{const s=statSync(file);if(!s.isFile())throw Error();size=s.size}catch{res.writeHead(404).end();return}res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','content-length':size,'cache-control':'no-store'});createReadStream(file).pipe(res)}).listen(port,'127.0.0.1');
