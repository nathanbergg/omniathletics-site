/* Omni Athletics app core: data layer (live or demo), helpers, chart. Built by Suubi Media. */
(function(){
var CFG={url:'https://ajfoqgihhqetfuctfjyw.supabase.co',key:'sb_publishable_Nnzzcniu8alqGRy1A8FF7g_f0g4N1CW'};
var O=window.Omni={};
O.PLANS={Essentials:5000,Plus:10000,Premium:30000};
O.RHYTHMS={Pulse:'2 days a week · full body cross training',Prime:'3 days a week · full body performance and longevity',Strong:'4 days a week · upper and lower strength',Build:'6 days a week · push, pull, legs hypertrophy'};
O.demo=/[?&]demo=1/.test(location.search);

/* ---------- helpers ---------- */
O.$=function(s,r){return (r||document).querySelector(s)};
O.$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
O.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
O.money=function(c){return '$'+(c/100).toLocaleString('en-US',{minimumFractionDigits:c%100?2:0,maximumFractionDigits:2})};
O.today=function(){var d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
O.addDays=function(iso,n){var d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
O.fdate=function(iso,o){if(!iso)return '';var d=new Date(String(iso).length<=10?iso+'T12:00:00':iso);return d.toLocaleDateString('en-US',o||{month:'short',day:'numeric'})};
O.ftime=function(iso){return new Date(iso).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})};
O.initials=function(n){return String(n||'?').trim().split(/\s+/).map(function(x){return x[0]}).slice(0,2).join('').toUpperCase()};
O.toast=function(t){var el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=t;document.body.appendChild(el);setTimeout(function(){el.remove()},2600)};
O.payStatus=function(p){if(p.paid_on)return 'paid';if(p.due_date&&p.due_date<O.today())return 'late';return 'due'};
O.payLabel={paid:'Paid',due:'Due',late:'Past due'};

/* HUD: REC counter since arrival + live Bellingham clock */
O.hud=function(root){var t0=Date.now();var rec=O.$('[data-rec]',root),clk=O.$('[data-clock]',root);
  function p(n){return String(n).padStart(2,'0')}
  function tick(){var s=(Date.now()-t0)/1000;if(rec)rec.textContent='REC '+p(Math.floor(s/3600))+':'+p(Math.floor(s/60)%60)+':'+p(Math.floor(s)%60)+':'+p(Math.floor((s%1)*24));
    if(clk)clk.textContent=new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/Los_Angeles'}).toUpperCase()}
  tick();setInterval(tick,matchMedia('(prefers-reduced-motion: reduce)').matches?1000:42)};

/* SVG weight chart */
O.chart=function(points,opts){opts=opts||{};var W=640,H=220,pl=40,pr=16,pt=16,pb=28;
  var pts=points.filter(function(p){return p.v!=null&&!isNaN(p.v)});
  if(pts.length<2)return '<p class="empty">Log two check-ins with your weight and your chart shows up here.</p>';
  var vs=pts.map(function(p){return +p.v});if(opts.goal!=null)vs.push(+opts.goal);
  var mn=Math.min.apply(0,vs),mx=Math.max.apply(0,vs);var pad=Math.max(1,(mx-mn)*.15);mn-=pad;mx+=pad;
  var x=function(i){return pl+(W-pl-pr)*(i/(pts.length-1))},y=function(v){return pt+(H-pt-pb)*(1-(v-mn)/(mx-mn))};
  var d=pts.map(function(p,i){return (i?'L':'M')+x(i).toFixed(1)+' '+y(+p.v).toFixed(1)}).join(' ');
  var a=d+' L'+x(pts.length-1).toFixed(1)+' '+(H-pb)+' L'+pl+' '+(H-pb)+' Z';
  var g='';for(var k=0;k<4;k++){var v=mn+(mx-mn)*k/3;g+='<line class="gl" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="4" y="'+(y(v)+4)+'">'+Math.round(v)+'</text>'}
  var goal=opts.goal!=null?'<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(+opts.goal)+'" y2="'+y(+opts.goal)+'" stroke="#2fd16b" stroke-dasharray="5 6" stroke-width="1.5"/><text x="'+(W-pr-70)+'" y="'+(y(+opts.goal)-6)+'" style="fill:#2fd16b">GOAL '+opts.goal+'</text>':'';
  var dots=pts.map(function(p,i){return '<circle class="pt" r="3.5" cx="'+x(i)+'" cy="'+y(+p.v)+'"><title>'+O.fdate(p.d)+': '+p.v+'</title></circle>'}).join('');
  var lab='<text x="'+pl+'" y="'+(H-8)+'">'+O.fdate(pts[0].d)+'</text><text x="'+(W-pr)+'" y="'+(H-8)+'" text-anchor="end">'+O.fdate(pts[pts.length-1].d)+'</text>';
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Weight over time, from '+pts[0].v+' to '+pts[pts.length-1].v+'"><defs><linearGradient id="omniFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3141c" stop-opacity=".35"/><stop offset="1" stop-color="#e3141c" stop-opacity="0"/></linearGradient></defs>'+g+goal+'<path class="ar" d="'+a+'"/><path class="ln" d="'+d+'"/>'+dots+lab+'</svg>'};

/* ---------- demo data ---------- */
function demoStore(){
  var t=O.today();var D=function(n){return O.addDays(t,n)};
  var coach={id:'c0',full_name:'David Cruz',role:'coach',email:'coach@demo'};
  var names=[['Jordan Reyes','health','Premium','Prime',212,190],['Maya Thompson','health','Plus','Pulse',168,150],['Chris Alvarez','performance','Premium','Strong',181,190],['Sam Patel','health','Essentials','Pulse',230,205],['Tyler Brooks','performance','Plus','Build',176,185]];
  var S={profiles:[coach],checkins:[],sessions:[],notes:[],payments:[],photos:[]};var n=1;
  names.forEach(function(a,ix){var id='u'+ix;S.profiles.push({id:id,full_name:a[0],email:a[0].split(' ')[0].toLowerCase()+'@example.com',role:'client',path:a[1],membership:a[2],rhythm:a[3],start_weight:a[4],goal_weight:a[5],goal:a[1]==='health'?'Lose fat, keep strength, feel good again':'Faster and stronger for next season',start_date:D(-84),active:true,created_at:D(-84)});
    var drift=a[5]<a[4]?-1:1;for(var w=12;w>=0;w-=1){if(ix===3&&w<3)continue;var wt=+(a[4]+drift*(12-w)*Math.abs(a[5]-a[4])/16+(Math.sin(w*1.7)*.8)).toFixed(1);S.checkins.push({id:'k'+(n++),client_id:id,day:D(-w*7),weight:wt,body_fat:null,waist:null,energy:6+(w%3),sleep:6+((w+1)%3),wins:w===0?'Hit every session this week':'',struggles:w===0?'Late nights at work':'',created_at:D(-w*7)})}
    var days=a[3]==='Pulse'?[1,4]:a[3]==='Prime'?[0,2,4]:a[3]==='Strong'?[0,1,3,4]:[0,1,2,3,4,5];
    for(var wk=-1;wk<=1;wk++){days.forEach(function(dd,j){var dy=D(wk*7+dd-((new Date()).getDay()+6)%7);S.sessions.push({id:'s'+(n++),client_id:id,day:dy,title:(a[3]==='Build'?['Push','Pull','Legs'][j%3]:a[3]==='Strong'?['Upper','Lower'][j%2]:'Full body')+' '+(j+1),details:'Warm up 10 min. Main lifts 4 x 6 to 8. Finisher 8 min.',done:dy<t,client_log:dy<t?'Felt strong':'' ,created_at:dy})})}
    S.payments.push({id:'p'+(n++),client_id:id,label:a[2]+' · '+O.fdate(D(-30),{month:'long'}),amount_cents:O.PLANS[a[2]],due_date:D(-30),paid_on:D(-29),method:'Venmo'});
    S.payments.push({id:'p'+(n++),client_id:id,label:a[2]+' · '+O.fdate(t,{month:'long'}),amount_cents:O.PLANS[a[2]],due_date:ix===3?D(-4):D(6),paid_on:ix===1?D(-1):null,method:ix===1?'Venmo':null});
    S.notes.push({id:'n'+(n++),client_id:id,author_id:'c0',body:'Great week. Keep the protein up and add 5 lbs to your squat on Wednesday.',created_at:new Date(Date.now()-86400000*2).toISOString()});
    S.notes.push({id:'n'+(n++),client_id:id,author_id:id,body:'Will do. Knee felt fine this time.',created_at:new Date(Date.now()-86400000).toISOString()});
  });
  return S}
var DS=null,demoUser='u0';
function dget(){if(!DS)DS=demoStore();return DS}
function did(){return 'x'+Math.random().toString(36).slice(2,9)}
function byDay(a,b){return a.day<b.day?-1:a.day>b.day?1:0}

/* ---------- live client ---------- */
var sb=null;
O.client=function(){if(O.demo)return null;if(!sb){if(!window.supabase)throw new Error('Could not load the sign in service. Check your connection and reload.');sb=window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'omni-auth'}})}return sb};
function chk(r){if(r.error)throw new Error(r.error.message);return r.data}

O.api={
  session:async function(asCoach){if(O.demo)return {id:asCoach?'c0':demoUser};var r=await O.client().auth.getSession();return r.data.session?r.data.session.user:null},
  signIn:async function(email,pw){chk(await O.client().auth.signInWithPassword({email:email,password:pw}))},
  signUp:async function(email,pw,meta){meta=Object.assign({app:'omni'},meta||{});var r=await O.client().auth.signUp({email:email,password:pw,options:{data:meta}});chk(r);if(!r.data.session){chk(await O.client().auth.signInWithPassword({email:email,password:pw}))}},
  signOut:async function(){if(O.demo){location.href=location.pathname;return}await O.client().auth.signOut();location.reload()},
  profile:async function(id){if(O.demo)return dget().profiles.find(function(p){return p.id===id})||null;
    for(var i=0;i<4;i++){var r=await O.client().from('omni_profiles').select('*').eq('id',id).maybeSingle();if(r.data)return r.data;if(r.error)throw new Error(r.error.message);await new Promise(function(z){setTimeout(z,500)})}return null},
  updateProfile:async function(id,patch){if(O.demo){Object.assign(dget().profiles.find(function(p){return p.id===id}),patch);return}chk(await O.client().from('omni_profiles').update(patch).eq('id',id))},
  clients:async function(){if(O.demo)return dget().profiles.filter(function(p){return p.role==='client'});return chk(await O.client().from('omni_profiles').select('*').eq('role','client').order('full_name'))},
  list:async function(table,clientId){var order={checkins:['day',true],sessions:['day',true],notes:['created_at',true],payments:['due_date',false],photos:['taken_on',false]}[table];
    if(O.demo){var a=dget()[table].filter(function(r){return !clientId||r.client_id===clientId}).slice();a.sort(function(x,y){var k=order[0];return (x[k]<y[k]?-1:x[k]>y[k]?1:0)*(order[1]?1:-1)});return a}
    var q=O.client().from('omni_'+table).select('*').order(order[0],{ascending:order[1]});if(clientId)q=q.eq('client_id',clientId);return chk(await q)},
  insert:async function(table,row){if(O.demo){row=Object.assign({id:did(),created_at:new Date().toISOString()},row);if(table==='notes'&&!row.author_id)row.author_id=O._me;dget()[table].push(row);return row}
    return chk(await O.client().from('omni_'+table).insert(row).select().single())},
  update:async function(table,id,patch){if(O.demo){Object.assign(dget()[table].find(function(r){return r.id===id}),patch);return}chk(await O.client().from('omni_'+table).update(patch).eq('id',id))},
  remove:async function(table,id){if(O.demo){var a=dget()[table];a.splice(a.findIndex(function(r){return r.id===id}),1);return}chk(await O.client().from('omni_'+table).delete().eq('id',id))},
  uploadPhoto:async function(uid,file,label){if(O.demo){var url=URL.createObjectURL(file);return O.api.insert('photos',{client_id:uid,path:url,taken_on:O.today(),label:label||'',_url:url})}
    var ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');var path=uid+'/'+Date.now()+'.'+ext;
    chk(await O.client().storage.from('omni-photos').upload(path,file,{contentType:file.type||'image/jpeg',upsert:false}));
    return O.api.insert('photos',{client_id:uid,path:path,taken_on:O.today(),label:label||''})},
  photoUrls:async function(rows){if(O.demo)return rows.map(function(r){return r._url||r.path});if(!rows.length)return [];
    var r=chk(await O.client().storage.from('omni-photos').createSignedUrls(rows.map(function(x){return x.path}),3600));return r.map(function(x){return x.signedUrl})},
  removePhoto:async function(row){if(!O.demo){await O.client().storage.from('omni-photos').remove([row.path])}return O.api.remove('photos',row.id)}
};

/* summary helpers shared by both apps */
O.weightTrend=function(checkins,prof){var w=checkins.filter(function(c){return c.weight!=null}).sort(byDay);var first=prof&&prof.start_weight!=null?+prof.start_weight:(w[0]?+w[0].weight:null);var last=w.length?+w[w.length-1].weight:null;return {first:first,last:last,change:(first!=null&&last!=null)?+(last-first).toFixed(1):null,points:w.map(function(c){return {d:c.day,v:c.weight}})}};
O.weekRange=function(){var t=new Date(O.today()+'T12:00:00');var dow=(t.getDay()+6)%7;var s=O.addDays(O.today(),-dow);return [s,O.addDays(s,6)]};
O.chgHtml=function(c,goalDown){if(c==null)return '';var good=goalDown?c<=0:c>=0;return '<span class="chg '+(good?'down':'up')+'">'+(c>0?'+':'')+c+' lbs since start</span>'};
})();
