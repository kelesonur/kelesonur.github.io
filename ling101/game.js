'use strict';
const COURSE_ID='101';
const WEEKS=[
{id:'1–2',topic:'Introduction & Phonetics (Genetti ch. 1–2)',ready:true,meetings:[{iso:'2026-09-21',time:'13:00–15:00',room:'NH002'},{iso:'2026-09-23',time:'13:00–15:00',room:'EF116'},{iso:'2026-09-28',time:'13:00–15:00',room:'NH002'},{iso:'2026-09-30',time:'13:00–15:00',room:'EF116'}]},
{id:'3–4',topic:'Phonology; Morphology begins (Genetti ch. 3–4). Assignment 1.',ready:false,meetings:[{iso:'2026-10-05',time:'13:00–15:00',room:'NH002'},{iso:'2026-10-07',time:'13:00–15:00',room:'EF116'},{iso:'2026-10-12',time:'13:00–15:00',room:'NH002'},{iso:'2026-10-14',time:'13:00–15:00',room:'EF116'}]},
{id:'4–5',topic:'Morphology (Genetti ch. 4). Mid-term #1?',ready:false,meetings:[{iso:'2026-10-12',time:'13:00–15:00',room:'NH002'},{iso:'2026-10-14',time:'13:00–15:00',room:'EF116'},{iso:'2026-10-19',time:'13:00–15:00',room:'NH002'},{iso:'2026-10-21',time:'13:00–15:00',room:'EF116'}]},
{id:'6–7',topic:'Syntax (Genetti ch. 5–6; Fromkin ch. 3 part 1). Assignment 2.',ready:false,meetings:[{iso:'2026-10-26',time:'13:00–15:00',room:'NH002'},{iso:'2026-10-28',note:'no class (Republic Day)'},{iso:'2026-11-02',time:'13:00–15:00',room:'NH002'},{iso:'2026-11-04',time:'13:00–15:00',room:'EF116'}]},
{id:'8–9',topic:'Syntax & Semantics (Fromkin ch. 3–4). Assignment 3. Mid-term #2?',ready:false,meetings:[{iso:'2026-11-09',time:'13:00–15:00',room:'NH002'},{iso:'2026-11-11',time:'13:00–15:00',room:'EF116'},{iso:'2026-11-16',time:'13:00–15:00',room:'NH002'},{iso:'2026-11-18',time:'13:00–15:00',room:'EF116'}]},
{id:'10–11',topic:'Pragmatics, Sociolinguistics, Discourse, Acquisition (Genetti ch. 8–11, 14). Assignment 4.',ready:false,meetings:[{iso:'2026-11-22'},{iso:'2026-11-25',time:'13:00–15:00',room:'EF116'},{iso:'2026-11-30',time:'13:00–15:00',room:'NH002'},{iso:'2026-12-02',time:'13:00–15:00',room:'EF116'}]},
{id:'12',topic:'Language Change & review (Genetti ch. 12–13). Final TBA.',ready:false,meetings:[{iso:'2026-12-07',time:'13:00–15:00',room:'NH002'},{iso:'2026-12-09',time:'13:00–15:00',room:'EF116'}]}
];
const PS12_ITEMS=[
{id:'handout',title:'PS Handout',blurb:'Slides for weeks 1–2.'},
{id:'mouth',title:'Build a Mouth Game',blurb:'Articulatory practice.'},
{id:'phonle',title:'Phonle Game',blurb:'IPA sound guessing.'}
];
const SCREENS=['home','start','material','office'];
const KEY='ling101-fall2026-v1';
const ADMIN_KEY='ling101-admin-code-v1';
const OH_AVAIL_KEY='ling-ta-office-avail-v1';
const OH_BOOK_KEY='ling-ta-office-bookings-v1';
const WEB3FORMS_ACCESS_KEY='c5e63062-8265-4af1-8e73-ee93d3dc6c8d';
const WEB3FORMS_ENDPOINT='https://api.web3forms.com/submit';
const EMAILJS_PUBLIC_KEY='3lYZ3IywfytlgVe3I';
const EMAILJS_SERVICE_ID='service_qqvyxba';
const EMAILJS_APPROVE_TEMPLATE='template_itvkdgj';
const EMAILJS_REJECT_TEMPLATE='template_zkcw19t';
const DAY_IDS=['mon','tue','wed','thu','fri'];
const DAY_LABEL={mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday'};
const DEFAULT_AVAIL={
 mon:{on:true,start:'09:00',end:'13:00'},
 tue:{on:true,start:'09:00',end:'13:00'},
 wed:{on:true,start:'09:00',end:'10:00'},
 thu:{on:true,start:'09:00',end:'12:00'},
 fri:{on:true,start:'09:00',end:'16:00'}
};

const MONTH_SHORT=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_OFFSET={mon:0,tue:1,wed:2,thu:3,fri:4};
const DAY_SHORT={mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri'};
function mondayOf(d=new Date()){
 const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());
 const dow=(x.getDay()+6)%7;
 x.setDate(x.getDate()-dow);
 return x;
}
function isoDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function currentWeekStart(){return isoDate(mondayOf());}
function dateForDayId(dayId,weekStartIso=currentWeekStart()){
 const [y,m,dd]=weekStartIso.split('-').map(Number);
 return new Date(y,m-1,dd+(DAY_OFFSET[dayId]||0));
}
function formatDayDate(dayId,weekStartIso=currentWeekStart()){
 const dt=dateForDayId(dayId,weekStartIso);
 return `${DAY_LABEL[dayId]} ${dt.getDate()} ${MONTH_SHORT[dt.getMonth()]}`;
}
function formatDayBtn(dayId,weekStartIso=currentWeekStart()){
 const dt=dateForDayId(dayId,weekStartIso);
 return `${DAY_SHORT[dayId]} ${dt.getDate()} ${MONTH_SHORT[dt.getMonth()]}`;
}
function formatWeekOf(weekStartIso=currentWeekStart()){
 const [y,m,dd]=weekStartIso.split('-').map(Number);
 const dt=new Date(y,m-1,dd);
 return `Week of ${dt.getDate()} ${MONTH_SHORT[dt.getMonth()]}`;
}
function slotStartDate(dayId,slot,weekStartIso=currentWeekStart()){
 const dt=dateForDayId(dayId,weekStartIso);
 const [h,mi]=String(slot||'0:0').split(':').map(Number);
 dt.setHours(h||0,mi||0,0,0);
 return dt;
}
function slotTooSoon(dayId,slot,weekStartIso=currentWeekStart(),now=new Date()){
 return slotStartDate(dayId,slot,weekStartIso).getTime()-now.getTime()<60*60*1000;
}
function slotUnavailable(dayId,slot,exceptId){
 return slotTaken(dayId,slot,exceptId)||slotTooSoon(dayId,slot);
}
function thisWeekBookings(){
 const week=currentWeekStart();
 return ohBookings.filter(b=>(b.weekStart||'')===week);
}
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=v=>JSON.parse(JSON.stringify(v));
const weekLabel=id=>id==='12'?`Week ${id}`:`Weeks ${id}`;
const weekMeta=id=>WEEKS.find(w=>w.id===id)||WEEKS[0];

let storageOK=true,admin=false;
let ohAvail=clone(DEFAULT_AVAIL),ohBookings=[],ohDraft={kind:'individual',day:'mon',slot:null,name:'',group:'',members:'',email:'',why:''},ohDecisionMsg='';
try{
 const rawA=JSON.parse(localStorage.getItem(OH_AVAIL_KEY));
 if(rawA&&typeof rawA==='object'){
  DAY_IDS.forEach(d=>{
   const row=rawA[d];
   if(row&&typeof row==='object')ohAvail[d]={on:!!row.on,start:typeof row.start==='string'?row.start:DEFAULT_AVAIL[d].start,end:typeof row.end==='string'?row.end:DEFAULT_AVAIL[d].end};
  });
 }
}catch(e){storageOK=false;}
try{
 const rawB=JSON.parse(localStorage.getItem(OH_BOOK_KEY));
 if(Array.isArray(rawB))ohBookings=rawB.filter(b=>b&&typeof b==='object'&&typeof b.id==='string');
}catch(e){storageOK=false;}

let state={weeks:'1–2',screen:'home',material:null};
try{
 const raw=JSON.parse(localStorage.getItem(KEY));
 if(raw&&SCREENS.includes(raw.screen)){
  state={weeks:raw.weeks||'1–2',screen:raw.screen==='material'?raw.screen:'home',material:PS12_ITEMS.some(i=>i.id===raw.material)?raw.material:null};
  if(!WEEKS.some(w=>w.id===state.weeks))state.weeks='1–2';
 }
}catch(e){storageOK=false;}
state.screen='home';
state.material=null;

function save(){
 try{localStorage.setItem(KEY,JSON.stringify({weeks:state.weeks,screen:state.screen==='material'?'start':state.screen,material:null}));}catch(e){storageOK=false;}
}
function loadOffice(){try{const rawA=JSON.parse(localStorage.getItem(OH_AVAIL_KEY));if(rawA&&typeof rawA==='object'){DAY_IDS.forEach(d=>{const row=rawA[d];if(row&&typeof row==='object')ohAvail[d]={on:!!row.on,start:typeof row.start==='string'?row.start:DEFAULT_AVAIL[d].start,end:typeof row.end==='string'?row.end:DEFAULT_AVAIL[d].end};});}}catch(e){storageOK=false;}try{const rawB=JSON.parse(localStorage.getItem(OH_BOOK_KEY));if(Array.isArray(rawB))ohBookings=rawB.filter(b=>b&&typeof b==='object'&&typeof b.id==='string');}catch(e){storageOK=false;}}
function saveOffice(){try{localStorage.setItem(OH_AVAIL_KEY,JSON.stringify(ohAvail));localStorage.setItem(OH_BOOK_KEY,JSON.stringify(ohBookings));}catch(e){storageOK=false;}}
function syncAdminBtn(){const b=$('adminBtn');if(!b)return;b.setAttribute('aria-pressed',String(admin));b.textContent=admin?'Admin on':'Admin';b.classList.toggle('admin-on',admin);}
function sectionNav(){
 const onBook=state.screen==='office';
 const onPs=state.screen==='start'||state.screen==='material';
 if(state.screen==='home')return '';
 return `<nav class="home-nav" aria-label="Sections"><button type="button" id="navBook" aria-pressed="${onBook}">Book appointment with TA</button><button type="button" id="navPs" aria-pressed="${onPs}">PS Material</button></nav>`;
}
function bindSectionNav(){
 if($('navBook'))$('navBook').onclick=()=>{state.screen='office';state.material=null;save();render();focusMain();};
 if($('navPs'))$('navPs').onclick=()=>{state.screen='start';state.material=null;save();render();focusMain();};
}
function homeScreen(){
 $('app').innerHTML=`<section class="landing"><h1 class="site-title"><span class="title-line">LING101 Fall 2026</span><span class="title-line title-course"><span class="course-keep">Introduction to Language</span> <span class="course-tail">and Linguistics I</span></span></h1><div class="landing-tabs"><button type="button" id="goBook">Book appointment with TA</button><button type="button" id="goPs">PS Material</button></div></section>`;
 $('goBook').onclick=()=>{state.screen='office';save();render();focusMain();};
 $('goPs').onclick=()=>{state.screen='start';save();render();focusMain();};
}
function render(){
 syncAdminBtn();
 if(state.screen==='home')homeScreen();
 else if(state.screen==='office')officeScreen();
 else if(state.screen==='material')materialScreen();
 else startScreen();
}
function focusMain(){window.scrollTo({top:0,behavior:'instant'});const h=$('app').querySelector('h1,h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}

const DOW_SHORT=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function formatClassMeeting(m){
 const [y,mo,d]=String(m.iso||'').split('-').map(Number);
 const dt=new Date(y,mo-1,d);
 const head=`${DOW_SHORT[dt.getDay()]} ${dt.getDate()} ${MONTH_SHORT[dt.getMonth()]}`;
 if(m.note)return `${head} · ${m.note}`;
 if(m.time&&m.room)return `${head} · ${m.time} · ${m.room}`;
 return head;
}
function classMeetingsHtml(meetings){
 if(!meetings||!meetings.length)return '';
 return `<ul class="class-meetings">${meetings.map(m=>`<li>${esc(formatClassMeeting(m))}</li>`).join('')}</ul>`;
}
function weekPicker(){
 return `<section class="week-picker" aria-label="Choose weeks"><h2>Weeks</h2><div class="week-options">${WEEKS.map(w=>`<button type="button" data-weeks="${esc(w.id)}" aria-pressed="${state.weeks===w.id}" class="${state.weeks===w.id?'selected':''}">${weekLabel(w.id)}<small>${w.ready?'Ready':'To be added'}</small></button>`).join('')}</div></section>`;
}
function bindWeekPicker(){
 document.querySelectorAll('[data-weeks]').forEach(button=>{
  button.onclick=()=>{
   state.weeks=button.dataset.weeks;
   state.material=null;
   if(state.screen==='material')state.screen='start';
   save();render();
  };
 });
}

function startScreen(){
 if(!WEEKS.some(w=>w.id===state.weeks))state.weeks='1–2';
 const meta=weekMeta(state.weeks);
 if(!meta.ready){
  $('app').innerHTML=sectionNav()+weekPicker()+`<section class="week-empty" aria-live="polite"><h1>${weekLabel(state.weeks)}</h1>${classMeetingsHtml(meta.meetings)}<p>${esc(meta.topic)}</p><p class="muted">To be added.</p></section>`;
  bindSectionNav();bindWeekPicker();
  return;
 }
 $('app').innerHTML=sectionNav()+weekPicker()+`<section class="intro ps-intro"><div><span class="eyebrow">LING101 · PS</span><h1>${weekLabel(state.weeks)}</h1>${classMeetingsHtml(meta.meetings)}<p class="muted">${esc(meta.topic)}</p></div><section class="setup material-picker" aria-label="PS activities"><h2>Activities</h2><div class="mode-buttons material-choices">${PS12_ITEMS.map(item=>`<button type="button" data-material="${esc(item.id)}">${esc(item.title)}<small>${esc(item.blurb)}</small></button>`).join('')}</div>${!storageOK?'<p class="storage-warning">Storage unavailable.</p>':''}</section></section>`;
 bindSectionNav();bindWeekPicker();
 document.querySelectorAll('[data-material]').forEach(btn=>{
  btn.onclick=()=>{state.material=btn.dataset.material;state.screen='material';render();focusMain();};
 });
}

function materialScreen(){
 const item=PS12_ITEMS.find(i=>i.id===state.material)||PS12_ITEMS[0];
 let body='';
 if(item.id==='handout'){
  body=`<div class="embed-toolbar"><a class="primary" href="materials/ps1.pdf" target="_blank" rel="noopener noreferrer">Open PDF</a></div><iframe class="material-frame pdf-frame" title="PS1 handout" src="materials/ps1.pdf#view=FitH"></iframe>`;
 }else if(item.id==='mouth'){
  body=`<iframe class="material-frame game-frame" title="Build a Mouth Game" src="games/build-a-mouth.html" allow="autoplay"></iframe>`;
 }else{
  body=`<iframe class="material-frame game-frame" title="Phonle Game" src="games/phonle.html" allow="autoplay"></iframe>`;
 }
 $('app').innerHTML=sectionNav()+`<section class="material-view"><div class="material-head"><button type="button" id="backPs">← Weeks 1–2</button><h1>${esc(item.title)}</h1></div>${body}</section>`;
 bindSectionNav();
 $('backPs').onclick=()=>{state.screen='start';state.material=null;save();render();focusMain();};
}

async function hashCode(text){
 const data=new TextEncoder().encode(text);
 const buf=await crypto.subtle.digest('SHA-256',data);
 return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function adminDialog(mode){
 const gate=$('adminGate');
 gate.innerHTML=`<form method="dialog" id="adminForm"><div class="dialog-head"><h2 id="adminGateTitle">${mode==='set'?'Set admin code':'Admin'}</h2><button type="button" id="closeAdmin" value="cancel">Close</button></div><p>${mode==='set'?'Choose a code for this browser.':'Enter your admin code.'}</p><label for="adminCode">Code</label><input id="adminCode" type="password" autocomplete="current-password" required minlength="4"><p id="adminError" class="storage-warning" hidden></p><div class="edit-actions"><button class="primary" type="submit">${mode==='set'?'Save code':'Unlock'}</button>${mode==='unlock'?`<button type="button" id="resetAdminCode">Reset code</button>`:''}</div></form>`;
 gate.showModal();
 $('closeAdmin').onclick=()=>gate.close();
 $('adminCode').focus();
 if($('resetAdminCode'))$('resetAdminCode').onclick=()=>{if(confirm('Remove the saved admin code on this browser?')){localStorage.removeItem(ADMIN_KEY);gate.close();adminDialog('set');}};
 $('adminForm').onsubmit=async ev=>{
  ev.preventDefault();
  const code=$('adminCode').value;
  const err=$('adminError');
  if(code.length<4){err.hidden=false;err.textContent='Use at least 4 characters.';return;}
  const hashed=await hashCode(code);
  if(mode==='set'){
   try{localStorage.setItem(ADMIN_KEY,hashed);}catch(e){storageOK=false;err.hidden=false;err.textContent='Could not save code.';return;}
   admin=true;gate.close();render();focusMain();return;
  }
  const stored=localStorage.getItem(ADMIN_KEY);
  if(hashed!==stored){err.hidden=false;err.textContent='Incorrect code.';$('adminCode').select();return;}
  admin=true;gate.close();if(state.screen==='home')state.screen='office';render();focusMain();
 };
}
function toggleAdmin(){
 if(admin){admin=false;render();return;}
 const stored=localStorage.getItem(ADMIN_KEY);
 adminDialog(stored?'unlock':'set');
}

function toMinutes(hhmm){const [h,m]=String(hhmm||'').split(':').map(Number);return (h||0)*60+(m||0);}
function fromMinutes(n){const h=Math.floor(n/60),m=n%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;}
function slotsForDay(day){
 const row=ohAvail[day];
 if(!row||!row.on)return [];
 const start=toMinutes(row.start),end=toMinutes(row.end);
 if(!(end>start))return [];
 const out=[];
 for(let t=start;t+30<=end;t+=30)out.push(fromMinutes(t));
 return out;
}
function slotTaken(day,slot,exceptId){
 const week=currentWeekStart();
 return ohBookings.some(b=>b.day===day&&b.slot===slot&&b.status!=='declined'&&(b.weekStart||'')===week&&b.id!==exceptId);
}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
function bookingLabel(b){
 const day=formatDayDate(b.day,b.weekStart||currentWeekStart());
 const when=`${day} ${b.slot}–${fromMinutes(toMinutes(b.slot)+30)}`;
 const course=b.course?`LING${b.course}`:'';
 const who=b.kind==='group'?b.members:b.name;
 return `${course?course+' · ':''}${when} · ${who}`;
}
function bookingWhen(b){
 const week=b.weekStart||currentWeekStart();
 const day=formatDayDate(b.day,week);
 const time=`${b.slot}–${fromMinutes(toMinutes(b.slot)+30)}`;
 return {day,time,slotStart:b.slot};
}
function notifyMessage(b){
 const {day,time,slotStart}=bookingWhen(b);
 const who=b.kind==='group'?`Members: ${b.members}`:`Name: ${b.name}`;
 return [
  'LING101 office hour request',
  '',
  `Course: LING101`,
  `Type: ${b.kind}`,
  who,
  `Day: ${day}`,
  `Time: ${time}`,
  `Contact: ${b.email}`,
  `Why: ${b.why||''}`,
  '',
  'Reply to the student from this email. Suggested replies:',
  `Approved: Your office hour on ${day} at ${slotStart} is approved. Office: JF311, John Freely Hall, South Campus, inside the Department of Linguistics.`,
  `Rejected: Your office hour request for ${day} at ${slotStart} is not approved.`
 ].join('\n');
}
async function sendBookingNotice(b){
 const fd=new FormData();
 const studentEmail=b.email;
 const displayName=b.kind==='group'?b.members:b.name;
 fd.append('access_key',WEB3FORMS_ACCESS_KEY);
 fd.append('name',displayName);
 fd.append('email',studentEmail);
 fd.append('subject','LING101 office hour request');
 fd.append('from_name','LING101 office hours');
 fd.append('replyto',studentEmail);
 fd.append('message',notifyMessage(b));
 const res=await fetch(WEB3FORMS_ENDPOINT,{method:'POST',body:fd});
 let data=null;
 try{data=await res.json();}catch(e){data=null;}
 const text=typeof data?.message==='string'?data.message:(res.ok?'OK':`HTTP ${res.status}`);
 const success=res.ok&&(data?.success===true||data?.success==='true');
 return {ok:success,status:res.status,data,text};
}

function initEmailJS(){
 if(typeof emailjs==='undefined'||!emailjs?.init||!emailjs?.send)return false;
 if(!initEmailJS.ready){
  emailjs.init({publicKey:EMAILJS_PUBLIC_KEY});
  initEmailJS.ready=true;
 }
 return true;
}
function studentDisplayName(b){return b.kind==='group'?b.members:b.name;}
async function sendStudentDecision(b,kind,reason){
 if(!initEmailJS())return {ok:false,text:'EmailJS failed to load.'};
 const studentEmail=(b.email||'').trim();
 if(!validEmail(studentEmail))return {ok:false,text:'Booking has no valid student email.'};
 const {day,slotStart}=bookingWhen(b);
 // Templates use {{email}} in To Email (EmailJS contact-form convention); also pass to_email.
 const params={
  to_email:studentEmail,
  email:studentEmail,
  name:studentDisplayName(b),
  day,
  time:slotStart
 };
 if(kind==='reject')params.reason=reason;
 const templateId=kind==='approve'?EMAILJS_APPROVE_TEMPLATE:EMAILJS_REJECT_TEMPLATE;
 try{
  const res=await emailjs.send(EMAILJS_SERVICE_ID,templateId,params);
  return {ok:true,status:res?.status,text:res?.text||'OK'};
 }catch(e){
  const text=e?.text||e?.message||String(e);
  return {ok:false,status:e?.status,text};
 }
}

function officeScreen(){
 loadOffice();
 if(!DAY_IDS.includes(ohDraft.day)||!ohAvail[ohDraft.day]?.on)ohDraft.day=DAY_IDS.find(d=>ohAvail[d].on)||'mon';
 const slots=slotsForDay(ohDraft.day);
 const week=currentWeekStart();
 if(ohDraft.slot&&(slotUnavailable(ohDraft.day,ohDraft.slot)||!slots.includes(ohDraft.slot)))ohDraft.slot=null;
 const nameField=ohDraft.kind==='individual'
  ?`<div class="book-field"><label for="ohName">Name</label><input id="ohName" maxlength="80" required value="${esc(ohDraft.name)}" autocomplete="name"></div>`
  :`<div class="book-field book-members"><label for="ohMembers">Members</label><textarea id="ohMembers" maxlength="400" rows="2" required placeholder="Comma-separated names">${esc(ohDraft.members)}</textarea></div>`;
 const studentForm=`<section class="book-panel">
 <p class="week-line">${esc(formatWeekOf(week))}</p>
 <div class="book-kind" role="group" aria-label="Booking type">
  <button type="button" id="ohInd" aria-pressed="${ohDraft.kind==='individual'}" class="${ohDraft.kind==='individual'?'selected':''}">Individual</button>
  <button type="button" id="ohGroup" aria-pressed="${ohDraft.kind==='group'}" class="${ohDraft.kind==='group'?'selected':''}">Group</button>
 </div>
 <div class="book-row">${nameField}<div class="book-field"><label for="ohEmail">Email</label><input id="ohEmail" type="email" maxlength="120" required value="${esc(ohDraft.email)}" autocomplete="email"></div></div>
 <div class="book-field"><label for="ohWhy">Why do you want to meet?</label><textarea id="ohWhy" maxlength="280" rows="3" required>${esc(ohDraft.why)}</textarea></div>
 <div class="book-block"><span class="book-label">Day</span><div class="day-tabs" role="group" aria-label="Day">${DAY_IDS.map(d=>{
  const on=!!ohAvail[d]?.on;
  const sel=ohDraft.day===d;
  return `<button type="button" data-oh-day="${d}" class="${sel?'selected':''}" ${on?'':'disabled'} aria-pressed="${sel}">${esc(formatDayBtn(d,week))}</button>`;
 }).join('')}</div></div>
 <div class="book-block"><span class="book-label">Time</span><div class="slot-grid" role="group" aria-label="Time">${slots.length?slots.map(s=>{
  const blocked=slotUnavailable(ohDraft.day,s);
  const sel=ohDraft.slot===s;
  return `<button type="button" data-oh-slot="${s}" class="${sel?'selected':''}${blocked?' taken':''}" ${blocked?'disabled':''} aria-pressed="${sel}">${s}</button>`;
 }).join(''):'<span class="muted">No open slots.</span>'}</div></div>
 <button class="primary book-submit" type="button" id="ohBook">Request this time</button>
 <p id="ohStatus" class="book-status" role="status"></p>
 </section>`;

 const adminPanel=admin?`<section class="office-card admin-panel"><h2>Availability</h2>
 ${DAY_IDS.map(d=>{
  const row=ohAvail[d];
  return `<div class="avail-row"><label><input type="checkbox" data-av-on="${d}" ${row.on?'checked':''}> ${DAY_LABEL[d].slice(0,3)}</label><span></span><input type="time" data-av-start="${d}" value="${esc(row.start)}" ${row.on?'':'disabled'}><input type="time" data-av-end="${d}" value="${esc(row.end)}" ${row.on?'':'disabled'}></div>`;
 }).join('')}
 <div class="edit-actions"><button class="primary" type="button" id="ohSaveAvail">Save hours</button><button type="button" id="ohResetAvail">Reset defaults</button></div>
 <p id="ohAvailStatus" class="mailto-note" role="status"></p>
 <h2 style="margin-top:28px">This week’s requests</h2>
 <p class="mailto-note">Shared across LING101 / 313 / 411. Approve and Reject email the student via EmailJS.</p>
 <p id="ohDecisionStatus" class="book-status" role="status">${esc(ohDecisionMsg)}</p>
 <div class="booking-list">${ohBookings.length?ohBookings.slice().reverse().map(b=>`<div class="booking-item" data-booking-id="${esc(b.id)}"><div class="status ${esc(b.status)}">${esc(b.status)}</div><p>${esc(bookingLabel(b))}</p><p class="muted">${esc(b.email)}</p>${b.why?`<p>${esc(b.why)}</p>`:''}${b.rejectReason?`<p class="muted">Reject reason: ${esc(b.rejectReason)}</p>`:''}${b.status==='pending'?`<div class="book-field reject-field"><label for="reject-${esc(b.id)}">Reject reason</label><input id="reject-${esc(b.id)}" data-reject-reason="${esc(b.id)}" maxlength="200" placeholder="Required to reject"></div><div class="edit-actions"><button type="button" class="primary" data-approve="${esc(b.id)}">Approve</button><button type="button" data-decline="${esc(b.id)}">Reject</button></div>`:''}
 <div class="edit-actions"><button type="button" class="danger" data-clear="${esc(b.id)}">Clear</button></div>
 </div>`).join(''):'<p class="muted">No requests yet.</p>'}</div>
 </section>`:'';

 $('app').innerHTML=sectionNav()+`<section class="office"><h1>Book appointment with TA</h1><p class="office-place">JF311, John Freely Hall, South Campus, inside the Department of Linguistics</p><div class="office-layout">${studentForm}${adminPanel}</div></section>`;
 bindSectionNav();
 $('ohInd').onclick=()=>{readOfficeDraft();ohDraft.kind='individual';render();};
 $('ohGroup').onclick=()=>{readOfficeDraft();ohDraft.kind='group';render();};
 document.querySelectorAll('[data-oh-day]').forEach(b=>b.onclick=()=>{if(b.disabled)return;readOfficeDraft();ohDraft.day=b.dataset.ohDay;ohDraft.slot=null;render();});
 document.querySelectorAll('[data-oh-slot]').forEach(b=>b.onclick=()=>{if(b.disabled)return;readOfficeDraft();ohDraft.slot=b.dataset.ohSlot;render();});
 $('ohBook').onclick=bookOffice;
 if(admin){
  document.querySelectorAll('[data-av-on]').forEach(cb=>cb.onchange=()=>{const d=cb.dataset.avOn;ohAvail[d].on=cb.checked;document.querySelector(`[data-av-start="${d}"]`).disabled=!cb.checked;document.querySelector(`[data-av-end="${d}"]`).disabled=!cb.checked;});
  $('ohSaveAvail').onclick=()=>{
   DAY_IDS.forEach(d=>{
    ohAvail[d].on=document.querySelector(`[data-av-on="${d}"]`).checked;
    ohAvail[d].start=document.querySelector(`[data-av-start="${d}"]`).value||DEFAULT_AVAIL[d].start;
    ohAvail[d].end=document.querySelector(`[data-av-end="${d}"]`).value||DEFAULT_AVAIL[d].end;
   });
   saveOffice();$('ohAvailStatus').textContent='Hours saved for all courses in this browser.';
  };
  $('ohResetAvail').onclick=()=>{ohAvail=clone(DEFAULT_AVAIL);saveOffice();render();};
  document.querySelectorAll('[data-approve]').forEach(btn=>btn.onclick=async()=>{
   const b=ohBookings.find(x=>x.id===btn.dataset.approve);if(!b||b.status!=='pending')return;
   const statusEl=$('ohDecisionStatus');
   btn.disabled=true;
   ohDecisionMsg='Emailing student…';
   if(statusEl)statusEl.textContent=ohDecisionMsg;
   const result=await sendStudentDecision(b,'approve');
   if(result.ok){
    b.status='approved';
    saveOffice();
    ohDecisionMsg='Approved. The student was emailed.';
    render();
   }else{
    ohDecisionMsg=`Email was not sent${result.text?`: ${result.text}`:'.'}${result.status?` (${result.status})`:''} Status left pending.`;
    if(statusEl)statusEl.textContent=ohDecisionMsg;
    btn.disabled=false;
   }
  });
  document.querySelectorAll('[data-decline]').forEach(btn=>btn.onclick=async()=>{
   const b=ohBookings.find(x=>x.id===btn.dataset.decline);if(!b||b.status!=='pending')return;
   const reasonEl=document.querySelector(`[data-reject-reason="${CSS.escape?CSS.escape(b.id):b.id}"]`)||document.getElementById(`reject-${b.id}`);
   const reason=(reasonEl?.value||'').trim();
   const statusEl=$('ohDecisionStatus');
   if(!reason){
    ohDecisionMsg='Enter a short reject reason.';
    if(statusEl)statusEl.textContent=ohDecisionMsg;
    reasonEl?.focus();
    return;
   }
   btn.disabled=true;
   ohDecisionMsg='Emailing student…';
   if(statusEl)statusEl.textContent=ohDecisionMsg;
   const result=await sendStudentDecision(b,'reject',reason);
   if(result.ok){
    b.status='declined';
    b.rejectReason=reason;
    saveOffice();
    ohDecisionMsg='Rejected. The student was emailed.';
    render();
   }else{
    ohDecisionMsg=`Email was not sent${result.text?`: ${result.text}`:'.'}${result.status?` (${result.status})`:''} Status left pending.`;
    if(statusEl)statusEl.textContent=ohDecisionMsg;
    btn.disabled=false;
   }
  });
  document.querySelectorAll('[data-clear]').forEach(btn=>btn.onclick=()=>{
   ohBookings=ohBookings.filter(x=>x.id!==btn.dataset.clear);saveOffice();render();
  });
 }
}

function readOfficeDraft(){
 if($('ohName'))ohDraft.name=$('ohName').value;
 if($('ohMembers'))ohDraft.members=$('ohMembers').value;
 if($('ohEmail'))ohDraft.email=$('ohEmail').value;
 if($('ohWhy'))ohDraft.why=$('ohWhy').value;
}
async function bookOffice(){
 readOfficeDraft();
 const status=$('ohStatus');
 const btn=$('ohBook');
 if(ohDraft.kind==='individual'&&!ohDraft.name.trim()){status.textContent='Enter your name.';return;}
 if(ohDraft.kind==='group'&&!ohDraft.members.trim()){status.textContent='Enter the member names.';return;}
 if(!validEmail(ohDraft.email.trim())){status.textContent='Enter a valid contact email.';return;}
 if(!ohDraft.why.trim()){status.textContent='Write a short explanation of why you want to meet.';return;}
 if(!ohDraft.slot||!slotsForDay(ohDraft.day).includes(ohDraft.slot)){status.textContent='Choose an open slot.';return;}
 if(slotTooSoon(ohDraft.day,ohDraft.slot)){status.textContent='That slot is within the next hour or already past.';return;}
 if(slotTaken(ohDraft.day,ohDraft.slot)){status.textContent='That slot is taken.';return;}
 const booking={
  id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
  course:COURSE_ID,
  kind:ohDraft.kind,
  name:ohDraft.kind==='individual'?ohDraft.name.trim():'',
  group:'',
  members:ohDraft.kind==='group'?ohDraft.members.trim():'',
  email:ohDraft.email.trim(),
  why:ohDraft.why.trim(),
  day:ohDraft.day,
  slot:ohDraft.slot,
  weekStart:currentWeekStart(),
  status:'pending',
  created:new Date().toISOString(),
  notice:'pending'
 };
 ohBookings.push(booking);
 saveOffice();
 ohDraft.slot=null;
 ohDraft.why='';
 btn.disabled=true;
 status.textContent='Sending notice to TA…';
 try{
  const result=await sendBookingNotice(booking);
  if(result.ok){
   booking.notice='sent';
   status.textContent='Request saved. Notice sent to the TA.';
  }else{
   booking.notice='failed';
   status.textContent=`Request saved here. The TA notice was not sent${result.text?`: ${result.text}`:'.'}`;
  }
  saveOffice();
 }catch(e){
  booking.notice='failed';
  saveOffice();
  status.textContent=`Request saved here. The TA notice was not sent${e&&e.message?`: ${e.message}`:'.'}`;
 }
 btn.disabled=false;
 render();
}

$('adminBtn').onclick=toggleAdmin;
$('brand').onclick=e=>{e.preventDefault();state.screen='home';state.material=null;save();render();focusMain();};
render();
