/* Pure appointment rules. Repository can be replaced by an API adapter. */
const BookingCore=(()=>{
 const config=typeof DATA!=='undefined'?DATA:require('./data.js');
 const service=id=>config.services.find(s=>s.id===id);
 const stylist=id=>config.stylists.find(s=>s.id===id);
 const money=n=>'UGX '+n.toLocaleString('en-UG');
 const today=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:config.salon.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const addDays=(date,n)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
 const minutes=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
 const time=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
 const dateLabel=date=>new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'long',year:'numeric',timeZone:config.salon.timezone});
 const compatible=(professional,category)=>professional.categories.includes(category);
 const inRange=(date,now=new Date())=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date))&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date&&date>=today(now)&&date<=addDays(today(now),config.booking.horizonDays);
 function professionals(serviceId,preferred='any'){const s=service(serviceId);return s?config.stylists.filter(p=>compatible(p,s.category)&&(preferred==='any'||p.id===preferred)):[]}
 function slots({serviceId,stylistId='any',date,excludeId},records=[],now=new Date()){
  const s=service(serviceId);if(!s||!inRange(date,now))return [];
  const day=new Date(date+'T12:00:00Z').getUTCDay();const open=day===0?600:540,close=day===0?960:1140;
  const staff=professionals(serviceId,stylistId).filter(p=>p.days.includes(day));
  const result=[];
  for(let start=open;start+s.minutes<=close;start+=config.booking.interval){
   if(new Date(`${date}T${time(start)}:00+03:00`)<=now)continue;
   const available=staff.filter(p=>{
    // Fixed synthetic commitments demonstrate realistic gaps. Never real salon data.
    const synthetic=p.id==='amara'?[[780,840]]:p.id==='daniel'?[[720,750]]:[];
    const busy=[...synthetic,...records.filter(r=>r.id!==excludeId&&r.status==='demo-scheduled'&&r.professional.id===p.id&&r.date===date).map(r=>[minutes(r.time),minutes(r.time)+r.service.minutes])];
    return !busy.some(([a,b])=>start<b&&start+s.minutes>a);
   });
   if(available.length)result.push({time:time(start),end:time(start+s.minutes),professionals:available.map(p=>p.id)});
  }
  return result;
 }
 function validRecord(r){return !!(r&&r.schemaVersion===1&&typeof r.id==='string'&&typeof r.reference==='string'&&config.booking.statuses.includes(r.status)&&service(r.service?.id)&&Number.isFinite(r.service.minutes)&&r.service.minutes>0&&stylist(r.professional?.id)&&typeof r.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&typeof r.time==='string'&&/^\d{2}:\d{2}$/.test(r.time)&&r.customer&&typeof r.customer.name==='string'&&typeof r.customer.phone==='string'&&typeof r.customer.email==='string'&&typeof r.notes==='string')}
 function repository(storage){let memory=[],warning='';return {
  load(){try{const raw=storage.getItem(config.booking.storageKey);if(raw===null)return memory;const parsed=JSON.parse(raw);if(Array.isArray(parsed))for(const r of parsed){const id=({nalia:"nakato",imani:"aisha"})[r?.professional?.id]||r?.professional?.id;const p=stylist(id);if(p)r.professional={id:p.id,name:p.name}}if(!Array.isArray(parsed)||!parsed.every(validRecord))throw Error('Invalid data');memory=parsed;warning='';return [...memory]}catch{warning='Browser storage is unavailable or unreadable. Changes can only be kept in this page session.';return [...memory]}},
  save(records){memory=[...records];try{storage.setItem(config.booking.storageKey,JSON.stringify(records));warning='';return {persisted:true}}catch{warning='Browser storage is unavailable. This appointment is kept only until this page is closed or refreshed.';return {persisted:false}}},
  get warning(){return warning}
 }}
 // Payment status is independent of the scheduling status. Only a salon/provider
 // could later move submitted to confirmed; this browser never does so.
 const paymentStatuses=['awaiting_payment','submitted','confirmed','completed','cancelled'];
 const validPhone=value=>typeof value==='string'&&/^[+0-9() .-]{7,20}$/.test(value)&&value.replace(/\D/g,'').length>=7;
 function paymentQuote(price,type){const percentage=config.demoPaymentConfig.depositPercentage;if(!Number.isFinite(percentage)||percentage<=0||percentage>100)throw Error('The deposit configuration needs attention.');const amount=type==='full'?price:Math.round(price*percentage/100);return {serviceTotal:price,paymentAmount:amount,balanceRemaining:price-amount}}
 function paymentError(d){if(!['deposit','full'].includes(d.paymentType))return 'Choose a deposit or full payment.';const ref=d.paymentReference?.trim()||'';if(!/^[A-Za-z0-9][A-Za-z0-9-]{5,39}$/.test(ref)||(!/[A-Za-z]/.test(ref)&&ref.length<10)||!/[0-9]/.test(ref)||/^(.)\1+$/.test(ref))return 'Enter a 6–40 character transaction reference using letters and numbers (or at least 10 digits), or fill a sample reference.';if(!validPhone(d.paymentPhone))return 'Enter a payment phone number with at least 7 digits (up to 20 characters).';return ''}
 const paymentKeys=['paymentType','serviceTotal','paymentAmount','balanceRemaining','paymentProvider','paymentReference','paymentPhone','paymentStatus','paymentSubmittedAt','depositPercentage'];
 function paymentRecord(d,s,now,existing){if(existing?.paymentStatus){const saved=Object.fromEntries(paymentKeys.map(k=>[k,existing[k]]));return {...saved,paymentPriceReviewRequired:s.price!==saved.serviceTotal||s.id!==existing.service.id}}
 const error=paymentError(d);if(error)throw Error(error);return {...paymentQuote(s.price,d.paymentType),paymentType:d.paymentType,paymentProvider:config.demoPaymentConfig.provider,paymentReference:d.paymentReference.trim(),paymentPhone:d.paymentPhone.trim(),paymentStatus:'submitted',paymentSubmittedAt:now.toISOString(),depositPercentage:config.demoPaymentConfig.depositPercentage,paymentPriceReviewRequired:false}}
 function appointmentRecord(r){const {customer,notes,paymentPhone,...record}=r;return {...record,disclaimer:'DEMONSTRATION ONLY — PAYMENT NOT VERIFIED',paymentChoice:r.paymentType==='full'?'Full':r.paymentType==='deposit'?'Deposit':'Not recorded',paymentStatusLabel:r.paymentStatus?'Awaiting verification':'Not recorded'}}
 function shareMessage(r){return `Trial Salon Demo appointment\nBooking reference: ${r.reference}\n${r.service.name} with ${r.professional.name}\n${dateLabel(r.date)}, ${r.time}–${r.endTime} EAT\nAppointment: ${r.status==='cancelled'?'Cancelled':'Demo scheduled'}${r.paymentStatus?`\nPayment option: ${r.paymentType==='full'?'Full':'Deposit'}\nAmount submitted: ${money(r.paymentAmount)}\nPayment reference: ${r.paymentReference}\nPayment status: Awaiting verification${r.paymentPriceReviewRequired?'\nService price change: salon review required':''}`:''}\nDEMONSTRATION ONLY — PAYMENT NOT VERIFIED. No real salon reservation or payment.`}
 function create(draft,records,now=new Date(),existing){const s=service(draft.serviceId);if(!s)throw Error('Please choose a service.');const choice=slots({...draft,excludeId:existing?.id},records,now).find(t=>t.time===draft.time);if(!choice)throw Error('That demo time is no longer available. Please choose another time.');const p=stylist(choice.professionals[0]);if(!draft.name?.trim()||!validPhone(draft.phone))throw Error('Please enter your name and a valid phone number.');const id=existing?.id||(globalThis.crypto?.randomUUID?.()||'demo-'+now.getTime()+'-'+Math.random().toString(36).slice(2));return {...paymentRecord(draft,s,now,existing),schemaVersion:1,id,reference:existing?.reference||'TR-'+id.replace(/-/g,'').slice(-8).toUpperCase(),status:'demo-scheduled',source:'browser-demo',createdAt:existing?.createdAt||now.toISOString(),updatedAt:now.toISOString(),timezone:config.salon.timezone,service:{id:s.id,name:s.name,category:s.category,price:s.price,minutes:s.minutes},professional:{id:p.id,name:p.name},date:draft.date,time:draft.time,endTime:choice.end,customer:{name:draft.name.trim(),phone:draft.phone.trim(),email:draft.email?.trim()||''},notes:draft.notes?.trim()||''}}
 function calendar(r){const esc=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const stamp=t=>new Date(`${r.date}T${t}:00+03:00`).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Trial Salon//Demo Appointment//EN','BEGIN:VEVENT',`UID:${r.id}@trial-salon.example`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART:${stamp(r.time)}`,`DTEND:${stamp(r.endTime)}`,`SUMMARY:${esc('DEMO — '+r.service.name)}`,`DESCRIPTION:${esc('Fictional appointment only. No real salon reservation. Reference '+r.reference+'. Professional: '+r.professional.name)}`,'STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR',''].join('\r\n')}
 return {paymentStatuses,validPhone,paymentQuote,paymentError,appointmentRecord,shareMessage,service,stylist,money,today,addDays,minutes,time,dateLabel,professionals,slots,inRange,validRecord,repository,create,calendar};
})();
if(typeof module!=='undefined')module.exports=BookingCore;
