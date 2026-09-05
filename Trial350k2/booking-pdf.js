/* Structured local PDF generation. No screenshots, printing or remote services. */
const TrialRequestPDF=(()=>{
 const filename='trial-salon-booking-request.pdf',zone='Africa/Kampala';
 const clean=value=>String(value??'').normalize('NFC').replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'');
 const dateStamp=date=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replaceAll('-','');
 function reference(now=new Date()){
  const bytes=new Uint8Array(6);globalThis.crypto.getRandomValues(bytes);
  return 'TRIAL-'+dateStamp(now)+'-'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
 }
 function createDocument(jsPDF,font,request,service,generated=new Date()){
  if(!request.reference||!service||!/^\d{4}-\d{2}-\d{2}$/.test(request.date))throw Error('Complete the booking request first.');
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
  doc.addFileToVFS('NotoSans-Regular.ttf',font);doc.addFont('NotoSans-Regular.ttf','TrialSans','normal');
  doc.setProperties({title:'Trial Salon Demo — Booking Request',subject:'Demo request pending confirmation; not a confirmed appointment',author:'Trial Salon Demo',creator:'Trial Salon Demo'});
  const wine=[22,73,237],ink=[16,28,53],muted=[91,105,125],line=[220,224,232];
  const left=20,width=170,bottom=271;let y=0;
  const text=(value,x,at,size=10,color=ink,fontName='TrialSans')=>{doc.setFont(fontName,fontName==='helvetica'?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);doc.text(clean(value),x,at)};
  const rule=at=>{doc.setDrawColor(...line);doc.setLineWidth(.25);doc.line(left,at,190,at)};
  function page(first){
   if(!first)doc.addPage();
   if(first){doc.setFillColor(247,248,250);doc.rect(0,0,210,57,'F');text('TRIAL SALON DEMO',left,24,23,wine,'helvetica');text('BOOKING REQUEST',left,36,10,wine);text('Reference: '+request.reference,left,46,9,muted);text('DEMO / FICTIONAL BUSINESS',left,53,8,wine);y=64}
   else{text('TRIAL SALON DEMO / BOOKING REQUEST',left,21,10,wine);text('Reference: '+request.reference,left,29,8,muted);rule(34);y=45}
  }
  const ensure=height=>{if(y+height>bottom)page(false)};
  const wrap=(value,size=10,maxWidth=width)=>{doc.setFont('TrialSans','normal');doc.setFontSize(size);return doc.splitTextToSize(clean(value),maxWidth)};
  function paragraph(value,size=10,color=ink){for(const content of wrap(value,size)){ensure(5.3);text(content,left,y,size,color);y+=5.3}y+=2}
  function section(label,reserve=22){ensure(12+reserve);rule(y);y+=7;text(label,left,y,9,wine);y+=6}
  function field(label,value){ensure(14);text(label,left,y,8,muted);y+=6;paragraph(value)}
  function row(fields){
   const gap=9,column=(width-gap*(fields.length-1))/fields.length;
   const wrapped=fields.map(([,value])=>wrap(value,10,column));
   const height=6+Math.max(...wrapped.map(v=>v.length))*5.3+5;ensure(height);
   fields.forEach(([label],i)=>{const x=left+i*(column+gap);text(label,x,y,8,muted);wrapped[i].forEach((v,j)=>text(v,x,y+6+j*5.3))});y+=height;
  }
  page(true);
  section('SERVICE',27);paragraph(service.name,12);row([['Price','UGX '+service.price.toLocaleString('en-UG')],['Duration',service.duration],['Category',service.category]]);
  section('PREFERRED VISIT',26);
  const visitDate=new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'long',year:'numeric',timeZone:zone}).format(new Date(request.date+'T12:00:00Z'));
  row([['Date',visitDate],['Preferred time',request.time+' EAT (Kampala)']]);paragraph('Preferred time only — availability has not been confirmed.',9,muted);
  section('CUSTOMER DETAILS',22);row([['Name',request.name],['Phone',request.phone]]);
  if(request.email?.trim())field('Email',request.email);
  if(request.notes?.trim())field('Booking notes',request.notes);
  section('REQUEST STATUS',36);paragraph('REQUEST PENDING CONFIRMATION',10,wine);
  paragraph('This is a booking request and does not confirm an appointment.',10);
  paragraph('Demo only: no request has been sent to a salon, no availability checked and no payment made. In a real booking, the salon would confirm availability with the customer.',9,muted);
  section('GENERATED',10);
  paragraph(new Intl.DateTimeFormat('en-GB',{dateStyle:'long',timeStyle:'medium',timeZone:zone}).format(generated)+' EAT (Kampala)',9,muted);
  const pages=doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){doc.setPage(i);rule(280);text('DEMO BOOKING REQUEST · NOT A CONFIRMED APPOINTMENT',left,287,7,muted);text(i+' / '+pages,180,287,8,muted)}
  return doc;
 }
 let assets;
 function script(src){return new Promise((resolve,reject)=>{const tag=document.createElement('script');const timer=setTimeout(()=>{tag.remove();reject(Error('PDF assets could not be loaded. Please try again.'))},15000);tag.src=src;tag.onload=()=>{clearTimeout(timer);resolve()};tag.onerror=()=>{clearTimeout(timer);tag.remove();reject(Error('PDF assets could not be loaded. Please try again.'))};document.head.append(tag)})}
 async function download(request,service){
  if(!assets)assets=Promise.all([globalThis.jspdf?Promise.resolve():script('assets/vendor/jspdf.umd.min.js'),globalThis.TRIAL_PDF_FONT?Promise.resolve():script('assets/vendor/noto-sans.js')]).catch(error=>{assets=null;throw error});
  await assets;
  const doc=createDocument(globalThis.jspdf.jsPDF,globalThis.TRIAL_PDF_FONT,request,service);
  const url=URL.createObjectURL(doc.output('blob')),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 return {reference,createDocument,download,filename};
})();
if(typeof module!=='undefined')module.exports=TrialRequestPDF;
