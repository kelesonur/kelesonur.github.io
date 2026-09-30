'use strict';
const ROOMS=[
{name:'Articulatory description',short:'Articulation',symbol:'[ ]',intro:'Identify the properties of consonants and vowels.',debrief:'Does changing one articulatory property always produce a different word?'},
{name:'Evidence for contrast',short:'Contrast',symbol:'/ /',intro:'Evaluate minimal pairs and the conclusions they support.',debrief:'What does a minimal pair establish? What does failing to find one leave unresolved?'},
{name:'Allophonic distribution',short:'Distribution',symbol:'ʰ',intro:'Describe distributions and apply rules to new data.',debrief:'Why did we distinguish word-final position from syllable-final position within a word?'},
{name:'Velar and palatal stops',short:'Analysis',symbol:'c',intro:'Combine distributional evidence with evidence for contrast.',debrief:'How can predictable variation in one environment coexist with contrast in another?'}];
const BASE_CASES=[
{title:'Describe [d]',data:'[d] — the first sound in dilbilim',q:'Complete the articulatory description.',type:'fields',fields:[['Voicing',['Voiced','Voiceless'],0],['Place of articulation',['Dental','Bilabial','Velar'],0],['Manner of articulation',['Fricative','Stop','Nasal'],1]],reasons:['The vocal folds vibrate, with complete oral closure at the dental place of articulation.','The lips close and air passes through the nose.','Air passes continuously through a narrow oral constriction.'],r:0,hint:'Separate the three questions: vocal-fold activity, location of constriction, and degree of constriction.',explain:'In the handout, [d] is a voiced dental oral stop. The three selected properties describe voicing, place, and manner; oral is also part of its full description.',source:'W1 handout-b · pp. 4–5, 7',talk:'Produce [t] instead. Which property changes?'},
{title:'Compare two vowels',data:'kıl: ı     /     kil: i',q:'Select ALL dimensions on which the two vowels differ.',type:'multi',options:['Height','Backness','Rounding'],answer:[1],reasons:['Both are high and unrounded; ı is back and i is front.','ı is low and i is high; both are front.','ı is rounded and i is unrounded; both are back.'],r:0,hint:'Check height, backness, and rounding separately.',explain:'In the W1 chart, both vowels are high and unrounded. They differ in backness. Here ı is the Turkish orthographic letter; its IPA counterpart is [ɯ].',source:'W1 handout-b · pp. 6–7',talk:'Which dimension distinguishes ü from i?'},
{title:'Oral and nasal airflow',data:'[m]     ↔     [b]',q:'Which movement opens the nasal passage for [m]?',type:'choice',options:['Lowering the velum','Raising the velum','Stopping vocal-fold vibration','Opening the lips completely'],answer:0,reasons:['A lowered velum allows airflow through the nasal cavity.','All voiced sounds are nasal.','Bilabial sounds permit airflow only through the mouth.'],r:0,hint:'Both sounds involve lip closure and vocal-fold vibration. Consider the velum.',explain:'The velum is lowered for [m], allowing nasal airflow, and raised for [b]. Both sounds are voiced and bilabial. [m] is nasal; [b] is an oral stop.',source:'W1 handout-b · pp. 3–5',talk:'What happens if you gently close your nose while producing [m]?'},
{title:'Broad and narrow transcription',data:'kuş     [kuʃ]     [kʰuʃ]',q:'How do the two transcriptions differ?',type:'choice',options:['The first is broader; the second includes more phonetic detail.','They represent two words with different meanings.','ʰ marks vowel length.','Square brackets indicate ordinary spelling.'],answer:0,reasons:['A narrower transcription can represent aspiration explicitly.','IPA merely replaces the letters of an alphabet.','Adding a symbol necessarily adds a phoneme.'],r:0,hint:'Broad and narrow refer to the amount of phonetic detail represented.',explain:'[kuʃ] is broader; [kʰuʃ] explicitly marks aspiration. The superscript ʰ is a diacritic for aspiration, not an additional segment.',source:'W1 handout-a · p. 3',talk:'How does this example qualify the claim that Turkish is pronounced exactly as it is written?'},
{title:'Choose a minimal pair',data:'Hypothesis: [p] and [b] represent distinct phonemes in Turkish.',q:'Which minimal pair supports the hypothesis?',type:'choice',options:['kapak – kabak','kapak – tabak','pil – bal','para – burun'],answer:0,reasons:['Only one sound differs, in the same position, and the meanings differ.','Having the same number of syllables is sufficient.','Any difference in spelling establishes a minimal pair.'],r:0,hint:'Align the segments and count the differences.',explain:'kapak “lid” and kabak “zucchini” differ only in [p] versus [b] in the same environment. This supports a /p/–/b/ contrast. The other pairs differ in more than one segment.',source:'W2 presentation-a · p. 1',talk:'Which articulatory property distinguishes [p] and [b] here?'},
{title:'Identify the contrastive property',data:'kas “muscle”     /     kaz “goose”\nsil “erase”      /     zil “bell”',q:'Which property do both pairs test?',type:'choice',options:['Voicing','Aspiration','Vowel height','Nasality'],answer:0,reasons:['[s] and [z] share place and manner but differ in voicing.','Each pair compares a stop and a fricative.','The meanings remain the same, so the difference is only phonetic.'],r:0,hint:'Produce [ssss] and [zzzz] while gently touching your larynx.',explain:'[s] is voiceless and [z] is voiced. These minimal pairs show that this distinction can differentiate meanings in Turkish. A contrastive property need not distinguish every possible pair of sounds.',source:'W1 handout-b · p. 3',talk:'How would af–av test the same hypothesis?'},
{title:'Evaluate an inference',data:'Data: [kʰ]ar and [k]ar refer to the same word, kar “snow”.\nClaim: “An audible difference always means two phonemes.”',q:'Which objection is best supported?',type:'choice',options:['A phonetic difference alone does not establish phonemic contrast.','Sounds written with the same letter must always be the same phoneme.','Aspiration cannot distinguish meaning in any language.','If meaning is unchanged, the sounds are phonetically identical.'],answer:0,reasons:['We must also examine the function and distribution of the difference in the language.','The alphabet determines the phonemic analysis on its own.','A property must have the same function in every language.'],r:0,hint:'The handout compares aspiration in Turkish and Eastern Armenian.',explain:'Aspiration is a real phonetic difference. In this Turkish example it does not create a meaning contrast. The handout’s Eastern Armenian comparison illustrates that the same property can be contrastive in another language.',source:'W1 handout-b · p. 3; W2 presentation-a · p. 1',talk:'What distributional questions would you ask before proposing an allophonic analysis?'},
{title:'Recognize insufficient evidence',data:'A researcher has not yet found a minimal pair for two sounds,\nlabelled X and Y. No other evidence is available.',q:'Which conclusion is justified at this stage?',type:'choice',options:['More evidence is needed about their distributions and potential contrasts.','They must be allophones of the same phoneme.','They must be separate phonemes.','The sounds cannot occur in the language.'],answer:0,reasons:['Not having found evidence for contrast does not demonstrate the absence of contrast.','Failure to find a minimal pair always establishes free variation.','Phonemes can be investigated only in word-initial position.'],r:0,hint:'Distinguish “not found yet” from “does not exist”.',explain:'This applies the handout’s observation–hypothesis–test approach to a new situation. With the stated evidence alone, neither phonemic contrast nor allophony has been established.',source:'W1 handout-b · p. 3; W2 presentation-a · pp. 1–2',talk:'Which word positions and sound environments would you investigate next?'},
{title:'Classify /p/ realizations',data:'Target /p/: pat · kapak · kapla · top',q:'Assign each realization using the W2 aspiration model.',type:'fields',fields:[['pat · initial /p/',['[pʰ]','[p]'],0],['kapak · medial /p/',['[pʰ]','[p]'],0],['kapla · /p/',['[pʰ]','[p]'],1],['top · final /p/',['[pʰ]','[p]'],0]],reasons:['[p] occurs syllable-finally within a word; [pʰ] occurs in the other listed positions.','[p] occurs in all syllable-final positions, including word-finally.','Only the rounding of an adjacent vowel determines aspiration.'],r:0,hint:'Distinguish kap.la from top. W2 lists word-final position separately.',explain:'In the course model, pat is word-initial, ka.pak is syllable-initial, kap.la is syllable-final within a word, and top is word-final. The expected sequence is [pʰ], [pʰ], [p], [pʰ]. This applies the slides’ model, not a universal claim about every speaking context.',source:'W2 presentation-a · p. 2',talk:'Why is “no aspiration syllable-finally” an incomplete summary of these data?'},
{title:'Choose a distributional rule',data:'[tʰ]aş · a[tʰ]a · a[tʰ]\na[t]la',q:'Which rule best summarizes this dataset?',type:'choice',options:['/t/ → [t] / __ $ within a word; [tʰ] in the other given positions','/t/ → [tʰ] / __ $ within a word; [t] in the other given positions','/t/ → [t] only word-initially','/t/ → [tʰ] only after back vowels'],answer:0,reasons:['The /t/ in at.la is syllable-final within the word; the other examples occupy different positions.','The /t/ in at and atla occurs in exactly the same environment.','taş and ata cannot fall under the same rule because their first letters differ.'],r:0,hint:'$ marks a syllable boundary; __ marks the position of the target segment.',explain:'W2 treats [t] in word-internal syllable-final position and [tʰ] in the other given positions as realizations of /t/. The distribution supports an allophonic analysis in the course model.',source:'W2 presentation-a · pp. 1, 3',talk:'Is extending this rule to /p/ a new hypothesis or an observation?'},
{title:'Predict a new example',data:'Prediction task: etki\nSyllabification is supplied: et.ki',q:'What does the W2 distribution predict for this /t/?',type:'choice',options:['Unaspirated [t]','Aspirated [tʰ]','Voiced [d]','Deletion of the consonant'],answer:0,reasons:['The /t/ is syllable-final inside the word.','Every stop after a front vowel becomes voiced.','All stops in two-syllable words are aspirated.'],r:0,hint:'Apply the stated environment rather than relying on a memorized word.',explain:'In et.ki, /t/ ends the first syllable but is not word-final. Extending the W2 distribution predicts [t]. This is a model-based prediction; no recording is being evaluated here.',source:'W2 presentation-a · p. 3; application of the stated rule',talk:'What recording and comparison would let you test this prediction?'},
{title:'Distinguish phoneme and allophone',data:'Proposed analysis: “Turkish /t/ and /tʰ/ are separate\nphonemes because aspiration distinguishes meaning.”',q:'Which revision matches the course analysis?',type:'choice',options:['The phoneme /t/ has the allophones [t] and [tʰ].','The phoneme [t] has the letters /t/ and /tʰ/.','/t/ and /d/ are allophones of the same phoneme.','Aspiration is a vowel property.'],answer:0,reasons:['Aspiration is predictable in the stated distribution and does not establish a [t]–[tʰ] meaning contrast.','Their shared spelling is sufficient evidence.','Their articulations are identical in every respect.'],r:0,hint:'Use / / for phonemes and [ ] for phonetic realizations.',explain:'W2 analyzes [t] and [tʰ] as allophones of /t/. The phonetic difference is real, but it is not contrastive in these data. Orthography alone does not establish the analysis.',source:'W2 presentation-a · pp. 1–3',talk:'How does tut–dut provide a different kind of evidence for /t/ and /d/?'},
{title:'Compare places of articulation',data:'kalem     /     kel\nTarget: the initial consonant written k',q:'Match each consonant to its place of articulation in W2’s notation.',type:'fields',fields:[['kalem · first sound',['Velar [kʰ]','Palatal [cʰ]'],0],['kel · first sound',['Velar [kʰ]','Palatal [cʰ]'],1]],reasons:['In these regular examples, back versus front vowel context is associated with velar versus palatal realization.','The letter k requires the same place of articulation in every word.','Both consonants are bilabial.'],r:0,hint:'a is back; e is front. IPA [c] is not the sound represented by Turkish orthographic c.',explain:'W2 uses velar [kʰ] for the initial consonant of kalem and palatal [cʰ] for that of kel. IPA [c] is a voiceless palatal stop; it should not be confused with [dʒ], represented by the letter c in Turkish spelling.',source:'W1 handout-b · p. 4; W2 presentation-a · pp. 3–4',talk:'Do voicing and manner remain constant while place changes?'},
{title:'Combine two conditions',data:'W2 model: place of articulation + aspiration\nkol     /     ekmek (ek.mek)\nTarget: the first k in each word',q:'Predict both properties for each target consonant.',type:'fields',fields:[['kol · first k',['[kʰ] velar, aspirated','[k] velar, unaspirated','[cʰ] palatal, aspirated','[c] palatal, unaspirated'],0],['ek.mek · first k',['[kʰ] velar, aspirated','[k] velar, unaspirated','[cʰ] palatal, aspirated','[c] palatal, unaspirated'],3]],reasons:['Vowel context conditions place; the stated syllable and word positions condition aspiration.','A front vowel always requires aspiration.','An unaspirated stop must be velar.'],r:0,hint:'First determine place. Then check whether the consonant is syllable-final within the word.',explain:'For kol, the back vowel context and word-initial position predict [kʰ]. The first /k/ in ek.mek follows a front vowel and is syllable-final within the word: W2 predicts [c]. Two conditions must be tracked separately.',source:'W2 presentation-a · pp. 3–4; application of the stated rules',talk:'What does the W2 model predict for the second k in ekmek? ([cʰ])'},
{title:'Test a generalization',data:'Hypothesis: “Palatal [cʰ] occurs only near front vowels.”\nNew datum: kâr [cʰɑɾ̥]',q:'How does the new datum affect the hypothesis?',type:'choice',options:['It contradicts it: [cʰ] occurs before the back vowel [ɑ].','It confirms it: [ɑ] is a front vowel.','It is irrelevant because only letters should be examined.','It establishes that every Turkish k is palatal.'],answer:0,reasons:['One valid example outside the stated condition can refute an “only” claim.','An exception must automatically be excluded from the dataset.','New data should not be compared with an existing hypothesis.'],r:0,hint:'The regular front-vowel distribution does not account for every occurrence of a palatal stop.',explain:'In kâr, [cʰ] occurs before back [ɑ]. A front-vowel-only account therefore cannot cover all the data. This counterexample does not by itself complete the analysis; the next problem supplies contrastive evidence.',source:'W2 presentation-a · p. 4',talk:'How could you restrict or revise the original hypothesis?'},
{title:'Support a phonemic analysis',data:'kar “snow”     [kʰɑɾ̥]\nkâr “profit”   [cʰɑɾ̥]',q:'Which conclusion is supported by the transcriptions given in W2?',type:'choice',options:['/k/ and /c/ can be analyzed as distinct phonemes in this environment.','Aspiration alone accounts for the meaning difference.','Both initial consonants are velar.','The only difference is vowel length.'],answer:0,reasons:['[kʰ] and [cʰ] occur in the same remaining sound environment and distinguish meanings.','The circumflex alone determines the phoneme inventory without sound evidence.','There is no contrast because [cʰ] occurs only before front vowels.'],r:0,hint:'Compare the two transcriptions segment by segment. Both initial stops are aspirated.',explain:'In the slides’ kar–kâr pair, aspiration and the remaining sound environment are held constant; the initial stop differs in place. W2 uses this as evidence for a /k/–/c/ contrast. Keep this contrastive evidence distinct from predictable palatal realizations near front vowels.',source:'W2 presentation-a · p. 4',talk:'Does predictable variation in one environment prevent contrast in another?'}
];

const WEEKS=[
{id:'1–2',topic:'Sound inventory'},
{id:'3–4',topic:'Length & phonotactics'},
{id:'4–5',topic:'Alternations & processes'},
{id:'6–7',topic:'Stress & morphology'},
{id:'8–9',topic:'Word formation'},
{id:'10–11',topic:'Verbal inflection'},
{id:'12',topic:'Nominalization'}
];
const SCREENS=['home','start','play','break','results','library','edit','office'];
const KEY='ling313-phonology-en-v1';
const EDIT_KEY='ling313-case-edits-v1';
const ADMIN_KEY='ling313-admin-code-v1';
const OH_AVAIL_KEY='ling313-oh-avail-v1';
const OH_BOOK_KEY='ling313-oh-book-v1';
const TA_EMAIL='onur.keles1@bogazici.edu.tr';
// Web3Forms access key is public by design (alias for the TA inbox).
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
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=v=>JSON.parse(JSON.stringify(v));
const weekLabel=id=>id==='12'?`Week ${id}`:`Weeks ${id}`;
const weekMeta=id=>WEEKS.find(w=>w.id===id)||WEEKS[0];
const rotate=(items,shift)=>items.map((_,k)=>items[(k+shift)%items.length]);

function applyRotation(c,i){
 if(c.options){const shift=(i*3+1)%c.options.length;c.options=rotate(c.options,shift);c.answer=Array.isArray(c.answer)?c.answer.map(a=>(a-shift+c.options.length)%c.options.length):(c.answer-shift+c.options.length)%c.options.length;}
 const shift=(i+1)%c.reasons.length;c.reasons=rotate(c.reasons,shift);c.r=(c.r-shift+c.reasons.length)%c.reasons.length;
 return c;
}
function buildCases(edits){
 return BASE_CASES.map((base,i)=>{
  const c=clone(base);
  const e=edits?.[i];
  if(e){
   ['title','data','q','hint','explain','source','talk'].forEach(k=>{if(typeof e[k]==='string')c[k]=e[k];});
   if(Array.isArray(e.reasons)&&e.reasons.length===c.reasons.length)c.reasons=e.reasons.map(String);
   if(c.type==='fields'&&Array.isArray(e.fields))c.fields=c.fields.map((f,fi)=>[typeof e.fields[fi]?.[0]==='string'?e.fields[fi][0]:f[0],Array.isArray(e.fields[fi]?.[1])?e.fields[fi][1].map(String):f[1],Number.isInteger(e.fields[fi]?.[2])?e.fields[fi][2]:f[2]]);
   else if(Array.isArray(e.options)&&e.options.length===c.options.length){
    c.options=e.options.map(String);
    if(c.type==='multi'&&Array.isArray(e.answer))c.answer=e.answer.filter(n=>Number.isInteger(n));
    else if(Number.isInteger(e.answer))c.answer=e.answer;
   }
   if(Number.isInteger(e.r))c.r=e.r;
   c.edited=true;
  }
  return applyRotation(c,i);
 });
}

let edits={},storageOK=true,admin=false,editIndex=0,CASES=buildCases();
let ohAvail=clone(DEFAULT_AVAIL),ohBookings=[],ohDraft={kind:'individual',day:'mon',slot:null,name:'',group:'',members:'',email:'',why:''},ohDecisionMsg='';
try{edits=JSON.parse(localStorage.getItem(EDIT_KEY))||{};if(typeof edits!=='object'||Array.isArray(edits))edits={};}catch(e){edits={};storageOK=false;}
CASES=buildCases(edits);
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

let state={weeks:'1–2',screen:'home',mode:'team',team:'',index:0,answers:[]},draft={};
try{
 const raw=JSON.parse(localStorage.getItem(KEY));
 if(raw&&Array.isArray(raw.answers)&&raw.answers.length<=16&&SCREENS.includes(raw.screen)&&Number.isInteger(raw.index)&&raw.index>=0&&raw.index<16){
  state={weeks:raw.weeks||'1–2',screen:raw.screen,mode:raw.mode==='class'?'class':'team',team:typeof raw.team==='string'?raw.team:'',index:raw.index,answers:raw.answers};
  if(!WEEKS.some(w=>w.id===state.weeks))state.weeks='1–2';
 }
}catch(e){storageOK=false;}
state.screen='home';

function save(){
 const persistScreen=['library','edit'].includes(state.screen)?'start':state.screen;
 try{localStorage.setItem(KEY,JSON.stringify({weeks:state.weeks,screen:persistScreen,mode:state.mode,team:state.team,index:state.index,answers:state.answers}));}catch(e){storageOK=false;}
}
function saveEdits(){try{localStorage.setItem(EDIT_KEY,JSON.stringify(edits));}catch(e){storageOK=false;}}
function saveOffice(){try{localStorage.setItem(OH_AVAIL_KEY,JSON.stringify(ohAvail));localStorage.setItem(OH_BOOK_KEY,JSON.stringify(ohBookings));}catch(e){storageOK=false;}}
function score(){return state.answers.reduce((s,a)=>s+(a?.points||0),0);}
function roomScore(i){return state.answers.slice(i*4,i*4+4).reduce((s,a)=>s+(a?.points||0),0);}
function resetDraft(){draft={answer:[],fields:[],reason:null,hint:false};}
function syncAdminBtn(){const b=$('adminBtn');if(!b)return;b.setAttribute('aria-pressed',String(admin));b.textContent=admin?'Admin on':'Admin';b.classList.toggle('admin-on',admin);}
function sectionNav(){
 const onBook=state.screen==='office';
 const onPs=['start','play','break','results','library','edit'].includes(state.screen);
 if(state.screen==='home')return '';
 return `<nav class="home-nav" aria-label="Sections"><button type="button" id="navBook" aria-pressed="${onBook}">Book appointment with TA</button><button type="button" id="navPs" aria-pressed="${onPs}">PS Material</button></nav>`;
}
function bindSectionNav(){
 if($('navBook'))$('navBook').onclick=()=>{state.screen='office';save();render();focusMain();};
 if($('navPs'))$('navPs').onclick=()=>{state.screen='start';save();render();focusMain();};
}
function homeScreen(){
 $('app').innerHTML=`<section class="landing"><h1 class="site-title"><span class="title-line">LING313 Fall 2026</span><span class="title-line title-course"><span class="course-keep">Phonology and Morphology</span> <span class="course-tail">of Turkish</span></span><span class="title-line title-ta"><a href="https://kelesonur.github.io/" target="_blank" rel="noopener noreferrer">TA: Onur Keleş</a></span></h1><div class="landing-tabs"><button type="button" id="goBook">Book appointment with TA</button><button type="button" id="goPs">PS Material</button></div></section>`;
 $('goBook').onclick=()=>{state.screen='office';save();render();focusMain();};
 $('goPs').onclick=()=>{state.screen='start';save();render();focusMain();};
}
function render(){
 syncAdminBtn();
 if(state.screen==='home')homeScreen();
 else if(state.screen==='office')officeScreen();
 else if(state.screen==='start')startScreen();
 else if(state.screen==='break')breakScreen();
 else if(state.screen==='results')resultsScreen();
 else if(state.screen==='library')libraryScreen();
 else if(state.screen==='edit')editScreen();
 else playScreen();
}
function focusMain(){window.scrollTo({top:0,behavior:'instant'});const h=$('app').querySelector('h1,h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}

function weekPicker(){
 return `<section class="week-picker" aria-label="Choose weeks"><h2>Weeks</h2><div class="week-options">${WEEKS.map(w=>`<button type="button" data-weeks="${esc(w.id)}" aria-pressed="${state.weeks===w.id}" class="${state.weeks===w.id?'selected':''}">${weekLabel(w.id)}<small>${w.id==='1–2'?'Ready':'To be added'}</small></button>`).join('')}</div></section>`;
}
function bindWeekPicker(){
 document.querySelectorAll('[data-weeks]').forEach(button=>{
  button.onclick=()=>{
   if($('teamName'))state.team=$('teamName').value;
   state.weeks=button.dataset.weeks;
   if(state.screen==='library'||state.screen==='edit')state.screen='start';
   save();render();
  };
 });
}

function startScreen(){
 if(!WEEKS.some(w=>w.id===state.weeks))state.weeks='1–2';
 const meta=weekMeta(state.weeks);
 if(state.weeks!=='1–2'){
  $('app').innerHTML=sectionNav()+weekPicker()+`<section class="week-empty" aria-live="polite"><h1>${weekLabel(state.weeks)}</h1><p>${esc(meta.topic)}</p><p class="muted">To be added.</p>${admin?`<div class="wide-actions"><button type="button" id="openLibrary">All questions</button></div>`:''}</section>`;
  bindSectionNav();bindWeekPicker();
  if(admin)$('openLibrary').onclick=()=>{state.screen='library';render();focusMain();};
  return;
 }
 $('app').innerHTML=sectionNav()+weekPicker()+`<section class="intro"><div><span class="eyebrow">LING313 · PS</span><h1>Phonology and Morphology <span class="accent">of Turkish</span></h1><p class="muted">${esc(meta.topic)}</p></div><section class="setup" aria-label="Session setup"><h2>Format</h2><div class="mode-buttons"><button type="button" id="teamMode" class="${state.mode==='team'?'selected':''}" aria-pressed="${state.mode==='team'}">Team<small>One device</small></button><button type="button" id="classMode" class="${state.mode==='class'?'selected':''}" aria-pressed="${state.mode==='class'}">Projector<small>Whole class</small></button></div><label for="teamName">${state.mode==='class'?'Class name':'Team name'}</label><input id="teamName" maxlength="35" placeholder="Optional" value="${esc(state.team)}" autocomplete="off"><button class="primary" type="button" id="startBtn">${state.answers.length?'Resume':'Start'}</button>${admin?`<button type="button" id="openLibrary" style="width:100%;margin-top:10px">All questions</button><button type="button" id="resetPractice" class="danger" style="width:100%;margin-top:10px">Reset session</button>`:''}${!storageOK?'<p class="storage-warning">Storage unavailable.</p>':''}</section></section><section class="rooms" aria-label="Four rounds">${ROOMS.map((r,i)=>`<div class="room-card"><span class="room-number">0${i+1}</span><h3>${r.name}</h3></div>`).join('')}</section>`;
 bindSectionNav();bindWeekPicker();
 $('teamMode').onclick=()=>{state.team=$('teamName').value;state.mode='team';save();render();};
 $('classMode').onclick=()=>{state.team=$('teamName').value;state.mode='class';save();render();};
 $('startBtn').onclick=()=>{state.team=$('teamName').value.trim();state.screen=state.answers.length===16?'results':'play';resetDraft();save();render();focusMain();};
 if(admin){
  $('openLibrary').onclick=()=>{state.screen='library';render();focusMain();};
  $('resetPractice').onclick=()=>{if(confirm('Clear practice progress?')){state={weeks:state.weeks,screen:'start',mode:state.mode,team:state.team,index:0,answers:[]};resetDraft();save();render();focusMain();}};
 }
}

function optionHTML(options,selected,group,locked){
 return `<div class="options">${options.map((o,i)=>`<button type="button" class="option ${selected.includes(i)?'selected':''}" data-${group}="${i}" aria-pressed="${selected.includes(i)}" ${locked?'disabled':''}><span class="key">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
}

function playScreen(){
 const c=CASES[state.index];
 if(!c){$('app').innerHTML='<p>Problem missing. Reload.</p>';return;}
 const room=Math.floor(state.index/4),n=state.index%4,locked=state.answers.length>state.index?state.answers[state.index]:null,d=locked||draft;
 const actions=!locked
  ?`<div class="action-group"><button class="quiet" type="button" id="hintBtn" ${d.hint?'disabled':''}>Hint (−20)</button>${admin?`<button class="quiet" type="button" id="skipBtn">Skip</button><button class="quiet" type="button" id="editHere">Edit</button>`:''}</div><button class="primary" type="button" id="submitBtn">Submit</button>`
  :`<span class="muted">${locked.skipped?'Skipped.':'Recorded.'}</span><button class="primary" type="button" id="nextBtn">${n===3?'Finish round':'Next'}</button>`;
 $('app').innerHTML=`<div class="topline"><span class="eyebrow">${esc(state.team||(state.mode==='class'?'CLASS':'TEAM'))} · ${state.index+1}/16</span><div class="score">${score()} <small>/ 1600</small></div></div><nav class="progress" aria-label="Round progress">${ROOMS.map((r,i)=>`<div class="${i===room?'active':i<room?'done':''}">0${i+1} · ${r.short}${i<room?' ✓':''}</div>`).join('')}</nav><div class="play-grid"><section class="case"><span class="eyebrow">0${room+1} · ${ROOMS[room].name}</span><h2>${esc(c.title)}${c.edited?' <span class="edited-pill">EDITED</span>':''}</h2><div class="data">${esc(c.data)}</div><p class="question">${esc(c.q)}</p>${c.type==='fields'?`<div class="fields">${c.fields.map((f,i)=>`<div class="field-row"><label for="field${i}">${esc(f[0])}</label><select id="field${i}" data-field="${i}" ${locked?'disabled':''}><option value="">Select…</option>${f[1].map((v,k)=>`<option value="${k}" ${d.fields[i]===k?'selected':''}>${esc(v)}</option>`).join('')}</select></div>`).join('')}</div>`:optionHTML(c.options,d.answer||[],'answer',!!locked)}<section class="reason"><h3>Justification</h3>${optionHTML(c.reasons,[d.reason],'reason',!!locked)}</section>${d.hint?`<aside class="hint"><strong>Hint</strong><br>${esc(c.hint)}</aside>`:''}<div class="case-actions">${actions}</div><p id="validation" class="storage-warning" role="status"></p>${locked&&!locked.skipped?feedback(c,locked):''}</section><aside class="sidebar"><div class="dots">${[0,1,2,3].map(i=>`<span class="${i<n?'done':i===n?'current':''}">${i<n?'✓':i+1}</span>`).join('')}</div><p>60 + 40 · hint −20</p></aside></div>`;
 if(!locked){
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.answer);draft.answer=c.type==='multi'?(draft.answer.includes(i)?draft.answer.filter(x=>x!==i):[...draft.answer,i]):[i];render();document.querySelector(`[data-answer="${i}"]`)?.focus({preventScroll:true});});
  document.querySelectorAll('[data-reason]').forEach(b=>b.onclick=()=>{draft.reason=Number(b.dataset.reason);render();document.querySelector(`[data-reason="${draft.reason}"]`)?.focus({preventScroll:true});});
  document.querySelectorAll('[data-field]').forEach(s=>s.onchange=()=>{draft.fields[Number(s.dataset.field)]=s.value===''?null:Number(s.value);});
  $('hintBtn').onclick=()=>{draft.hint=true;render();};
  $('submitBtn').onclick=submit;
  if(admin){
   $('skipBtn').onclick=skipQuestion;
   $('editHere').onclick=()=>{editIndex=state.index;state.screen='edit';render();focusMain();};
  }
 }else $('nextBtn').onclick=next;
}

function grade(c,d){
 let fraction;
 if(c.type==='fields')fraction=c.fields.reduce((n,f,i)=>n+(d.fields[i]===f[2]?1:0),0)/c.fields.length;
 else if(c.type==='multi')fraction=d.answer.length===c.answer.length&&c.answer.every(v=>d.answer.includes(v))?1:0;
 else fraction=d.answer[0]===c.answer?1:0;
 return {solution:Math.round(60*fraction),reasonPoints:d.reason===c.r?40:0,points:Math.max(0,Math.round(60*fraction)+(d.reason===c.r?40:0)-(d.hint?20:0))};
}
function padAnswers(){
 const blank={skipped:true,points:0,solution:0,reasonPoints:0,hint:false,answer:[],fields:[],reason:null};
 while(state.answers.length<state.index)state.answers.push({...blank});
}
function submit(){
 const c=CASES[state.index];
 if(state.answers.length>state.index&&state.answers[state.index])return;
 if(draft.reason===null||(c.type==='fields'?c.fields.some((_,i)=>!Number.isInteger(draft.fields[i])):!draft.answer.length)){
  $('validation').textContent='Complete answer and justification.';
  return;
 }
 padAnswers();
 state.answers[state.index]={...draft,...grade(c,draft)};
 save();render();
 $('app').querySelector('.feedback')?.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function skipQuestion(){
 if(!admin||(state.answers.length>state.index&&state.answers[state.index]))return;
 padAnswers();
 state.answers[state.index]={skipped:true,points:0,solution:0,reasonPoints:0,hint:false,answer:[],fields:[],reason:null};
 save();render();
}
function answerText(c){
 return c.type==='fields'?c.fields.map(f=>f[0]+': '+f[1][f[2]]).join(' · '):c.type==='multi'?c.answer.map(i=>c.options[i]).join(' + '):c.options[c.answer];
}
function feedback(c,a){
 return `<section class="feedback" aria-live="polite"><h3>${a.solution===60&&a.reasonPoints===40?'Correct.':a.solution===60?'Answer correct.':'Review.'} <span class="accent">+${a.points}</span></h3><p class="correct-answer"><strong>Answer:</strong> ${esc(answerText(c))}</p><p><strong>Justification:</strong> ${esc(c.reasons[c.r])}</p><p>${esc(c.explain)}</p><p class="source">${a.solution}/60 · ${a.reasonPoints}/40${a.hint?' · hint −20':''}<br>${esc(c.source)}</p><p><strong>Discuss:</strong> ${esc(c.talk)}</p></section>`;
}
function next(){
 if(state.index%4===3)state.screen='break';
 else{state.index++;resetDraft();}
 save();render();focusMain();
}
function breakScreen(){
 const i=Math.floor(state.index/4);
 $('app').innerHTML=`<section class="break-panel"><span class="eyebrow">Round 0${i+1}</span><div class="seal" aria-hidden="true">${ROOMS[i].symbol}</div><h1>${i===3?'Done.':'Round complete.'}</h1><p>${ROOMS[i].name}: <strong class="accent">${roomScore(i)} / 400</strong></p><p class="muted">${ROOMS[i].debrief}</p><button class="primary" type="button" id="continueBtn">${i<3?'Next round':'Results'}</button></section>`;
 $('continueBtn').onclick=()=>{if(i===3)state.screen='results';else{state.index++;state.screen='play';resetDraft();}save();render();focusMain();};
}
function resultsScreen(){
 $('app').innerHTML=`<section class="results"><span class="eyebrow">${esc(state.team||'TEAM')}</span><h1>Results</h1><div class="result-score">${score()} <small>/ 1600</small></div><div class="result-grid">${ROOMS.map((r,i)=>`<div><span>${r.name}</span><strong>${roomScore(i)} <small>/ 400</small></strong></div>`).join('')}</div><details><summary>Optional · morphology</summary><p><strong>sof = 2, mürü = 3.</strong> “Merdivenleri sof-___ sof-___ çıkmak kolay, mürü-___ mürü-___ çık da göreyim.”</p><details><summary>Suggested</summary><p><strong>sofar sofar · mürüşer mürüşer.</strong></p></details></details><h2>Review</h2>${CASES.map((c,i)=>`<details><summary>${String(i+1).padStart(2,'0')} · ${esc(c.title)} <span class="muted">${state.answers[i]?.skipped?'skip':`${state.answers[i]?.points??0}/100`}</span></summary><p class="correct-answer">${esc(answerText(c))}</p><p>${esc(c.explain)}</p><p class="source">${esc(c.source)}</p></details>`).join('')}<div class="wide-actions"><button class="primary" type="button" id="copyResult">Copy</button><button type="button" id="restart">Start again</button>${admin?`<button type="button" id="openLibrary">All questions</button>`:''}</div><p id="copyStatus" role="status"></p></section>`;
 $('copyResult').onclick=async()=>{const report=`LING313 — ${state.team||'Team'}: ${score()}/1600\n`+ROOMS.map((r,i)=>`${r.name}: ${roomScore(i)}/400`).join('\n');try{await navigator.clipboard.writeText(report);$('copyStatus').textContent='Copied.';}catch(e){$('copyStatus').textContent=report;}};
 $('restart').onclick=()=>{if(confirm('Clear practice progress and start again?')){state={weeks:state.weeks,screen:'start',mode:state.mode,team:state.team,index:0,answers:[]};resetDraft();save();render();focusMain();}};
 if(admin)$('openLibrary').onclick=()=>{state.screen='library';render();focusMain();};
}

function libraryScreen(){
 if(!admin){state.screen='start';render();return;}
 $('app').innerHTML=`<section class="results"><div class="library-head"><div><span class="eyebrow">Admin</span><h1>Questions</h1></div><div class="wide-actions"><button type="button" id="backStart">Back</button><button type="button" id="exportEdits">Export edits</button><button type="button" class="danger" id="clearEdits">Clear edits</button></div></div><p id="libStatus" class="library-note" role="status"></p>${CASES.map((c,i)=>`<details class="q-card"><summary>${String(i+1).padStart(2,'0')} · ${esc(c.title)}${c.edited?' <span class="edited-pill">EDITED</span>':''}<span class="correct-answer">${esc(answerText(c))}</span></summary><div class="data">${esc(c.data)}</div><p>${esc(c.q)}</p><p><strong>Justification:</strong> ${esc(c.reasons[c.r])}</p><p class="source">${esc(c.source)}</p><div class="wide-actions"><button type="button" data-jump="${i}">Play</button><button type="button" data-edit="${i}">Edit</button></div></details>`).join('')}</section>`;
 $('backStart').onclick=()=>{state.screen='start';save();render();focusMain();};
 $('exportEdits').onclick=async()=>{const text=JSON.stringify(edits,null,2);try{await navigator.clipboard.writeText(text);$('libStatus').textContent='Edits copied.';}catch(e){$('libStatus').textContent=text;}};
 $('clearEdits').onclick=()=>{if(!confirm('Clear local edits?'))return;edits={};saveEdits();CASES=buildCases(edits);$('libStatus').textContent='Cleared.';render();};
 document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{state.weeks='1–2';state.index=Number(b.dataset.jump);state.screen='play';resetDraft();save();render();focusMain();});
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{editIndex=Number(b.dataset.edit);state.screen='edit';render();focusMain();});
}

function editScreen(){
 if(!admin){state.screen='start';render();return;}
 const base=clone(BASE_CASES[editIndex]);
 const e=edits[editIndex]||{};
 const c={...base,...e,fields:e.fields||base.fields,options:e.options||base.options,reasons:e.reasons||base.reasons,answer:e.answer??base.answer,r:e.r??base.r};
 const optionRows=(list,name,correct)=>list.map((opt,i)=>`<div class="edit-row"><label class="edit-mark"><input type="${name==='reasons'?'radio':'checkbox'}" name="${name}Correct" value="${i}" ${name==='reasons'?(c.r===i?'checked':''):(Array.isArray(c.answer)?c.answer.includes(i):c.answer===i)?'checked':''}> ${String.fromCharCode(65+i)}</label><input data-list="${name}" data-i="${i}" value="${esc(opt)}" ${name!=='reasons'&&correct==null?'':''}><span></span></div>`).join('');
 let body='';
 if(c.type==='fields'){
  body=c.fields.map((f,fi)=>`<fieldset><label>Field ${fi+1} label</label><input data-field-label="${fi}" value="${esc(f[0])}"><label>Options</label>${f[1].map((opt,oi)=>`<div class="edit-row"><label class="edit-mark"><input type="radio" name="fieldCorrect${fi}" value="${oi}" ${f[2]===oi?'checked':''}> correct</label><input data-field-opt="${fi}" data-oi="${oi}" value="${esc(opt)}"></div>`).join('')}</fieldset>`).join('')+`<label>Justifications</label><div class="edit-list">${optionRows(c.reasons,'reasons')}</div>`;
 }else{
  body=`<label>Options</label><div class="edit-list">${optionRows(c.options,'options')}</div><label>Justifications</label><div class="edit-list">${optionRows(c.reasons,'reasons')}</div>`;
 }
 $('app').innerHTML=`<section class="results edit-form"><div class="library-head"><div><span class="eyebrow">Edit ${editIndex+1}/16</span><h1>${esc(base.title)}</h1></div><button type="button" id="cancelEdit">Cancel</button></div><label>Title</label><input id="eTitle" value="${esc(c.title)}"><label>Data</label><textarea id="eData">${esc(c.data)}</textarea><label>Question</label><textarea id="eQ">${esc(c.q)}</textarea>${body}<label>Hint</label><textarea id="eHint">${esc(c.hint)}</textarea><label>Explanation</label><textarea id="eExplain">${esc(c.explain)}</textarea><label>Source</label><input id="eSource" value="${esc(c.source)}"><label>Discussion</label><textarea id="eTalk">${esc(c.talk)}</textarea><div class="edit-actions"><button class="primary" type="button" id="saveEdit">Save</button><button type="button" id="resetOne">Reset this</button><button type="button" id="cancelEdit2">Cancel</button></div><p id="editStatus" role="status"></p></section>`;
 const leave=()=>{state.screen='library';render();focusMain();};
 $('cancelEdit').onclick=leave;$('cancelEdit2').onclick=leave;
 $('resetOne').onclick=()=>{delete edits[editIndex];saveEdits();CASES=buildCases(edits);$('editStatus').textContent='Reset.';};
 $('saveEdit').onclick=()=>{
  const next={title:$('eTitle').value.trim(),data:$('eData').value,q:$('eQ').value,hint:$('eHint').value,explain:$('eExplain').value,source:$('eSource').value.trim(),talk:$('eTalk').value};
  const reasonInputs=[...document.querySelectorAll('[data-list="reasons"]')].map(inp=>inp.value.trim());
  if(reasonInputs.some(v=>!v)||reasonInputs.length!==base.reasons.length){$('editStatus').textContent='Fill all justifications.';return;}
  next.reasons=reasonInputs;
  const rEl=document.querySelector('input[name="reasonsCorrect"]:checked');
  if(!rEl){$('editStatus').textContent='Mark the correct justification.';return;}
  next.r=Number(rEl.value);
  if(base.type==='fields'){
   next.fields=base.fields.map((f,fi)=>{
    const label=document.querySelector(`[data-field-label="${fi}"]`).value.trim()||f[0];
    const opts=[...document.querySelectorAll(`[data-field-opt="${fi}"]`)].map(inp=>inp.value.trim());
    const correct=document.querySelector(`input[name="fieldCorrect${fi}"]:checked`);
    return [label,opts,correct?Number(correct.value):f[2]];
   });
   if(next.fields.some(f=>f[1].some(o=>!o))){$('editStatus').textContent='Fill all field options.';return;}
  }else{
   const opts=[...document.querySelectorAll('[data-list="options"]')].map(inp=>inp.value.trim());
   if(opts.some(v=>!v)||opts.length!==base.options.length){$('editStatus').textContent='Fill all options.';return;}
   next.options=opts;
   const marks=[...document.querySelectorAll('input[name="optionsCorrect"]:checked')].map(el=>Number(el.value));
   if(!marks.length){$('editStatus').textContent='Mark the correct option(s).';return;}
   next.answer=base.type==='multi'?marks:marks[0];
  }
  edits[editIndex]=next;saveEdits();CASES=buildCases(edits);$('editStatus').textContent='Saved in this browser.';
 };
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
  admin=true;gate.close();if(state.screen!=='office')state.screen='library';render();focusMain();
 };
}

function toggleAdmin(){
 if(admin){
  admin=false;
  if(['library','edit'].includes(state.screen))state.screen='start';
  render();
  return;
 }
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
 return ohBookings.some(b=>b.day===day&&b.slot===slot&&b.status!=='declined'&&b.id!==exceptId);
}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
function bookingLabel(b){
 const when=`${DAY_LABEL[b.day]||b.day} ${b.slot}–${fromMinutes(toMinutes(b.slot)+30)}`;
 if(b.kind==='group')return `${when} · ${b.members}`;
 return `${when} · ${b.name}`;
}
function bookingWhen(b){
 const day=DAY_LABEL[b.day]||b.day;
 const time=`${b.slot}–${fromMinutes(toMinutes(b.slot)+30)}`;
 return {day,time,slotStart:b.slot};
}
function notifyMessage(b){
 const {day,time,slotStart}=bookingWhen(b);
 const who=b.kind==='group'?`Members: ${b.members}`:`Name: ${b.name}`;
 return [
  'LING313 office hour request',
  '',
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
 fd.append('subject','LING313 office hour request');
 fd.append('from_name','LING313 office hours');
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
 const {day,slotStart}=bookingWhen(b);
 const params={to_email:b.email,name:studentDisplayName(b),day,time:slotStart};
 if(kind==='reject')params.reason=reason;
 const templateId=kind==='approve'?EMAILJS_APPROVE_TEMPLATE:EMAILJS_REJECT_TEMPLATE;
 try{
  const res=await emailjs.send(EMAILJS_SERVICE_ID,templateId,params);
  return {ok:true,status:res?.status,text:res?.text||'OK'};
 }catch(e){
  const text=e?.text||e?.message||String(e);
  return {ok:false,text};
 }
}

function officeScreen(){
 if(!DAY_IDS.includes(ohDraft.day)||!ohAvail[ohDraft.day]?.on)ohDraft.day=DAY_IDS.find(d=>ohAvail[d].on)||'mon';
 const slots=slotsForDay(ohDraft.day);
 if(ohDraft.slot&&(slotTaken(ohDraft.day,ohDraft.slot)||!slots.includes(ohDraft.slot)))ohDraft.slot=null;
 const dayShort={mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri'};
 const nameField=ohDraft.kind==='individual'
  ?`<div class="book-field"><label for="ohName">Name</label><input id="ohName" maxlength="80" required value="${esc(ohDraft.name)}" autocomplete="name"></div>`
  :`<div class="book-field book-members"><label for="ohMembers">Members</label><textarea id="ohMembers" maxlength="400" rows="2" required placeholder="Comma-separated names">${esc(ohDraft.members)}</textarea></div>`;
 const studentForm=`<section class="book-panel">
 <div class="book-kind" role="group" aria-label="Booking type">
  <button type="button" id="ohInd" aria-pressed="${ohDraft.kind==='individual'}" class="${ohDraft.kind==='individual'?'selected':''}">Individual</button>
  <button type="button" id="ohGroup" aria-pressed="${ohDraft.kind==='group'}" class="${ohDraft.kind==='group'?'selected':''}">Group</button>
 </div>
 <div class="book-row">${nameField}<div class="book-field"><label for="ohEmail">Email</label><input id="ohEmail" type="email" maxlength="120" required value="${esc(ohDraft.email)}" autocomplete="email"></div></div>
 <div class="book-field"><label for="ohWhy">Why do you want to meet?</label><textarea id="ohWhy" maxlength="280" rows="3" required>${esc(ohDraft.why)}</textarea></div>
 <div class="book-block"><span class="book-label">Day</span><div class="day-tabs" role="group" aria-label="Day">${DAY_IDS.map(d=>{
  const on=!!ohAvail[d]?.on;
  const sel=ohDraft.day===d;
  return `<button type="button" data-oh-day="${d}" class="${sel?'selected':''}" ${on?'':'disabled'} aria-pressed="${sel}">${dayShort[d]}</button>`;
 }).join('')}</div></div>
 <div class="book-block"><span class="book-label">Time</span><div class="slot-grid" role="group" aria-label="Time">${slots.length?slots.map(s=>{
  const taken=slotTaken(ohDraft.day,s);
  const sel=ohDraft.slot===s;
  return `<button type="button" data-oh-slot="${s}" class="${sel?'selected':''}${taken?' taken':''}" ${taken?'disabled':''} aria-pressed="${sel}">${s}</button>`;
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
 <h2 style="margin-top:28px">Requests</h2>
 <p class="mailto-note">Approve and Reject email the student via EmailJS. Status updates only after the email sends.</p>
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
   saveOffice();$('ohAvailStatus').textContent='Hours saved in this browser.';
  };
  $('ohResetAvail').onclick=()=>{ohAvail=clone(DEFAULT_AVAIL);saveOffice();render();};
  document.querySelectorAll('[data-approve]').forEach(btn=>btn.onclick=async()=>{
   const b=ohBookings.find(x=>x.id===btn.dataset.approve);if(!b||b.status!=='pending')return;
   const statusEl=$('ohDecisionStatus');
   btn.disabled=true;
   ohDecisionMsg='';
   if(statusEl)statusEl.textContent='Emailing student…';
   const result=await sendStudentDecision(b,'approve');
   if(result.ok){
    b.status='approved';
    saveOffice();
    ohDecisionMsg='Approved. The student was emailed.';
    render();
   }else{
    ohDecisionMsg='';
    if(statusEl)statusEl.textContent=`Email was not sent${result.text?`: ${result.text}`:'.'} Status left pending.`;
    btn.disabled=false;
   }
  });
  document.querySelectorAll('[data-decline]').forEach(btn=>btn.onclick=async()=>{
   const b=ohBookings.find(x=>x.id===btn.dataset.decline);if(!b||b.status!=='pending')return;
   const reasonEl=document.querySelector(`[data-reject-reason="${b.id}"]`);
   const reason=(reasonEl?.value||'').trim();
   const statusEl=$('ohDecisionStatus');
   if(!reason){
    ohDecisionMsg='';
    if(statusEl)statusEl.textContent='Enter a short reject reason.';
    reasonEl?.focus();
    return;
   }
   btn.disabled=true;
   ohDecisionMsg='';
   if(statusEl)statusEl.textContent='Emailing student…';
   const result=await sendStudentDecision(b,'reject',reason);
   if(result.ok){
    b.status='declined';
    b.rejectReason=reason;
    saveOffice();
    ohDecisionMsg='Rejected. The student was emailed.';
    render();
   }else{
    ohDecisionMsg='';
    if(statusEl)statusEl.textContent=`Email was not sent${result.text?`: ${result.text}`:'.'} Status left pending.`;
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
 if(slotTaken(ohDraft.day,ohDraft.slot)){status.textContent='That slot is taken.';return;}
 const booking={
  id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
  kind:ohDraft.kind,
  name:ohDraft.kind==='individual'?ohDraft.name.trim():'',
  group:'',
  members:ohDraft.kind==='group'?ohDraft.members.trim():'',
  email:ohDraft.email.trim(),
  why:ohDraft.why.trim(),
  day:ohDraft.day,
  slot:ohDraft.slot,
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
}

$('adminBtn').onclick=toggleAdmin;
$('brand').onclick=e=>{e.preventDefault();state.screen='home';save();render();focusMain();};

resetDraft();render();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'read_current_case',description:'Read the current visible case and game progress; does not submit an answer.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({screen:state.screen,caseNumber:state.index+1,total:16,score:score(),admin,title:state.screen==='play'?CASES[state.index]?.title:null})})).catch(()=>{});}catch(e){}}
