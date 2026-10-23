const fs=require('node:fs');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 const pages=await(await fetch('http://127.0.0.1:9225/json')).json(),page=pages.find(item=>item.type==='page'&&item.url.startsWith('http://127.0.0.1:5180/'));
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('CDP open timeout')),4000);ws.addEventListener('open',()=>{clearTimeout(t);resolve()},{once:true});ws.addEventListener('error',reject,{once:true})});
 let id=0;const pending=new Map();ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value};
 await call('Page.enable');await call('Runtime.enable');await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 const results=[];
 for(const width of [375,1366]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<700});await call('Page.navigate',{url:'http://127.0.0.1:5180/'});await sleep(700);
  const top=await evaluate(`({scrollY,headerHeight:document.querySelector('.header').getBoundingClientRect().height,serviceNavTop:getComputedStyle(document.querySelector('.category-navigation')).top,overflow:document.documentElement.scrollWidth>innerWidth})`);
  await evaluate(`document.querySelector('.header nav a[href="#services"]').click()`);await sleep(100);
  await evaluate(`(()=>{const h=document.querySelector('.header'),w=document.querySelector('.category-navigation');window.scrollTo({top:window.scrollY+w.getBoundingClientRect().top-h.getBoundingClientRect().height-1,behavior:'instant'})})()`);await sleep(180);
  const pinned=await evaluate(`(()=>{const h=document.querySelector('.header'),w=document.querySelector('.category-navigation');return {scrollY,headerCompact:h.classList.contains('is-scrolled'),headerBottom:h.getBoundingClientRect().bottom,barTop:w.getBoundingClientRect().top,stickyTop:getComputedStyle(w).top,barHeight:w.getBoundingClientRect().height}})()`);
  if(width===375){const image=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('screenshots/services-sticky-mobile.png',Buffer.from(image.data,'base64'))}
  await evaluate(`document.querySelectorAll('.category-tabs a')[1].click()`);await sleep(180);
  const selected=await evaluate(`(()=>{const h=document.querySelector('.header'),w=document.querySelector('.category-navigation'),target=document.querySelector('.service-category');return {hash:location.hash,headerBottom:h.getBoundingClientRect().bottom,barTop:w.getBoundingClientRect().top,barBottom:w.getBoundingClientRect().bottom,targetTop:target.getBoundingClientRect().top,selected:document.querySelector('.category-tabs a[aria-current="location"]')?.dataset.category,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
  if(width===1366){const image=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('screenshots/services-sticky-desktop.png',Buffer.from(image.data,'base64'))}
  results.push({width,top,pinned,selected});
 }
 console.log(JSON.stringify(results,null,2));ws.close();
}
main().catch(error=>{console.error(error);process.exitCode=1});
