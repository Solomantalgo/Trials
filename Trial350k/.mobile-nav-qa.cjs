const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 const browser=await chromium.launch({headless:true});
 const errors=[];
 const reports=[];
 const views=[320,375,390,430,768,1366,1920];
 fs.mkdirSync('screenshots',{recursive:true});
 try{
  for(const width of views){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   page.on('pageerror',error=>errors.push(`${width}px: ${error.message}`));
   await page.goto('http://127.0.0.1:5180/',{waitUntil:'domcontentloaded'});
   await page.waitForTimeout(300);
   const top=await page.evaluate(()=>({scrollY,headerTop:document.querySelector('.header').getBoundingClientRect().top,headerHeight:document.querySelector('.header').getBoundingClientRect().height,headerWidth:document.querySelector('.header').getBoundingClientRect().width,logoLoaded:document.querySelector('.header .brand-logo img').naturalWidth>0,logoSrc:document.querySelector('.header .brand-logo img').getAttribute('src'),overflow:document.documentElement.scrollWidth>innerWidth,bookText:document.querySelector('.book-label').textContent.trim()}));
   await page.evaluate(()=>window.scrollTo(0,300));await page.waitForTimeout(260);
   const scrolled=await page.evaluate(()=>({scrollY,headerTop:document.querySelector('.header').getBoundingClientRect().top,headerHeight:document.querySelector('.header').getBoundingClientRect().height,compact:document.querySelector('.header').classList.contains('is-scrolled'),background:getComputedStyle(document.querySelector('.header')).backgroundColor,bookBox:(()=>{const r=document.querySelector('.header-book').getBoundingClientRect();return {width:r.width,height:r.height}})(),menuBox:(()=>{const r=document.querySelector('.menu-toggle').getBoundingClientRect();return {width:r.width,height:r.height}})(),overflow:document.documentElement.scrollWidth>innerWidth}));
   await page.evaluate(()=>window.scrollTo(0,10));await page.waitForTimeout(80);
   const up=await page.evaluate(()=>({scrollY,compact:document.querySelector('.header').classList.contains('is-scrolled')}));
   await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(260);
   const returned=await page.evaluate(()=>({scrollY,compact:document.querySelector('.header').classList.contains('is-scrolled'),headerHeight:document.querySelector('.header').getBoundingClientRect().height}));
   if(width===375||width===1366){await page.screenshot({path:path.join('screenshots',`nav-${width}-top.png`)});await page.evaluate(()=>window.scrollTo(0,300));await page.waitForTimeout(260);await page.screenshot({path:path.join('screenshots',`nav-${width}-scrolled.png`)});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(260)}
   let menu=null,book=null;
   if(width<=430){
    const toggle=page.locator('.menu-toggle');
    await toggle.click();await page.waitForTimeout(80);
    menu=await page.evaluate(()=>{const h=document.querySelector('.header'),n=document.querySelector('#navigation'),r=n.getBoundingClientRect(),hr=h.getBoundingClientRect(),a=n.querySelector('a');return {expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded'),display:getComputedStyle(n).display,panelTop:r.top,headerBottom:hr.bottom,focusFirstLink:document.activeElement===a,linkHeight:a.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth}});
    if(width===375)await page.screenshot({path:path.join('screenshots','nav-375-menu-open.png')});
    await page.keyboard.press('Escape');await page.waitForTimeout(50);
    const closed=await page.evaluate(()=>({expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded'),focusReturned:document.activeElement===document.querySelector('.menu-toggle')}));
    await toggle.click();await page.locator('.header-book').click();await page.waitForTimeout(150);
    book=await page.evaluate(()=>({hash:location.hash,menuClosed:document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false',bookingVisible:!!document.querySelector('.booking-page')}));
    menu.closed=closed;
   }
   reports.push({width,top,scrolled,scrollingUp:up,returned,menu,book});
   await page.close();
  }
  console.log(JSON.stringify({reports,errors},null,2));
  if(errors.length)process.exitCode=1;
 }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exit(1)});
