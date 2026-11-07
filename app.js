(function(){
'use strict';
document.documentElement.lang='en-GB';
document.documentElement.dir='ltr';

/* ---------- constants ---------- */
var DAYS=['Sat','Sun','Mon','Tue','Wed','Thu','Fri'];
var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var SH=['ص','و','م','س'];
var LEAVE='ج';
var KEY={'ص':'am','و':'mid','م':'pm','س':'late'};
var SC={'ص':'am','و':'mid','م':'pm','س':'late','ج':'lv','':'none'};
var DEF={am:{start:'07:45',end:'15:45',need:4},mid:{start:'12:00',end:'20:00',need:3},pm:{start:'15:00',end:'23:00',need:5},late:{start:'17:00',end:'01:00',need:3}};
/* stored codes stay unchanged so existing data keeps working; LBL is what people see */
var LBL={'ص':'AM','و':'MID','م':'PM','س':'LATE','ج':'LV','':'—'};
var DEFAULT_PW='123456';
var DEFAULT_ADMIN_PW='987654321';
function svg(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}
var IC={
  cal:svg('<rect x="3.5" y="5" width="17" height="15" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M9 14.5l2 2 4-4"/>'),
  alert:svg('<path d="M12 3.5 2.8 19.5h18.4L12 3.5z"/><path d="M12 10v4.5M12 17.2v.1"/>'),
  days:svg('<rect x="3.5" y="5" width="17" height="15" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h.1M12 14h.1M16 14h.1M8 17h.1M12 17h.1"/>'),
  inbox:svg('<path d="M3.5 13.5 6 5.5h12l2.5 8"/><path d="M3.5 13.5V18a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5v-4.5H15a3 3 0 0 1-6 0H3.5z"/>'),
  check:svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  users:svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  gear:svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  search:svg('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
  prev:svg('<polyline points="15 18 9 12 15 6"></polyline>'),
  next:svg('<polyline points="9 18 15 12 9 6"></polyline>'),
  print:svg('<polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>')
};
var LOGO=IC.cal;

/* ---------- helpers ---------- */
function $(s,r){return (r||document).querySelector(s);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function pad(n){return String(n).padStart(2,'0');}
function iso(d){return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());}
function parse(s){var p=s.split('-').map(Number);return new Date(Date.UTC(p[0],p[1]-1,p[2]));}
function addDays(s,n){var d=parse(s);d.setUTCDate(d.getUTCDate()+n);return iso(d);}
function dayIdx(s){return (parse(s).getUTCDay()+1)%7;}
function weekStart(s){return addDays(s,-dayIdx(s));}
function todayIso(){var n=new Date();return n.getFullYear()+'-'+pad(n.getMonth()+1)+'-'+pad(n.getDate());}
function fmtShort(s){var d=parse(s);return d.getUTCDate()+'/'+(d.getUTCMonth()+1);}
function fmtLong(s){var d=parse(s);return DAYS[dayIdx(s)]+' '+d.getUTCDate()+' '+MONTHS[d.getUTCMonth()];}
function fmtRange(w){var a=parse(w),b=parse(addDays(w,6));return a.getUTCDate()+' '+MONTHS[a.getUTCMonth()]+' – '+b.getUTCDate()+' '+MONTHS[b.getUTCMonth()]+' '+b.getUTCFullYear();}
function sha(str){
  try{
    var b=new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256',b).then(function(h){return Array.prototype.map.call(new Uint8Array(h),function(x){return x.toString(16).padStart(2,'0');}).join('');});
  }catch(e){
    var h=5381;for(var i=0;i<str.length;i++){h=((h<<5)+h+str.charCodeAt(i))|0;}
    return Promise.resolve('f'+(h>>>0).toString(16));
  }
}
function normalizeCode(v){return String(v==null?'':v).trim();}
function isValidAccountCode(v){return /^[0-9]{3,12}$/.test(normalizeCode(v));}
function hasValidFirebaseConfig(){
  var cfg=(window&&window.FIREBASE_CONFIG)?window.FIREBASE_CONFIG:{};
  return !!(cfg.apiKey && cfg.projectId);
}
function rnd(){var a=new Uint8Array(8);try{crypto.getRandomValues(a);}catch(e){for(var i=0;i<8;i++)a[i]=Math.floor(Math.random()*256);}return Array.prototype.map.call(a,function(x){return x.toString(16).padStart(2,'0');}).join('');}
function avCls(code){return 'av'+((parseInt(code,10)||0)%6);}
function reduced(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}}
function makeDemoEmployeeList(){
  return [
    {code:'7028',name:'Ahmed Adel',order:1,counted:true},
    {code:'7034',name:'Mohamed Elshahat',order:2,counted:true},
    {code:'7009',name:'Omar Osaad',order:3,counted:true},
    {code:'7019',name:'Ahmed Attia',order:4,counted:true},
    {code:'7015',name:'Mohamed Refaai',order:5,counted:true},
    {code:'7036',name:'Mohamed Salman',order:6,counted:true},
    {code:'7018',name:'Eslam Mostafa',order:7,counted:true},
    {code:'7052',name:'Mahmoud Essam',order:8,counted:true},
    {code:'7038',name:'Ahmed Maged',order:9,counted:true},
    {code:'7039',name:'Yomna Gamal',order:10,counted:true},
    {code:'7041',name:'Rolan Mohammed',order:11,counted:true},
    {code:'7045',name:'Zaki Nasr',order:12,counted:true},
    {code:'7046',name:'Norhan Hisham',order:13,counted:true},
    {code:'7047',name:'Mohamed El-Gazzar',order:14,counted:true},
    {code:'7049',name:'Mohamed Taman',order:15,counted:true},
    {code:'7051',name:'Mohamed Wahba',order:16,counted:true},
    {code:'7050',name:'Mariam Mahmoud',order:17,counted:true},
    {code:'7054',name:'Eman Sherif',order:18,counted:true},
    {code:'7053',name:'Reem Mansour',order:19,counted:true},
    {code:'7055',name:'Omar Wasffiy',order:20,counted:true},
    {code:'7056',name:'Mostafa ALkholi',order:21,counted:true}
  ];
}
function createLocalMockDb(){
  var state={
    config:{adminCode:'7023',adminSalt:'a3f19c5e7b2d4086',adminHash:'c945c8cb2b56a830d24d1673dbf690797a83647eb61f4ab755dd1ba68a1c5cc4',shifts:DEF},
    employees:makeDemoEmployeeList(),
    rows:{},
    requests:[],
    decisions:{},
    pins:{}
  };
  var curW=weekStart(todayIso());
  var initialSchedule=(window.SEED&&window.SEED.schedule&&window.SEED.schedule.rows)||[
    {code:'7028',days:['م','س','و','و','ص','ص','']},
    {code:'7034',days:['س','م','م','ص','ص','ص','']},
    {code:'7009',days:['م','م','م','ص','س','م','']},
    {code:'7019',days:['م','م','و','س','ص','ص','']},
    {code:'7015',days:['ص','ص','س','و','م','و','']},
    {code:'7036',days:['ص','م','م','و','م','م','']},
    {code:'7018',days:['و','و','و','س','م','ص','']},
    {code:'7052',days:['و','و','س','و','ج','و','']},
    {code:'7038',days:['و','و','ص','ص','س','م','']},
    {code:'7039',days:['س','م','م','م','م','م','']},
    {code:'7041',days:['م','م','م','س','م','م','']},
    {code:'7045',days:['س','س','م','ج','م','م','']},
    {code:'7046',days:['م','م','م','س','م','س','']},
    {code:'7047',days:['ص','ص','م','م','و','و','']},
    {code:'7049',days:['م','م','ج','م','م','م','']},
    {code:'7051',days:['م','س','م','م','ج','س','']},
    {code:'7050',days:['م','م','م','م','م','م','']},
    {code:'7054',days:['و','و','ج','و','و','و','']},
    {code:'7053',days:['و','ج','م','م','م','م','']},
    {code:'7055',days:['ج','س','م','س','س','س','']},
    {code:'7056',days:['س','م','س','م','م','ج','']}
  ];
  initialSchedule.forEach(function(r){
    state.rows[curW+'_'+r.code]={week:curW,code:r.code,days:r.days.slice()};
  });
  var docListeners={};
  var collListeners={};
  state.employees.forEach(function(emp){
    state.pins[emp.code]={hash:'demo:'+emp.code};
  });
  function docSnapshot(path, value){
    var data=(value===undefined||value===null)?{}:value;
    var exists=value!==undefined&&value!==null&&!(typeof value==='string'&&value==='');
    return {exists:exists,id:path.split('/').pop(),data:function(){return data;}};
  }
  function listCollection(path){
    if(path==='employees')return state.employees.map(function(e){return {id:e.code,data:function(){return e;}};});
    if(path==='rows')return Object.keys(state.rows).map(function(id){var row=state.rows[id];return {id:id,data:function(){return row;}};});
    if(path==='requests')return state.requests.map(function(r){return {id:r.id,data:function(){return r;}};});
    if(path==='decisions')return Object.keys(state.decisions).map(function(id){var d=state.decisions[id];return {id:id,data:function(){return d;}};});
    if(path==='pins')return Object.keys(state.pins).map(function(id){var p=state.pins[id];return {id:id,data:function(){return p;}};});
    return [];
  }
  function readDoc(path){
    var seg=path.split('/');
    if(path==='config/main')return state.config;
    if(seg[0]==='employees'&&seg[1])return state.employees.find(function(e){return e.code===seg[1];});
    if(seg[0]==='pins'&&seg[1])return state.pins[seg[1]];
    if(seg[0]==='rows'&&seg[1])return state.rows[seg[1]];
    if(seg[0]==='decisions'&&seg[1])return state.decisions[seg[1]];
    if(seg[0]==='requests'&&seg[1])return state.requests.find(function(r){return r.id===seg[1];});
    return undefined;
  }
  function emit(path){
    var seg=path.split('/');
    var collection=seg[0];
    var listeners=(docListeners[path]||[]).slice();
    listeners.forEach(function(cb){cb(docSnapshot(path,readDoc(path)));});
    var coll=(collListeners[collection]||[]).slice();
    coll.forEach(function(cb){cb({docs:listCollection(collection)});});
  }
  function writeDoc(path,data){
    var seg=path.split('/');
    if(path==='config/main'){state.config=Object.assign({},state.config,data);emit(path);return;}
    if(seg[0]==='employees'&&seg[1]){
      var idx=state.employees.findIndex(function(e){return e.code===seg[1];});
      var rec=Object.assign({},data,{code:seg[1]});
      if(idx>=0)state.employees[idx]=rec;else state.employees.push(rec);
      emit(path);emit('employees');
      return;
    }
    if(seg[0]==='pins'&&seg[1]){state.pins[seg[1]]=Object.assign({},state.pins[seg[1]],data);emit(path);emit('pins');return;}
    if(seg[0]==='rows'&&seg[1]){state.rows[seg[1]]=Object.assign({},data,{week:seg[1].split('_')[0],code:seg[1].split('_').slice(1).join('_')});emit(path);emit('rows');return;}
    if(seg[0]==='decisions'&&seg[1]){state.decisions[seg[1]]=Object.assign({},state.decisions[seg[1]],data);emit(path);emit('decisions');return;}
    if(seg[0]==='requests'&&seg[1]){
      var idx=state.requests.findIndex(function(r){return r.id===seg[1];});
      if(idx>=0)state.requests[idx]=Object.assign({},state.requests[idx],data);else state.requests.push(Object.assign({},data,{id:seg[1]}));
      emit(path);emit('requests');
    }
  }
  function removeDoc(path){
    var seg=path.split('/');
    if(seg[0]==='employees'&&seg[1]){state.employees=state.employees.filter(function(e){return e.code!==seg[1];});emit(path);emit('employees');}
    if(seg[0]==='pins'&&seg[1]){delete state.pins[seg[1]];emit(path);emit('pins');}
    if(seg[0]==='rows'&&seg[1]){delete state.rows[seg[1]];emit(path);emit('rows');}
    if(seg[0]==='decisions'&&seg[1]){delete state.decisions[seg[1]];emit(path);emit('decisions');}
    if(seg[0]==='requests'&&seg[1]){state.requests=state.requests.filter(function(r){return r.id!==seg[1];});emit(path);emit('requests');}
  }
  function buildCollectionRef(path){
    return {
      onSnapshot:function(cb){
        var list=collListeners[path]||(collListeners[path]=[]);
        list.push(cb);
        cb({docs:listCollection(path)});
        return function(){
          collListeners[path]=(collListeners[path]||[]).filter(function(fn){return fn!==cb;});
        };
      },
      add:function(data){
        var id='req_'+Date.now()+'_'+Math.random().toString(16).slice(2,8);
        state.requests.push(Object.assign({},data,{id:id}));
        emit('requests');
        return Promise.resolve({id:id});
      },
      doc:function(id){return buildDocRef(path+'/'+id);}
    };
  }
  function buildDocRef(path){
    return {
      path:path,
      get:function(){return Promise.resolve(docSnapshot(path,readDoc(path)));},
      set:function(data){writeDoc(path,data);return Promise.resolve();},
      update:function(data){writeDoc(path,Object.assign({},readDoc(path)||{},data));return Promise.resolve();},
      delete:function(){removeDoc(path);return Promise.resolve();},
      onSnapshot:function(cb){
        var list=docListeners[path]||(docListeners[path]=[]);
        list.push(cb);
        cb(docSnapshot(path,readDoc(path)));
        return function(){
          docListeners[path]=(docListeners[path]||[]).filter(function(fn){return fn!==cb;});
        };
      }
    };
  }
  return {doc:buildDocRef, collection:buildCollectionRef};
}

/* ---------- state ---------- */
var S={db:null,user:null,nodb:false,slow:false,err:null,
  ready:{cfg:false,emp:false,rows:false,req:false,dec:false},
  cfg:{},emps:[],rows:new Map(),reqs:[],decs:new Map(),
  session:null,week:weekStart(todayIso()),tab:'schedule',filter:'all',loginErr:'',shake:false,flash:null,confirmDel:null,viewKey:''};
try{var ss=JSON.parse(localStorage.getItem('shifts.session')||'null');if(ss&&(ss.role==='admin'||ss.role==='emp'))S.session=ss;}catch(e){}
function loaded(){var r=S.ready;return r.cfg&&r.emp&&r.rows&&r.req&&r.dec;}
function saveSession(){try{if(S.session)localStorage.setItem('shifts.session',JSON.stringify(S.session));else localStorage.removeItem('shifts.session');}catch(e){}}

/* ---------- schedule logic ---------- */
function shifts(){var c=(S.cfg&&S.cfg.shifts)||{},o={};for(var k in DEF){o[k]=Object.assign({},DEF[k],c[k]||{});}return o;}
function statusOf(r){var d=S.decs.get(r.id);return d?d.status:'pending';}
function approvedSet(){var s=new Set();S.reqs.forEach(function(r){if(statusOf(r)==='approved')s.add(r.code+'|'+r.date);});return s;}
function pendingSet(){var s=new Set();S.reqs.forEach(function(r){if(statusOf(r)==='pending')s.add(r.code+'|'+r.date);});return s;}
function hasWeek(w){var f=false;S.rows.forEach(function(r){if(r.week===w)f=true;});return f;}
function effective(appr,week,code,i){
  if(appr.has(code+'|'+addDays(week,i)))return LEAVE;
  var r=S.rows.get(week+'_'+code);
  return (r&&r.days&&r.days[i])||'';
}
function coverage(week,appr,extra){
  var sh=shifts(),cells={},counted=S.emps.filter(function(e){return e.counted!==false;});
  SH.forEach(function(s){cells[s]=[];for(var i=0;i<7;i++)cells[s].push({count:0,need:Number(sh[KEY[s]].need)||0,diff:0});});
  counted.forEach(function(e){
    for(var i=0;i<7;i++){
      var v=effective(appr,week,e.code,i);
      if(extra&&extra.code===e.code&&extra.date===addDays(week,i))v=LEAVE;
      if(cells[v])cells[v][i].count++;
    }
  });
  var total=0,perDay=[0,0,0,0,0,0,0],worst=null;
  SH.forEach(function(s){cells[s].forEach(function(c,i){c.diff=c.count-c.need;if(c.diff<0){perDay[i]+=-c.diff;total+=-c.diff;if(!worst||c.diff<worst.diff)worst={diff:c.diff,s:s,i:i};}});});
  return {cells:cells,perDay:perDay,total:total,worst:worst};
}
function impact(r,appr){
  var w=weekStart(r.date);
  if(!hasWeek(w))return {txt:'No schedule for this week yet, so there is no shortage impact to show.',cls:''};
  var emp=S.emps.find(function(e){return e.code===r.code;});
  if(emp&&emp.counted===false)return {txt:'This employee is not counted in coverage, so shortages are unaffected.',cls:''};
  var i=dayIdx(r.date),cur=effective(appr,w,r.code,i);
  if(cur===LEAVE)return {txt:'Already on leave that day.',cls:''};
  if(SH.indexOf(cur)<0)return {txt:'No shift that day, so shortages are unaffected.',cls:''};
  var b=coverage(w,appr).cells[cur][i],a=coverage(w,appr,{code:r.code,date:r.date}).cells[cur][i];
  var t='Shift '+LBL[cur]+': coverage '+b.count+'/'+b.need+' → '+a.count+'/'+a.need;
  if(a.diff<0)return {txt:t+' — shortage becomes '+(-a.diff),cls:'bad'};
  return {txt:t+' — no shortage',cls:'good'};
}
function nextShift(code,appr){
  var t=todayIso();
  for(var n=0;n<21;n++){
    var d=addDays(t,n),w=weekStart(d);
    if(!hasWeek(w))continue;
    var v=effective(appr,w,code,dayIdx(d));
    if(SH.indexOf(v)>=0)return {date:d,v:v,n:n};
  }
  return null;
}

/* ---------- writes ---------- */
var Q=new Map();
function wr(path,fn){var p=(Q.get(path)||Promise.resolve()).catch(function(){}).then(fn);Q.set(path,p);return p;}
function fail(e){
  var c=e&&e.code;
  toast(c==='invalid_argument'||c==='permission-denied'?'You don’t have permission to do this. Ask the admin to grant access.':c==='quota_exceeded'?'Storage is full.':'Couldn’t save. Try again.','err');
}
function saveCfg(patch){
  var path='config/main';
  return wr(path,function(){
    var ref=S.db.doc(path);
    if(Object.keys(S.cfg).length)return ref.update(patch);
    return ref.set(patch);
  });
}
function setRow(week,code,days){return wr('rows/'+week+'_'+code,function(){return S.db.doc('rows/'+week+'_'+code).set({week:week,code:code,days:days});});}
async function checkPw(code,pw){
  var snap=await S.db.doc('pins/'+code).get();
  if(!snap.exists||!snap.data()||!snap.data().hash)return pw===DEFAULT_PW;
  var dbHash=snap.data().hash;
  if(typeof dbHash === 'string' && dbHash.indexOf('demo:')===0)return pw===DEFAULT_PW;
  return (await sha(code+':'+pw))===dbHash;
}

/* ---------- toast ---------- */
var tt;
function toast(msg,type){
  var t=$('#toast');t.innerHTML='<div class="'+(type||'')+'">'+esc(msg)+'</div>';
  var d=t.firstChild;requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add('show');});});
  clearTimeout(tt);tt=setTimeout(function(){d.classList.remove('show');},3200);
}

/* ---------- views ---------- */
function chip(v){return '<span class="chip c-'+SC[v||'']+'">'+LBL[v||'']+'</span>';}
function times(s){var t=shifts()[KEY[s]];return '<bdi dir="ltr">'+esc(t.start)+'–'+esc(t.end)+'</bdi>';}
function themeLabel(){return document.documentElement.dataset.theme==='dark'?'☀':'☾';}
function themeToggle(){return '<button class="icon-btn theme-toggle" data-act="theme" title="Toggle theme" aria-label="Toggle theme">'+themeLabel()+'</button>';} 
function setTheme(theme){
  var next=(theme==='dark'||theme==='light')?theme:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  document.documentElement.setAttribute('data-theme',next);
  try{localStorage.setItem('shifts.theme',next);}catch(e){}
}
function getStoredTheme(){
  try{var saved=localStorage.getItem('shifts.theme');if(saved==='dark'||saved==='light')return saved;}catch(e){}
  try{return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch(e){return 'light';}
}
function topbar(right){
  return '<header class="nav"><div class="nav-in"><div class="brand"><span class="logo">'+LOGO+'</span><span>Shift Schedule</span></div><div class="nav-r">'+right+themeToggle()+'</div></div></header>';
}
function viewNoDb(){
  return '<main class="login"><div class="login-toolbar">'+themeToggle()+'</div><div class="login-card"><div class="login-head"><span class="logo big">'+LOGO+'</span><h1>Shift Schedule</h1><p class="sub">Can’t connect to the database. Fill in the Firebase details in config.js or open the app inside the Claude runtime with a working database.</p></div></div></main>';
}
function viewLoading(){
  var msg=S.err?'Can’t reach the data. Your access may have changed.':S.slow?'Still can’t reach the data. Check your connection and that you’re signed in to Claude.':'Loading data…';
  return '<main class="login"><div class="login-toolbar">'+themeToggle()+'</div><div class="login-card"><div class="center-note">'+(S.err||S.slow?'':'<div class="spin"></div>')+esc(msg)+'</div></div></main>';
}
function viewLogin(){
  return '<main class="login"><div class="login-toolbar">'+themeToggle()+'</div>'+ 
    '<div class="login-card"><div class="login-head rise" style="--i:0"><span class="logo big">'+LOGO+'</span><h1>Shift Schedule</h1><p class="sub">Sign in to view your schedule and request leave, or to manage the team.</p></div>'+
    '<form class="panel rise'+(S.shake?' shake':'')+'" style="--i:1" data-form="login">'+
      '<div class="field"><label for="lg-code">Account number</label><input class="input ltr" id="lg-code" inputmode="numeric" autocomplete="username" placeholder="e.g. 7028" data-keep></div>'+
      '<div class="field"><label for="lg-pass">Password</label><input class="input ltr" id="lg-pass" type="password" autocomplete="current-password" data-keep></div>'+
      (S.loginErr?'<div class="err" role="alert">'+esc(S.loginErr)+'</div>':'')+
      '<button class="btn primary block" type="submit">Sign in</button></form></div></main>';
}
function weekBar(){
  var cur=weekStart(todayIso())===S.week;
  return '<div class="weekbar">'+
    '<button class="icon-btn" data-act="wk" data-d="-1" aria-label="Previous week">'+IC.prev+'</button>'+
    '<div class="label"><span class="cal-ico">'+IC.cal+'</span>'+esc(fmtRange(S.week))+'</div>'+
    '<button class="icon-btn" data-act="wk" data-d="1" aria-label="Next week">'+IC.next+'</button>'+
    (cur?'':'<button class="btn sm pill-today" data-act="wk-today">This week</button>')+
    '</div>';
}
function dayHeads(){
  var t=todayIso(),h='';
  for(var i=0;i<7;i++){
    var d=addDays(S.week,i);
    var isT=d===t;
    h+='<th class="th-day '+(isT?'today':'')+'"><div class="th-day-in"><span class="dn">'+DAYS[i]+'</span>'+(isT?'<span class="today-badge">Today</span>':'<small class="dd">'+fmtShort(d)+'</small>')+'</div></th>';
  }
  return h;
}
function empName(code){var e=S.emps.find(function(x){return x.code===code;});return e?e.name:code;}
function initial(n){return esc(String(n||'?').charAt(0).toUpperCase());}

/* employee */
function viewEmp(){
  var emp=S.emps.find(function(e){return e.code===S.session.code;});
  if(!emp){S.session=null;saveSession();return viewLogin();}
  var appr=approvedSet(),t=todayIso();
  var nx=nextShift(emp.code,appr),nxHtml;
  if(nx){
    var when=nx.n===0?'Today':nx.n===1?'Tomorrow':fmtLong(nx.date);
    nxHtml='<div class="next">'+chip(nx.v)+'<div class="t"><span>Your next shift</span><b>'+esc(when)+' · '+times(nx.v)+'</b></div></div>';
  }else nxHtml='<div class="next"><div class="t"><span>Your next shift</span><b>No shift in the schedules entered</b></div></div>';
  var cards='';
  for(var i=0;i<7;i++){
    var d=addDays(S.week,i),v=effective(appr,S.week,emp.code,i);
    var sub=SH.indexOf(v)>=0?times(v):v===LEAVE?'Leave':'No shift';
    cards+='<div class="day rise c-'+SC[v]+(d===t?' today':'')+'" style="--i:'+(i+2)+'"><div class="dn">'+DAYS[i]+'</div><div class="dd">'+fmtShort(d)+'</div><div class="big">'+LBL[v||'']+'</div><div class="tm">'+sub+'</div></div>';
  }
  var mine=S.reqs.filter(function(r){return r.code===emp.code;}).sort(function(a,b){return a.date<b.date?1:-1;});
  var STXT={pending:'Under review',approved:'Approved',rejected:'Rejected',cancelled:'Cancelled'};
  var list=mine.length?'<ul class="list">'+mine.map(function(r){
    var st=statusOf(r),w=weekStart(r.date),i=dayIdx(r.date),cur=hasWeek(w)?((S.rows.get(w+'_'+emp.code)||{days:[]}).days[i]||''):'';
    return '<li><div class="li-main"><b>'+esc(fmtLong(r.date))+'</b><div class="li-sub">'+(SH.indexOf(cur)>=0?'Your shift: '+chip(cur)+' '+times(cur):'')+(r.note?'<span>'+esc(r.note)+'</span>':'')+'</div></div><div class="li-act"><span class="pill '+st+'">'+STXT[st]+'</span>'+(st==='pending'?'<button class="btn sm danger" data-act="cancel-mine" data-id="'+esc(r.id)+'">Cancel request</button>':'')+'</div></li>';
  }).join('')+'</ul>':'<div class="empty">No requests yet.</div>';
  var first=String(emp.name||'').split(' ')[0];
  return topbar('<span class="who-chip"><bdi>'+esc(emp.name)+'</bdi></span><button class="btn sm" data-act="logout">Sign out</button>')+
  '<main class="wrap"><div class="tab-pane"><section class="hero rise" style="--i:0"><div><p class="hi">Welcome back</p><h1><bdi>'+esc(first)+'</bdi></h1></div>'+nxHtml+'</section>'+
  '<div class="page-head rise" style="--i:1"><div><h1>My schedule</h1></div>'+weekBar()+'</div>'+
  '<div class="days">'+cards+'</div>'+
  '<section class="card rise" style="--i:9"><div class="card-h"><h2>Request leave</h2><span class="hint">You get a reply once the admin reviews it</span></div><form class="card-b" data-form="leave"><div class="form-grid">'+
    '<div class="field"><label for="lv-from">From</label><input class="input" id="lv-from" type="date" min="'+t+'" data-keep></div>'+
    '<div class="field"><label for="lv-to">To (optional)</label><input class="input" id="lv-to" type="date" min="'+t+'" data-keep></div></div>'+
    '<div class="field"><label for="lv-note">Note (optional)</label><textarea class="input" id="lv-note" maxlength="300" data-keep></textarea></div>'+
    '<div><button class="btn primary" type="submit">Send request</button></div></form></section>'+
  '<section class="card rise" style="--i:10"><div class="card-h"><h2>My requests</h2></div>'+list+'</section>'+
  '<section class="card rise" style="--i:11"><div class="card-h"><h2>Change password</h2></div><form class="card-b" data-form="emp-chpass" autocomplete="off"><div class="form-grid">'+
    '<div class="field"><label for="ep-0">Current password</label><input class="input ltr" id="ep-0" type="password" autocomplete="current-password" data-keep></div>'+
    '<div class="field"><label for="ep-1">New password</label><input class="input ltr" id="ep-1" type="password" autocomplete="new-password" data-keep></div>'+
    '<div class="field"><label for="ep-2">Confirm new password</label><input class="input ltr" id="ep-2" type="password" autocomplete="new-password" data-keep></div></div>'+
    '<div><button class="btn" type="submit">Change password</button></div></form></section></div></main>';
}

/* admin */
function viewAdmin(){
  var pend=S.reqs.filter(function(r){return statusOf(r)==='pending';}).length;
  var tabs=[['schedule','Schedule',IC.cal],['requests','Requests',IC.inbox],['staff','Staff',IC.users],['settings','Settings',IC.gear]];
  var seg='<div class="tabs rise" style="--i:0"><div class="seg" role="tablist">'+tabs.map(function(x){
    return '<button type="button" role="tab" aria-selected="'+(S.tab===x[0])+'" class="'+(S.tab===x[0]?'on':'')+'" data-act="tab" data-v="'+x[0]+'"><span class="tab-ic">'+x[2]+'</span><span>'+x[1]+'</span>'+(x[0]==='requests'&&pend?'<span class="badge">'+pend+'</span>':'')+'</button>';
  }).join('')+'</div></div>';
  var body=S.tab==='requests'?tabRequests():S.tab==='staff'?tabStaff():S.tab==='settings'?tabSettings():tabSchedule(pend);
  return topbar('<span class="who-chip">Admin · <bdi>'+esc(S.cfg.adminCode||'')+'</bdi></span><button class="btn sm" data-act="logout">Sign out</button>')+'<main class="wrap">'+seg+'<div class="tab-pane" id="tab-pane">'+body+'</div></main>';
}
function tile(cls,icon,k,v,s,i,suffix){
  return '<div class="tile rise '+cls+'" style="--i:'+i+'"><span class="ic">'+IC[icon]+'</span><span class="k">'+k+'</span><span class="v"><span data-count="'+v+'">'+v+'</span>'+(suffix||'')+'</span><span class="s">'+s+'</span></div>';
}
function tabSchedule(pend){
  if(!hasWeek(S.week)){
    var prev=addDays(S.week,-7);
    var blankRoster=S.emps.map(function(e){
      var cells='';
      for(var i=0;i<7;i++){
        cells+='<td class="'+(addDays(S.week,i)===todayIso()?'today':'')+'"><select class="sel c-none" data-sel data-code="'+esc(e.code)+'" data-i="'+i+'" aria-label="'+esc(e.name)+' '+DAYS[i]+'" tabindex="0"><option value="" selected>—</option><option value="ص">AM</option><option value="و">MID</option><option value="م">PM</option><option value="س">LATE</option><option value="ج">LV</option></select></td>';
      }
      return '<tr><th class="name"><div class="nm"><span class="av sm '+avCls(e.code)+'">'+initial(e.name)+'</span><div><bdi>'+esc(e.name)+'</bdi><small>'+esc(e.code)+'</small></div></div></th>'+cells+'</tr>';
    }).join('');
    return '<div class="page-head rise" style="--i:1"><div><h1>Weekly schedule</h1></div><div class="page-actions">'+weekBar()+'</div></div>'+
      '<section class="card rise" style="--i:2"><div class="empty"><h2>No schedule for this week</h2><p>Start from last week’s schedule and edit it, or create a blank one.</p><div class="li-act" style="justify-content:center">'+
      (hasWeek(prev)?'<button class="btn primary" data-act="create-week" data-mode="copy">Copy last week</button>':'')+
      '<button class="btn" data-act="create-week" data-mode="blank">Blank schedule</button></div></div></section>'+
      '<section class="card rise" style="--i:3"><div class="card-h"><h2>Employee roster</h2><span class="hint">All staff are shown automatically for this week.</span></div><div class="scroll"><table class="roster"><thead><tr><th class="name">Employee</th>'+dayHeads()+'</tr></thead><tbody>'+blankRoster+'</tbody></table></div></section>';
  }
  var appr=approvedSet(),pset=pendingSet(),cov=coverage(S.week,appr),t=todayIso(),sh=shifts();
  var daysBad=cov.perDay.filter(function(x){return x>0;}).length;
  var sub=cov.worst?'Biggest shortage: '+DAYS[cov.worst.i]+' on the '+LBL[cov.worst.s]+' shift (short by '+(-cov.worst.diff)+')':'All shifts are covered this week';
  var head='<div class="page-head rise" style="--i:1"><div><h1>Weekly schedule</h1><p class="sub">'+esc(sub)+'</p></div><div class="page-actions">'+weekBar()+'<button class="btn sm secondary print-btn" data-act="print" title="Print or save as PDF">'+IC.print+'<span>Print</span></button></div></div>';
  var tiles='<div class="tiles">'+
    tile(cov.total?'bad':'good','alert','Total shortage',cov.total,cov.total?'open spots across shifts this week':'Coverage is complete this week',2)+
    tile(daysBad?'warn':'good','days','Days with a shortage',daysBad,daysBad?'Need schedule changes':'No understaffed days',3,' <small>of 7</small>')+
    tile('ind','inbox','Pending leave requests',pend,pend?'Waiting for your decision':'Nothing waiting',4)+'</div>';
  var covRows=SH.map(function(s){
    var need=Number(sh[KEY[s]].need)||0;
    return '<tr><th class="sh"><div class="row">'+chip(s)+'<div class="meta"><span>'+times(s)+'</span><span>Needs '+need+'</span></div></div></th>'+
      cov.cells[s].map(function(c,i){
        var cls=c.diff<0?'bad':c.diff===0?'ok':'extra',lab=c.diff<0?'Short '+(-c.diff):c.diff===0?'Full':'Over '+c.diff;
        var pct=c.need>0?Math.min(100,Math.round(c.count/c.need*100)):100;
        return '<td class="'+cls+(addDays(S.week,i)===t?' today':'')+'"><span class="cnt">'+c.count+'</span><span class="of"> / '+c.need+'</span><small>'+lab+'</small><span class="bar"><i style="width:'+pct+'%"></i></span></td>';
      }).join('')+'</tr>';
  }).join('');
  var foot='<tr><th class="sh">Daily shortage</th>'+cov.perDay.map(function(x){return '<td class="'+(x?'bad':'')+'">'+(x||'—')+'</td>';}).join('')+'</tr>';
  var summaryRows=SH.map(function(s){
    var totalCount=0,totalNeed=0;
    cov.cells[s].forEach(function(c){totalCount+=c.count;totalNeed+=c.need;});
    var diff=totalCount-totalNeed;
    return '<tr><th class="sh"><div class="row"><span class="chip c-'+SC[s]+'">'+LBL[s]+'</span><div class="meta"><span>'+times(s)+'</span><span>'+totalCount+'/'+totalNeed+'</span></div></div></th>'+cov.cells[s].map(function(c){
      var cls=c.diff<0?'bad':c.diff===0?'ok':'extra';
      var label=c.diff<0?'Short '+(-c.diff):c.diff>0?'Extra '+c.diff:'Exact';
      return '<td class="'+cls+'"><strong>'+c.count+'</strong><small>'+label+'</small></td>';
    }).join('')+'<td class="'+(diff<0?'bad':'ok')+'"><strong>'+(diff<0?diff:diff||0)+'</strong><small>'+(diff<0?'short':'balanced')+'</small></td></tr>';
  }).join('');
  var summaryCard='<section class="card rise" style="--i:5"><div class="card-h"><h2>Current week staffing snapshot</h2><span class="hint">Each shift count vs requirement for this week</span></div><div class="scroll"><table class="summary"><thead><tr><th>Shift</th>'+dayHeads()+'<th>Total</th></tr></thead><tbody>'+summaryRows+'</tbody></table></div></section>';
  var covCard='<section class="card rise" style="--i:6"><div class="card-h"><h2>Coverage and shortages</h2><span class="hint">Scheduled / required. Only staff marked “Counted” are included.</span></div><div class="scroll"><table class="cov"><thead><tr><th></th>'+dayHeads()+'</tr></thead><tbody>'+covRows+'</tbody><tfoot>'+foot+'</tfoot></table></div></section>';
  var q=(S.rosterFilter||'').toLowerCase().trim();
  var rosterRows=S.emps.map(function(e){
    var isHidden=q&&(e.name.toLowerCase().indexOf(q)<0 && String(e.code).indexOf(q)<0);
    var tds='';
    for(var i=0;i<7;i++){
      var d=addDays(S.week,i),v=effective(appr,S.week,e.code,i),td,isP=pset.has(e.code+'|'+d);
      if(appr.has(e.code+'|'+d)){
        td='<span class="locked c-lv" title="Approved leave. Cancel it in the Requests tab to edit this cell.">LV</span>';
      }else{
        td='<select class="sel c-'+SC[v]+(isP?' pend':'')+(S.flash===e.code+'|'+i?' flash':'')+'" data-sel data-code="'+esc(e.code)+'" data-i="'+i+'" aria-label="'+esc(e.name)+' '+DAYS[i]+'"'+(isP?' title="Has a pending leave request"':'')+' tabindex="0">' +
          ['','ص','و','م','س','ج'].map(function(o){return '<option value="'+o+'"'+(o===v?' selected':'')+'>'+LBL[o]+'</option>';}).join('')+'</select>';
      }
      tds+='<td class="'+(d===t?'today':'')+'">'+td+'</td>';
    }
    return '<tr'+(isHidden?' style="display:none"':'')+'><th class="name"><div class="nm"><span class="av sm '+avCls(e.code)+'">'+initial(e.name)+'</span><div><bdi>'+esc(e.name)+'</bdi>'+(e.counted===false?'<em class="tag">Not counted</em>':'')+'<small>'+esc(e.code)+'</small></div></div></th>'+tds+'</tr>';
  }).join('');
  var rosterToolbar='<div class="roster-toolbar"><div class="search-box">'+IC.search+'<input class="input sm" id="roster-q" placeholder="Filter employee by name or account..." value="'+esc(S.rosterFilter||'')+'" data-act-input="filter-roster" data-keep>'+(S.rosterFilter?'<button class="icon-btn-sm" data-act="clear-roster-filter" title="Clear">✕</button>':'')+'</div><span class="hint count-hint">'+S.emps.length+' employees</span></div>';
  var rosterCard='<section class="card rise" style="--i:7"><div class="card-h"><h2>Employee roster</h2><span class="hint">AM, MID, PM and LATE are shifts; LV is leave. Shortcuts: 1(AM), 2(MID), 3(PM), 4(LATE), 5(LV), 0(Off).</span></div>'+rosterToolbar+'<div class="scroll"><table class="roster"><thead><tr><th class="name">Employee</th>'+dayHeads()+'</tr></thead><tbody>'+(rosterRows||'<tr><td colspan="8" class="hint">Add employees from the Staff tab.</td></tr>')+'</tbody></table></div></section>';
  return head+tiles+summaryCard+covCard+rosterCard;
}
function tabRequests(){
  var appr=approvedSet(),STXT={approved:'Approved',rejected:'Rejected',cancelled:'Cancelled'};
  var pend=S.reqs.filter(function(r){return statusOf(r)==='pending';}).sort(function(a,b){return a.date<b.date?-1:1;});
  var pl=pend.length?'<ul class="list">'+pend.map(function(r){
    var w=weekStart(r.date),i=dayIdx(r.date),cur=hasWeek(w)?((S.rows.get(w+'_'+r.code)||{days:[]}).days[i]||''):'',im=impact(r,appr);
    return '<li><div class="li-main"><div class="who"><span class="av '+avCls(r.code)+'">'+initial(empName(r.code))+'</span><div><b><bdi>'+esc(empName(r.code))+'</bdi></b><small>'+esc(r.code)+'</small></div></div>'+
      '<div class="li-sub"><b style="color:var(--fg)">'+esc(fmtLong(r.date))+'</b>'+(SH.indexOf(cur)>=0?'<span>Shift: '+chip(cur)+' '+times(cur)+'</span>':'')+'</div>'+
      (r.note?'<div class="li-sub">Note: '+esc(r.note)+'</div>':'')+'<div class="impact '+im.cls+'">'+esc(im.txt)+'</div></div>'+
      '<div class="li-act"><button class="btn good sm" data-act="decide" data-st="approved" data-id="'+esc(r.id)+'">Approve</button><button class="btn danger sm" data-act="decide" data-st="rejected" data-id="'+esc(r.id)+'">Reject</button></div></li>';
  }).join('')+'</ul>':'<div class="empty">No pending requests.</div>';
  var hist=S.reqs.filter(function(r){return statusOf(r)!=='pending';}).sort(function(a,b){return ((S.decs.get(b.id)||{}).at||0)-((S.decs.get(a.id)||{}).at||0);});
  var shown=hist.filter(function(r){return S.filter==='all'||statusOf(r)===S.filter;}).slice(0,60);
  var fl=[['all','All'],['approved','Approved'],['rejected','Rejected'],['cancelled','Cancelled']];
  var hl=shown.length?'<ul class="list">'+shown.map(function(r){
    var st=statusOf(r);
    return '<li><div class="li-main"><div class="who"><span class="av sm '+avCls(r.code)+'">'+initial(empName(r.code))+'</span><b><bdi>'+esc(empName(r.code))+'</bdi></b></div><div class="li-sub"><span>'+esc(fmtLong(r.date))+'</span>'+(r.note?'<span>'+esc(r.note)+'</span>':'')+'</div></div><div class="li-act"><span class="pill '+st+'">'+STXT[st]+'</span>'+(st==='approved'?'<button class="btn sm danger" data-act="decide" data-st="cancelled" data-id="'+esc(r.id)+'">Cancel leave</button>':'')+'</div></li>';
  }).join('')+'</ul>':'<div class="empty">No past decisions.</div>';
  return '<div class="page-head rise" style="--i:1"><h1>Leave requests</h1></div>'+
    '<section class="card rise" style="--i:1"><div class="card-h"><h2>Add leave for an employee</h2><span class="hint">Approved immediately</span></div><form class="card-b" data-form="admin-leave"><div class="form-grid"><div class="field"><label for="al-emp">Employee</label><select class="input" id="al-emp" data-keep><option value="">Choose…</option>'+S.emps.map(function(e){return '<option value="'+esc(e.code)+'">'+esc(e.name)+' ('+esc(e.code)+')</option>';}).join('')+'</select></div><div class="field"><label for="al-from">From</label><input class="input" id="al-from" type="date" data-keep></div><div class="field"><label for="al-to">To (optional)</label><input class="input" id="al-to" type="date" data-keep></div></div><div class="field"><label for="al-note">Note (optional)</label><textarea class="input" id="al-note" maxlength="300" data-keep></textarea></div><div><button class="btn primary" type="submit">Add leave</button></div></form></section>'+
    '<section class="card rise" style="--i:2"><div class="card-h"><h2>Awaiting decision</h2><div class="li-act">'+(pend.length>1?'<button class="btn good sm" data-act="approve-all-pending">Approve all ('+pend.length+')</button>':'')+'<span class="hint">Impact is calculated from current schedule</span></div></div>'+pl+'</section>'+
    '<section class="card rise" style="--i:3"><div class="card-h"><h2>Past decisions</h2><div class="seg">'+fl.map(function(x){return '<button type="button" class="'+(S.filter===x[0]?'on':'')+'" data-act="filter" data-v="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div></div>'+hl+'</section>';
}
function tabStaff(){
  var appr=approvedSet();
  var weekList=S.emps.map(function(e){
    var dayList='';
    for(var i=0;i<7;i++){
      var v=effective(appr,S.week,e.code,i),label=v?LBL[v]:'—';
      var extra=v?'<span class="mini-time">'+times(v)+'</span>':'<span class="mini-time muted">Off</span>';
      dayList+='<div class="mini-day"><span class="mini-name">'+DAYS[i].slice(0,2)+'</span><span class="mini-shift '+(v?('c-'+SC[v]):'none')+'">'+label+'</span>'+extra+'</div>';
    }
    return '<li class="staff-row"><div class="who"><span class="av '+avCls(e.code)+'">'+initial(e.name)+'</span><div><b><bdi>'+esc(e.name)+'</bdi></b><small>Account '+esc(e.code)+'</small></div></div><div class="mini-week">'+dayList+'</div><div class="li-act"><label class="hint" style="display:flex;align-items:center;gap:8px">Counted in coverage<button type="button" class="sw" role="switch" aria-checked="'+(e.counted!==false)+'" data-act="toggle" data-code="'+esc(e.code)+'" aria-label="Counted in coverage"></button></label><button class="btn sm" data-act="reset-pw" data-code="'+esc(e.code)+'">Reset password</button><button class="btn sm danger" data-act="del-emp" data-code="'+esc(e.code)+'">'+(S.confirmDel===e.code?'Confirm delete':'Delete')+'</button></div></li>';
  }).join('');
  return '<div class="page-head rise" style="--i:1"><h1>Staff</h1></div>'+
    '<section class="card rise" style="--i:2"><div class="card-h"><h2>Add employee</h2><span class="hint">New employees start with password '+DEFAULT_PW+'</span></div><form class="card-b" data-form="add-emp"><div class="form-grid"><div class="field"><label for="ne-name">Name</label><input class="input" id="ne-name" maxlength="60" data-keep></div><div class="field"><label for="ne-code">Account number</label><input class="input ltr" id="ne-code" inputmode="numeric" maxlength="12" data-keep></div></div><div><button class="btn primary" type="submit">Add</button></div></form></section>'+
    '<section class="card rise" style="--i:3"><div class="card-h"><h2>Schedule overview</h2><span class="hint">Team shifts for this week</span></div><div class="mini-grid">'+(S.emps.length?S.emps.map(function(e){var summary=''; for(var i=0;i<7;i++){var v=effective(appr,S.week,e.code,i); summary += '<span class="mini-tag '+(v?'c-'+SC[v]:'empty')+'">'+DAYS[i].slice(0,2)+': '+(v?LBL[v]:'—')+'</span>'; } return '<div class="mini-person"><div class="who"><span class="av '+avCls(e.code)+'">'+initial(e.name)+'</span><div><b><bdi>'+esc(e.name)+'</bdi></b><small>'+esc(e.code)+'</small></div></div><div class="mini-stack">'+summary+'</div></div>';}).join(''):'<div class="empty">No employees yet.</div>')+'</div></section>'+
    '<section class="card rise" style="--i:4"><div class="card-h"><h2>Team</h2><span class="hint">'+S.emps.length+' employees</span></div>'+(weekList?'<ul class="list">'+weekList+'</ul>':'<div class="empty">No employees yet.</div>')+'</section>';
}
function tabSettings(){
  var sh=shifts();
  var rows=SH.map(function(s){
    var k=KEY[s],c=sh[k];
    return '<div class="cfg-row">'+chip(s)+
      '<div class="field"><label for="cf-'+k+'-s">Start</label><input class="input ltr" id="cf-'+k+'-s" type="time" value="'+esc(c.start)+'" data-cfg data-k="'+k+'" data-f="start"></div>'+
      '<div class="field"><label for="cf-'+k+'-e">End</label><input class="input ltr" id="cf-'+k+'-e" type="time" value="'+esc(c.end)+'" data-cfg data-k="'+k+'" data-f="end"></div>'+
      '<div class="field need"><label for="cf-'+k+'-n">Required</label><input class="input ltr" id="cf-'+k+'-n" type="number" min="0" max="99" value="'+(Number(c.need)||0)+'" data-cfg data-k="'+k+'" data-f="need"></div></div>';
  }).join('');
  return '<div class="page-head rise" style="--i:1"><h1>Settings</h1></div>'+
    '<section class="card rise" style="--i:2"><div class="card-h"><h2>Shift requirements</h2><span class="hint">Saves automatically and recalculates shortages</span></div><div class="card-b">'+rows+'</div></section>'+
    '<section class="card rise" style="--i:3"><div class="card-h"><h2>Admin password</h2></div><form class="card-b" data-form="chpass" autocomplete="off"><div class="form-grid"><div class="field"><label for="cp-1">New password</label><input class="input ltr" id="cp-1" type="password" autocomplete="new-password" data-keep></div><div class="field"><label for="cp-2">Confirm password</label><input class="input ltr" id="cp-2" type="password" autocomplete="new-password" data-keep></div></div><div><button class="btn primary" type="submit">Change password</button></div></form></section>';
}

/* ---------- render ---------- */
function snapDrafts(root){var m={};root.querySelectorAll('[data-keep]').forEach(function(el){if(el.id)m[el.id]={v:el.value,f:document.activeElement===el,s:el.selectionStart,e:el.selectionEnd};});return m;}
function restoreDrafts(m){for(var id in m){var el=document.getElementById(id);if(!el)continue;if(m[id].v!=='')el.value=m[id].v;if(m[id].f){el.focus();try{el.setSelectionRange(m[id].s,m[id].e);}catch(e){}}}}
function countUps(root){
  if(reduced())return;
  root.querySelectorAll('[data-count]').forEach(function(el){
    var to=Number(el.dataset.count)||0;if(!to)return;
    var t0=null,dur=900;el.textContent='0';
    function step(ts){if(t0===null)t0=ts;var p=Math.min(1,(ts-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=String(Math.round(to*e));if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  });
}
var scheduleRenderLockUntil=0;
function suppressScheduleRender(ms){scheduleRenderLockUntil=Date.now()+(ms||150);}
function render(){
  if(Date.now() < scheduleRenderLockUntil)return;
  var active=document.activeElement;
  var focusCell=null;
  if(active&&active.matches&&active.matches('[data-sel]')){
    focusCell={code:active.dataset.code,i:Number(active.dataset.i)||0};
  }
  var root=$('#app'),drafts=snapDrafts(root);
  var html;
  if(S.nodb)html=viewNoDb();
  else if(!loaded())html=viewLoading();
  else if(!S.session)html=viewLogin();
  else if(S.session.role==='admin')html=viewAdmin();
  else html=viewEmp();
  var key=(loaded()&&S.session?S.session.role+'|'+S.tab+'|'+S.week:'x|'+(loaded()?'login':'load'))+'|'+(S.nodb?'n':'');
  var animate=key!==S.viewKey;S.viewKey=key;
  root.classList.remove('anim','show');
  root.setAttribute('data-state','rendering');
  root.innerHTML='';
  root.innerHTML=html;
  if(animate){
    requestAnimationFrame(function(){
      root.classList.add('anim');
      requestAnimationFrame(function(){
        root.classList.add('show');
        root.removeAttribute('data-state');
      });
    });
  } else {
    root.removeAttribute('data-state');
  }
  restoreDrafts(drafts);
  if(focusCell){
    var target=null;
    var sels=root.querySelectorAll('select[data-sel]');
    for(var idx=0;idx<sels.length;idx++){
      var sel=sels[idx];
      if(sel.dataset.code===focusCell.code && Number(sel.dataset.i||0)===focusCell.i){target=sel;break;}
    }
    if(target){target.focus();}
  }
  if(animate)countUps(root);
}

/* ---------- actions ---------- */
function startSession(s){S.session=s;S.loginErr='';S.tab='schedule';saveSession();render();window.scrollTo(0,0);}
function setErr(m){S.loginErr=m;S.shake=true;render();setTimeout(function(){S.shake=false;},600);}
function val(id){var el=document.getElementById(id);return el?el.value:'';}
function clearVals(ids){ids.forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});}

async function onForm(name){
  try{
    if(name==='login'){
      var code=normalizeCode(val('lg-code')),pw=val('lg-pass'),bad='Account number or password is incorrect.';
      if(!code||!pw)return setErr('Enter your account number and password.');
      if(S.cfg.adminCode&&code===String(S.cfg.adminCode)){
        var hs=await sha((S.cfg.adminSalt||'')+pw);
        if(hs!==S.cfg.adminHash)return setErr(bad);
        var ce=S.user?await S.user.canEdit():true;
        if(!ce)return setErr('Your account can’t edit this page. Open it with the admin account.');
        return startSession({role:'admin'});
      }
      var emp=S.emps.find(function(e){return normalizeCode(e.code)===code;});
      if(!emp)return setErr(bad);
      if(!(await checkPw(code,pw)))return setErr(bad);
      startSession({role:'emp',code:code});
    }else if(name==='emp-chpass'){
      var c0=S.session.code,cur=val('ep-0'),n1=val('ep-1'),n2=val('ep-2');
      if(!(await checkPw(c0,cur)))return toast('Current password is incorrect.','err');
      if(n1.length<6)return toast('New password must be at least 6 characters.','err');
      if(n1!==n2)return toast('Passwords don’t match.','err');
      var nh=await sha(c0+':'+n1);
      await wr('pins/'+c0,function(){return S.db.doc('pins/'+c0).set({hash:nh});});
      clearVals(['ep-0','ep-1','ep-2']);toast('Password changed');
    }else if(name==='chpass'){
      var a1=val('cp-1'),a2=val('cp-2');
      if(a1.length<6)return toast('Password must be at least 6 characters.','err');
      if(a1!==a2)return toast('Passwords don’t match.','err');
      var salt=rnd(),hash=await sha(salt+a1);
      await saveCfg({adminSalt:salt,adminHash:hash});
      clearVals(['cp-1','cp-2']);toast('Password changed');
    }else if(name==='leave'){
      var me=S.session.code,from=val('lv-from'),to=val('lv-to')||from,note=val('lv-note').trim().slice(0,300),t=todayIso();
      if(!from)return toast('Choose a leave date.','err');
      if(from<t)return toast('Choose today or a later date.','err');
      if(to<from)return toast('End date is before the start date.','err');
      var dates=[],d=from;while(d<=to&&dates.length<=31){dates.push(d);d=addDays(d,1);}
      if(dates.length>31)return toast('Maximum 31 days per request.','err');
      var have=new Set(S.reqs.filter(function(r){return r.code===me&&(statusOf(r)==='pending'||statusOf(r)==='approved');}).map(function(r){return r.date;}));
      var fresh=dates.filter(function(x){return !have.has(x);});
      if(!fresh.length)return toast('You already have requests for these days.','err');
      for(var i=0;i<fresh.length;i++){await S.db.collection('requests').add({code:me,date:fresh[i],note:note,createdAt:Date.now()});}
      clearVals(['lv-from','lv-to','lv-note']);
      toast(fresh.length>1?'Sent '+fresh.length+' requests':'Request sent');
    }else if(name==='admin-leave'){
      var ac=val('al-emp'),af=val('al-from'),at=val('al-to')||af,an=val('al-note').trim().slice(0,300);
      if(!ac)return toast('Choose an employee.','err');
      if(!af)return toast('Choose a leave date.','err');
      if(at<af)return toast('End date is before the start date.','err');
      var ad=[],dd=af;while(dd<=at&&ad.length<=31){ad.push(dd);dd=addDays(dd,1);}
      if(ad.length>31)return toast('Maximum 31 days per request.','err');
      var added=0;
      for(var q=0;q<ad.length;q++){
        var day=ad[q];
        var ex=S.reqs.find(function(r){var s=statusOf(r);return r.code===ac&&r.date===day&&(s==='pending'||s==='approved');});
        if(ex&&statusOf(ex)==='approved')continue;
        var rid=ex?ex.id:rnd();
        if(!ex)await S.db.doc('requests/'+rid).set({code:ac,date:day,note:an,createdAt:Date.now(),byAdmin:true});
        await wr('decisions/'+rid,function(){return S.db.doc('decisions/'+rid).set({status:'approved',at:Date.now()});});
        added++;
      }
      clearVals(['al-from','al-to','al-note']);
      if(added)toast('Leave added for '+empName(ac)+' ('+added+(added>1?' days)':' day)'));
      else toast('Those days are already approved.','err');
    }else if(name==='add-emp'){
      var nm=val('ne-name').trim(),cd=normalizeCode(val('ne-code'));
      if(!nm||!isValidAccountCode(cd))return toast('Enter a name and a 3–12 digit account number.','err');
      if(S.emps.some(function(e){return normalizeCode(e.code)===cd;})||cd===String(S.cfg.adminCode))return toast('This number is already in use.','err');
      var ord=S.emps.reduce(function(m,e){return Math.max(m,Number(e.order)||0);},0)+1;
      var dh=await sha(cd+':'+DEFAULT_PW);
      await wr('employees/'+cd,function(){return S.db.doc('employees/'+cd).set({name:nm,order:ord,counted:true});});
      await wr('pins/'+cd,function(){return S.db.doc('pins/'+cd).set({hash:dh});});
      clearVals(['ne-name','ne-code']);toast('Employee added');
    }
  }catch(e){fail(e);}
}

async function act(a,b){
  try{
    if(a==='logout'){S.session=null;S.loginErr='';saveSession();render();}
    else if(a==='theme'){
      var next=(document.documentElement.dataset.theme==='dark'?'light':'dark');
      setTheme(next);
      render();
    }
    else if(a==='tab'){S.tab=b.dataset.v;S.confirmDel=null;render();}
    else if(a==='filter'){S.filter=b.dataset.v;render();}
    else if(a==='wk'){S.week=addDays(S.week,7*Number(b.dataset.d));render();}
    else if(a==='wk-today'){S.week=weekStart(todayIso());render();}
    else if(a==='create-week'){
      var w=S.week,prev=addDays(w,-7),copy=b.dataset.mode==='copy';
      for(var i=0;i<S.emps.length;i++){
        var e=S.emps[i],days=['','','','','','',''];
        if(copy){var pr=S.rows.get(prev+'_'+e.code);if(pr&&pr.days)days=pr.days.map(function(x){return x===LEAVE?'':x;});}
        await setRow(w,e.code,days);
      }
      toast('Week schedule created');
    }
    else if(a==='decide'){
      var id=b.dataset.id,st=b.dataset.st;
      await wr('decisions/'+id,function(){return S.db.doc('decisions/'+id).set({status:st,at:Date.now()});});
      toast(st==='approved'?'Approved. Shortages updated.':st==='rejected'?'Request rejected':'Leave cancelled');
    }
    else if(a==='cancel-mine'){await S.db.doc('requests/'+b.dataset.id).delete();toast('Request cancelled');}
    else if(a==='toggle'){
      var c=b.dataset.code,em=S.emps.find(function(x){return x.code===c;});
      await wr('employees/'+c,function(){return S.db.doc('employees/'+c).update({counted:em.counted===false});});
    }
    else if(a==='reset-pw'){
      var c2=b.dataset.code,h2=await sha(c2+':'+DEFAULT_PW);
      await wr('pins/'+c2,function(){return S.db.doc('pins/'+c2).set({hash:h2});});
      toast('Password reset to '+DEFAULT_PW);
    }
    else if(a==='del-emp'){
      var c3=b.dataset.code;
      if(S.confirmDel!==c3){S.confirmDel=c3;render();setTimeout(function(){if(S.confirmDel===c3){S.confirmDel=null;render();}},4000);return;}
      S.confirmDel=null;await S.db.doc('employees/'+c3).delete();toast('Employee deleted');
    }
    else if(a==='print'){
      window.print();
    }
    else if(a==='clear-roster-filter'){
      S.rosterFilter='';
      render();
    }
    else if(a==='approve-all-pending'){
      var pends=S.reqs.filter(function(r){return statusOf(r)==='pending';});
      if(!pends.length)return;
      for(var q=0;q<pends.length;q++){
        var rid=pends[q].id;
        await wr('decisions/'+rid,function(){return S.db.doc('decisions/'+rid).set({status:'approved',at:Date.now()});});
      }
      toast('Approved '+pends.length+' requests');
    }
  }catch(e){fail(e);}
}
async function onSel(el){
  var code=el.dataset.code,i=Number(el.dataset.i),v=el.value;
  var r=S.rows.get(S.week+'_'+code),days=(r&&r.days?r.days.slice():['','','','','','','']);
  while(days.length<7)days.push('');
  days[i]=v;
  S.flash=code+'|'+i;setTimeout(function(){S.flash=null;},800);
  try{await setRow(S.week,code,days);}catch(e){S.flash=null;fail(e);}
}
async function saveShifts(){
  var o={},bad=false;
  document.querySelectorAll('[data-cfg]').forEach(function(el){
    var k=el.dataset.k,f=el.dataset.f;o[k]=o[k]||{};
    if(f==='need')o[k][f]=Math.max(0,Math.min(99,parseInt(el.value,10)||0));
    else{if(!el.value)bad=true;o[k][f]=el.value;}
  });
  if(bad)return toast('Choose a start and end time for every shift.','err');
  try{await saveCfg({shifts:o});toast('Saved');}catch(e){fail(e);}
}

/* ---------- events ---------- */
function moveScheduleFocus(active,dx,dy){
  if(!(active&&active.matches&&active.matches('[data-sel]')))return;
  var list=Array.from(document.querySelectorAll('select[data-sel]'));
  if(!list.length)return;
  var rowCodes=[];
  list.forEach(function(sel){if(rowCodes.indexOf(sel.dataset.code)===-1)rowCodes.push(sel.dataset.code);});
  var rowIndex=rowCodes.indexOf(active.dataset.code);
  var dayIndex=Number(active.dataset.i)||0;
  var nextRow=clamp(rowIndex+dy,0,rowCodes.length-1);
  var nextDay=clamp(dayIndex+dx,0,6);
  var target=list.find(function(sel){return sel.dataset.code===rowCodes[nextRow] && (Number(sel.dataset.i)||0)===nextDay;});
  if(target){target.focus();try{target.setAttribute('data-focus-move','true');setTimeout(function(){target.removeAttribute('data-focus-move');},120);}catch(e){}}
}
function clamp(v,min,max){return Math.min(Math.max(v,min),max);}

document.addEventListener('keydown',function(e){
  var t=e.target;
  if(!(t&&t.matches&&t.matches('select[data-sel]')))return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='ArrowUp'||e.key==='ArrowDown'){
    suppressScheduleRender(180);
    e.preventDefault();
    e.stopPropagation();
    var dx=e.key==='ArrowRight'?1:(e.key==='ArrowLeft'?-1:0);
    var dy=e.key==='ArrowDown'?1:(e.key==='ArrowUp'?-1:0);
    moveScheduleFocus(t,dx,dy);
    return;
  }
  var k=e.key.toLowerCase();
  var map={'1':'ص','a':'ص','2':'و','m':'و','3':'م','p':'م','4':'س','l':'س','5':'ج','v':'ج','0':'','delete':'','backspace':''};
  if(map[k]!==undefined){
    e.preventDefault();
    t.value=map[k];
    suppressScheduleRender(200);
    onSel(t);
  }
});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.matches&&t.matches('[data-act-input="filter-roster"]')){
    S.rosterFilter=t.value;
    var val=t.value.toLowerCase().trim();
    var rows=document.querySelectorAll('.roster tbody tr');
    var visible=0;
    rows.forEach(function(r){
      var text=r.textContent.toLowerCase();
      var match=!val||text.indexOf(val)>=0;
      r.style.display=match?'':'none';
      if(match)visible++;
    });
    var countEl=document.querySelector('.count-hint');
    if(countEl)countEl.textContent=visible+' of '+S.emps.length+' employees';
  }
});
document.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(b)act(b.dataset.act,b);});
document.addEventListener('change',function(e){var t=e.target;if(t.matches&&t.matches('[data-sel]')){suppressScheduleRender(200);onSel(t);}else if(t.matches&&t.matches('[data-cfg]'))saveShifts();});
document.addEventListener('submit',function(e){var f=e.target.closest('form[data-form]');if(f){e.preventDefault();onForm(f.dataset.form);}});

/* ---------- boot ---------- */
async function boot(){
  setTheme(getStoredTheme());
  render();
  var c=window.claude;
  if(c&&c.use){
    /* running inside Claude: database comes from the runtime */
    try{S.db=await c.use('db');S.user=await c.use('user');}catch(e){S.db=null;}
  }else if(window.firebase&&hasValidFirebaseConfig()){
    /* standalone (GitHub Pages etc.): Firestore, configured in config.js */
    try{firebase.initializeApp(window.FIREBASE_CONFIG);S.db=firebase.firestore();}catch(e){S.db=null;}
  }
  if(!S.db){
    S.db=createLocalMockDb();
    S.user={canEdit:function(){return Promise.resolve(true);}};
    S.nodb=false;
  }
  var timer=setTimeout(function(){if(!loaded()){S.slow=true;render();}},10000);
  function done(k){S.ready[k]=true;if(loaded()){clearTimeout(timer);S.slow=false;}render();}
  function onErr(e){S.err=(e&&e.code)||'error';render();}
  S.db.doc('config/main').onSnapshot(function(s){S.cfg=s.exists?Object.assign({},s.data()):{};done('cfg');},onErr);
  S.db.collection('employees').onSnapshot(function(s){
    S.emps=s.docs.map(function(d){return Object.assign({},d.data(),{code:d.id});}).sort(function(a,b){return (Number(a.order)||0)-(Number(b.order)||0)||String(a.name).localeCompare(String(b.name));});
    done('emp');
  },onErr);
  S.db.collection('rows').onSnapshot(function(s){S.rows=new Map(s.docs.map(function(d){return [d.id,d.data()];}));done('rows');},onErr);
  S.db.collection('requests').onSnapshot(function(s){S.reqs=s.docs.map(function(d){return Object.assign({},d.data(),{id:d.id});});done('req');},onErr);
  S.db.collection('decisions').onSnapshot(function(s){S.decs=new Map(s.docs.map(function(d){return [d.id,d.data()];}));done('dec');},onErr);
}
boot();
})();
