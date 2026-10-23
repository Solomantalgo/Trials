const fs=require('node:fs');
const path=require('node:path');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 const targets=await(await fetch('http://127.0.0.1:9225/json')).json();
 const target=targets.find(item=>item.type==='page'&&item.url.startsWith('http://127.0.0.1:5180/'));
 if(!target)throw Error('Preview tab was not found');
 const ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('CDP connection timed out')),5000);ws.addEventListener('open',()=>{clearTimeout(timer);resolve()},{once:true});ws.addEventListener('error',reject,{once:true})});
 let nextId=0;const pending=new Map();
 ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id&&pending.has(message.id)){const item=pending.get(message.id);clearTimeout(item.timer);pending.delete(message.id);message.error?item.reject(Error(message.error.message)):item.resolve(message.result)}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId,timer=setTimeout(()=>{pending.delete(id);reject(Error(`${method} timed out`))},8000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>{const response=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(response.exceptionDetails)throw Error(response.exceptionDetails.text);return response.result.value};
 await call('Page.enable');await call('Runtime.enable');fs.mkdirSync('screenshots',{recursive:true});
 const reports=[],errors=[];
 for(const width of [320,375,390,430,768,1366,1920]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<=430});
  await call('Page.navigate',{url:'http://127.0.0.1:5180/'});await sleep(750);
  const top=await evaluate(`(()=>{const h=document.querySelector('.header'),r=h.getBoundingClientRect(),l=h.querySelector('.brand-logo').getBoundingClientRect(),b=h.querySelector('.header-book').getBoundingClientRect(),m=h.querySelector('.menu-toggle').getBoundingClientRect();return {scrollY,innerWidth,headerTop:r.top,headerLeft:r.left,headerWidth:r.width,headerHeight:r.height,logoWidth:l.width,logoHeight:l.height,logoLoaded:h.querySelector('img').naturalWidth>0,bookWidth:b.width,bookHeight:b.height,menuWidth:m.width,menuHeight:m.height,menuDisplay:getComputedStyle(h.querySelector('.menu-toggle')).display,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
  if(top.scrollY!==0)errors.push(`${width}px initial scroll position was ${top.scrollY}`);
  if(width===375||width===1366)await capture(`nav-${width}-top.png`);
  await evaluate('window.scrollTo(0,300)');await sleep(280);
  const down=await evaluate(`({scrollY,compact:document.querySelector('.header').classList.contains('is-scrolled'),headerTop:document.querySelector('.header').getBoundingClientRect().top,headerHeight:document.querySelector('.header').getBoundingClientRect().height,background:getComputedStyle(document.querySelector('.header')).backgroundColor})`);
  await evaluate('window.scrollTo(0,10)');await sleep(80);const up=await evaluate(`({scrollY,compact:document.querySelector('.header').classList.contains('is-scrolled')})`);
  await evaluate('window.scrollTo(0,0)');await sleep(280);const returned=await evaluate(`({scrollY,compact:document.querySelector('.header').classList.contains('is-scrolled'),headerHeight:document.querySelector('.header').getBoundingClientRect().height})`);
  if(width===375||width===1366){await evaluate('window.scrollTo(0,300)');await sleep(280);await capture(`nav-${width}-scrolled.png`);await evaluate('window.scrollTo(0,0)');await sleep(280)}
  let menu=null,book=null;
  if(width<=430){
   await evaluate(`document.querySelector('.menu-toggle').click()`);await sleep(60);
   menu=await evaluate(`(()=>{const h=document.querySelector('.header'),n=document.querySelector('#navigation'),r=n.getBoundingClientRect(),a=n.querySelector('a');return {expanded:h.querySelector('.menu-toggle').getAttribute('aria-expanded'),display:getComputedStyle(n).display,panelTop:r.top,headerBottom:h.getBoundingClientRect().bottom,focusFirstLink:document.activeElement===a,linkHeight:a.getBoundingClientRect().height,menuIconBars:n.previousElementSibling?.querySelectorAll('i').length,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
   if(width===375)await capture('nav-375-menu-open.png');
   await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`);await sleep(30);
   menu.escape=await evaluate(`({expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded'),focusReturned:document.activeElement===document.querySelector('.menu-toggle')})`);
   if(width===375){await evaluate(`document.querySelector('.menu-toggle').click()`);await evaluate(`document.querySelector('.header-book').click()`);await sleep(180);book=await evaluate(`({hash:location.hash,bookingVisible:!!document.querySelector('.booking-page'),menuClosed:document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false'})`)}
  }
  reports.push({width,top,scrolled:down,scrollingUp:up,returned,menu,book});
 }
 const logs=await evaluate('({title:document.title})');
 console.log(JSON.stringify({reports,errors,logs},null,2));ws.close();if(errors.length)process.exitCode=1;
 async function capture(name){const image=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join('screenshots',name),Buffer.from(image.data,'base64'))}
}
main().catch(error=>{console.error(error);process.exitCode=1});
