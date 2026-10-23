async function main(){
 const pages=await(await fetch('http://127.0.0.1:9223/json')).json();
 const page=pages.find(item=>item.type==='page');
 const ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('CDP open timeout')),3000);ws.addEventListener('open',()=>{clearTimeout(t);resolve()},{once:true});ws.addEventListener('error',reject,{once:true})});
 let id=0;const pending=new Map();ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(new Error(`${method} timed out`))},3000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}))});
 await call('Page.enable');await call('Runtime.enable');
 await call('Page.navigate',{url:'http://127.0.0.1:5180/'});
 await new Promise(resolve=>setTimeout(resolve,500));
 const result=await call('Runtime.evaluate',{expression:'({url:location.href,scrollY,header:document.querySelector(".header")?.getBoundingClientRect().toJSON(),background:getComputedStyle(document.querySelector(".header")).backgroundColor})',returnByValue:true});
 console.log(JSON.stringify(result.result.value));ws.close();
}
main().catch(error=>{console.error(error);process.exit(1)});
