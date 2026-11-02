import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
const port=Number(process.env.PORT||3000);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  if(base&&pathname===base){res.writeHead(302,{Location:base+'/'});return res.end();}
  const relative=base&&pathname.startsWith(base+'/')?pathname.slice(base.length):base?null:pathname;
  try{
    if(relative===null)throw new Error();
    let target=path.resolve(root,'.'+relative);
    if(target!==root&&!target.startsWith(root+path.sep))throw new Error();
    if((await stat(target)).isDirectory()){
      if(!pathname.endsWith('/')){res.writeHead(301,{Location:pathname+'/'});return res.end();}
      target=path.join(target,'index.html');
    }
    const bytes=await readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(req.method==='HEAD'?undefined:await readFile(path.join(root,'404.html')));}
});
server.listen(port,'127.0.0.1',()=>console.log(`静态预览：http://127.0.0.1:${port}${base}/`));
