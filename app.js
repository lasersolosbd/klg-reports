/* KLG AI Visibility Report: renders one client's monthly report from the report API. */
var CFG = { url: "https://shjzokwlgpxjxywgnpig.supabase.co", key: "sb_publishable_ENjlsmIC_h1oCwABcgl6hA_q56hjQOT" };
var TOKEN = (location.pathname.match(/\/r\/([0-9a-fA-F-]{36})/) || [])[1] || new URLSearchParams(location.search).get("t");
var ENG = ["chatgpt","claude","gemini","grok","perplexity"], EN = {chatgpt:"ChatGPT",claude:"Claude",gemini:"Gemini",grok:"Grok",perplexity:"Perplexity"};
var SI_VER = "16.32.0";
var ENG_ICON = {chatgpt:"openai",claude:"anthropic",gemini:"googlegemini",grok:null,perplexity:"perplexity"};
function engChip(e){var slug=ENG_ICON[e];
  if(slug) return '<span class="eng-chip"><img class="eng-ic" src="https://cdn.jsdelivr.net/npm/simple-icons@'+SI_VER+'/icons/'+slug+'.svg" alt="" aria-hidden="true" loading="lazy"><span class="eng-name">'+EN[e]+'</span></span>';
  return '<span class="eng-chip eng-chip-text"><span class="eng-name eng-name-grok">'+EN[e]+'</span></span>';}
var CHECKS = {one_web_address:"One clear web address",key_pages_found:"Key pages found: about, FAQ, financials",structured_data_valid:"Machine-readable labels load without errors",
  ai_search_crawlers_allowed:"AI search tools can read the site",identified_as_organization:"Labels say you're an organization",nonprofit_details:"Labels include nonprofit details",
  locations_labeled:"Locations are labeled",faq_labeled:"FAQ is labeled as Q&A",descriptive_homepage_title:"Homepage title says what you do",ai_training_crawlers_allowed:"AI models may learn from the site"};
/* Ruleset v1.2 (2026-09-27): weighted checks; each value is {points, pass: true|false|null}. null = not measured this run. */
var CHECKS_V12 = [["ai_search_access","AI search tools can reach the site"],["one_web_address","One clear web address"],
  ["descriptive_homepage_title","Homepage title says what you do"],["content_fresh","Key pages updated in the last year"],
  ["about_page_clear","About page states your mission and service area"],["location_visible","Your city or service area is written on the site"],
  ["nonprofit_status_visible","Nonprofit status shown or linked to your public filing"],["ai_training_access","AI models may learn from the site"],
  ["markup_hygiene","Machine-readable labels are clean and say you're an organization"]];
var D = null;

function $(s){return document.querySelector(s);}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function rpc(fn,args){return fetch(CFG.url+"/rest/v1/rpc/"+fn,{method:"POST",headers:{"apikey":CFG.key,"Authorization":"Bearer "+CFG.key,"Content-Type":"application/json"},body:JSON.stringify(args)})
  .then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();});}
function myName(){try{return localStorage.getItem("klg-name")||"";}catch(e){return "";}}
function flash(node){if(!node)return;node.classList.add("show");setTimeout(function(){node.classList.remove("show");},1600);}
function r1(n){return Math.round(n*10)/10;}
function r2(n){return Math.round(n*100)/100;}

function showState(title,msg){document.getElementById("app").innerHTML='<div class="state"><div><h1>'+title+'</h1><p class="muted">'+msg+'</p></div></div>';}

if(!TOKEN){showState("Report not found","This link looks incomplete. Please use the full link we sent you.");}
else{
  rpc("get_client_report",{p_token:TOKEN}).then(function(d){
    if(!d){showState("Report not found","This link isn't active. If you think that's a mistake, just ask us for a fresh one.");return;}
    D=d;render();
  }).catch(function(){showState("We couldn't load your report","Please refresh in a minute. If it keeps happening, let us know.");});
}

function render(){
  var c=D.content||{}, s=D.score||{}, root=document.documentElement;
  if(c.brand){if(c.brand.primary)root.style.setProperty("--navy",c.brand.primary);if(c.brand.accent)root.style.setProperty("--gold",c.brand.accent);}
  applyRegistryRecommendation(c);
  document.title=D.client.name+" AI Visibility Report: "+D.report.period;
  document.getElementById("app").innerHTML=document.getElementById("tpl").innerHTML;
  var logoImg=$("#client-logo");
  if(c.logo_url){logoImg.src=c.logo_url;logoImg.alt=D.client.name;logoImg.onerror=function(){var box=logoImg.closest(".client-logo");if(box)box.remove();};}
  else{var logoBox=logoImg.closest(".client-logo");if(logoBox)logoBox.remove();}

  /* hero */
  $("#stamp").textContent=c.stamp||("Report #"+D.report.report_no);
  $("#hero-title").textContent=c.headline||"";
  $("#hero-lede").textContent=c.lede||"";
  var total=s.total||0, pillars=[["Found by AI",+s.found_by_ai||0,50],["Website readiness",+s.website_readiness||0,30],["Reputation and accuracy",+s.reputation||0,20]];
  pillars.forEach(function(p){$("#pillars").appendChild(el("div","pillar",'<span>'+p[0]+'</span><span class="bar"><i data-w="'+(p[1]/p[2]*100)+'"></i></span><span class="pts">'+Math.round(p[1])+'/'+p[2]+'</span>'));});
  if(s.previous!=null){var dlt=total-s.previous;$("#stamp").insertAdjacentHTML("afterend",'<span class="delta">'+(dlt>=0?"+":"")+dlt+' since last report</span>');}
  var rep=(s.details||{}).reputation||{}, checks=(s.details||{}).checks||{};
  var potential=Math.round((+s.found_by_ai||0)+30+(+rep.tone||0)+(+rep.accuracy||0)+(+rep.top_pick||0)+5);
  if(potential>total) $("#upside").innerHTML='<span aria-hidden="true">🎯</span><span><strong>Could reach about '+potential+'</strong> once the to-do list below is done, before AI answers even start to change. Most items take under an hour.</span>';
  else $("#upside").remove();
  $("#gauge-wrap").setAttribute("aria-label","AI Visibility Score: "+total+" out of 100");
  animateGauge(total);

  /* letter, highlights, compliments */
  $("#letter-title").textContent=c.letter_title||"";
  (c.letter||[]).forEach(function(p){$("#letter-body").appendChild(el("p")).textContent=p;});
  $("#signoff").textContent=c.signoff||"The Kind Logic Group team";
  (c.three||[]).forEach(function(t){$("#three").appendChild(el("div","tile "+esc(t.cls),'<span class="tag">'+esc(t.tag)+'</span><div class="big">'+esc(t.big)+'</div><h3>'+esc(t.title)+'</h3><p>'+esc(t.text)+'</p>'));});
  var star="";for(var i=0;i<24;i++){var a=i*Math.PI/12,rr=i%2?34:48;star+=(50+rr*Math.cos(a)).toFixed(1)+","+(50+rr*Math.sin(a)).toFixed(1)+" ";}
  var cols=["#F8C013","#FFFFFF","#F8C013","#9FD8C2","#F8C013","#FFFFFF"];
  (c.compliments||[]).forEach(function(x,ix){var fs=x.burst.length>6?".8rem":x.burst.length>5?".9rem":"1.02rem";
    $("#bursts").appendChild(el("div","burst",'<div class="pow" aria-hidden="true"><svg viewBox="0 0 100 100"><polygon points="'+star+'" fill="'+cols[ix%6]+'" transform="rotate('+(ix*11)+' 50 50)"/></svg><span style="font-size:'+fs+'">'+esc(x.burst)+'</span></div><p>'+esc(x.text)+'</p>'));});
  if(!(c.compliments||[]).length) $(".love").remove();

  renderMatrix(c); renderTasks(c); renderQuestions(c); renderScore(s,c);
  $("#measured").textContent=c.measured_note||"";
  if((D.history||[]).length>1){var h=$("#hist");D.history.forEach(function(x){var a=el("a",x.token===TOKEN?"cur":"",esc(x.period)+(x.total!=null?" · "+x.total:""));a.href="/r/"+x.token;h.appendChild(a);});}
  var nm=$("#yourname");nm.value=myName();nm.addEventListener("change",function(){try{localStorage.setItem("klg-name",nm.value.trim());}catch(e){}});
  document.addEventListener("click",function(ev){var b=ev.target.closest("button.copy");if(!b)return;var t=document.getElementById(b.dataset.target).textContent;
    try{navigator.clipboard.writeText(t).then(function(){var o=b.textContent;b.textContent="Copied";setTimeout(function(){b.textContent=o;},1500);});}catch(e){}});
  window.addEventListener("beforeprint",function(){document.querySelectorAll("details").forEach(function(d){d.open=true;});});
}

function animateGauge(total){
  var C=540.35,arc=$("#gauge-arc"),num=$("#score-num"),bars=document.querySelectorAll(".pillar .bar i");
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fin(){arc.setAttribute("stroke-dashoffset",C*(1-total/100));num.textContent=total;bars.forEach(function(i){i.style.width=i.dataset.w+"%";});}
  if(reduce)return fin();
  var st=null;function tick(t){if(!st)st=t;var k=Math.min(1,(t-st)/1400),e=1-Math.pow(1-k,3);arc.setAttribute("stroke-dashoffset",C*(1-e*total/100));num.textContent=Math.round(e*total);if(k<1)requestAnimationFrame(tick);}
  setTimeout(function(){requestAnimationFrame(tick);bars.forEach(function(i){i.style.width=i.dataset.w+"%";});},250);
}

function qList(c){var ids=(c.question_order&&c.question_order.length)?c.question_order:D.prompts.map(function(p){return p.id;});
  var byId={};D.prompts.forEach(function(p){byId[p.id]=p;});
  return ids.filter(function(id){return byId[id];}).map(function(id){var m=(c.question_meta||{})[id]||{};return {id:id,text:m.label||byId[id].text,who:m.who||byId[id].intent||"",group:m.group||"all"};});}

function ccName(n,clientName){var isClient=String(n).toLowerCase()===String(clientName||"").toLowerCase();return isClient?'<b class="you">'+esc(n)+'</b>':esc(n);}

function renderMatrix(c){
  var cell={},eh={},et={};ENG.forEach(function(e){eh[e]=0;et[e]=0;});
  D.matrix.forEach(function(m){cell[m.prompt_id+"|"+m.engine]=m;});
  var ccCell={};(D.competitor_context||[]).forEach(function(x){ccCell[x.prompt_id+"|"+x.engine]=x;});
  document.querySelectorAll("#matrix thead th[data-eng]").forEach(function(th){th.innerHTML=engChip(th.dataset.eng);});
  var G=c.groups||{},html="",last=null;
  qList(c).forEach(function(q){
    if(q.group!==last&&G[q.group]){html+='<tr class="grp"><td colspan="7">'+esc(G[q.group][0])+'<span>'+esc(G[q.group][1])+'</span></td></tr>';}last=q.group;
    var tot=0,max=0;html+='<tr class="row"><td class="q">'+esc(q.text)+'<span class="who">'+esc(q.who)+'</span></td>';
    ENG.forEach(function(e){var m=cell[q.id+"|"+e]||{mentioned:0,asked:0};tot+=m.mentioned;max+=m.asked;eh[e]+=m.mentioned;et[e]+=m.asked;
      var d='<span class="dots">';for(var i=0;i<m.asked;i++)d+='<span class="dot'+(i<m.mentioned?' on':'')+'"></span>';
      html+='<td aria-label="'+EN[e]+': '+m.mentioned+' of '+m.asked+'">'+d+'</span></td>';});
    html+='<td><span class="tally'+(tot?'':' zero')+'">'+tot+'/'+max+'</span></td></tr>';
    var whoParts=[];
    ENG.forEach(function(e){var cc=ccCell[q.id+"|"+e];if(!cc)return;
      var parts=[];
      if(cc.top3&&cc.top3.length) parts.push(cc.top3.map(function(n){return ccName(n,D.client.name);}).join(", "));
      if(cc.client_mentioned===false) parts.push(ccName(D.client.name,D.client.name)+' was not mentioned at all');
      else if(cc.client_rank&&cc.client_rank>3) parts.push(ccName(D.client.name,D.client.name)+' was named, listed #'+cc.client_rank);
      if(!parts.length)return;
      whoParts.push('<span class="who-eng"><b class="eng-lbl">'+engChip(e)+':</b> '+parts.join(" — ")+'</span>');});
    if(whoParts.length){html+='<tr class="who-row"><td colspan="7"><div class="who-wrap"><span class="who-cap">Who else AI named here:</span>'+whoParts.join("")+'</div></td></tr>';}
  });
  $("#matrix tbody").innerHTML=html;
  ENG.forEach(function(e){$("#engines").appendChild(el("div","eng",'<b>'+eh[e]+'<small style="font-size:.9rem;font-weight:600;color:var(--muted)"> / '+et[e]+'</small></b><span>'+engChip(e)+' named '+esc(D.client.name.split(" ")[0]==="Veterans"?"VCP":D.client.name)+'</span><div class="mini"><i style="width:'+(et[e]?eh[e]/et[e]*100:0)+'%"></i></div>'));});
  $("#results-note").textContent=c.results_note||"";
}

function applyRegistryRecommendation(c){
  /* Generic, any-client signal: recommend linking the site to its public nonprofit
     filing/registry profiles when one is confirmed but not yet linked. Injected here
     rather than authored per report, so it applies automatically to every client. */
  var reg=D.registry_recommendation;
  if(!reg||!reg.needed)return;
  c.web_tasks=(c.web_tasks||[]).slice();
  var geek='Add a visible link to your ProPublica Nonprofit Explorer, Candid, or Charity Navigator profile, plus matching <code>sameAs</code> entries on your homepage\'s Organization JSON-LD.'
    +(reg.reference_url?' Your most recent filing: <a href="'+esc(reg.reference_url)+'" target="_blank" rel="noopener">PDF</a>.':'');
  c.web_tasks.push({k:reg.task_key,title:esc(reg.title),meta:"Nonprofit recognition",text:esc(reg.detail),geekLabel:"For your web person",geek:geek,gain:"+recognition",soft:true});
}

function renderTasks(c){
  var all=(c.lead_tasks||[]).concat(c.web_tasks||[]);
  function prog(){var n=all.filter(function(t){return (D.tasks[t.k]||{}).done;}).length;$("#prog-text").textContent=n+" of "+all.length+" done";$("#prog-bar").style.width=(all.length?n/all.length*100:0)+"%";}
  function one(t,target){
    var st=D.tasks[t.k]||{},li=el("li","task"+(st.done?" is-done":""));
    li.innerHTML='<input type="checkbox" class="check" aria-label="Mark done: '+esc(t.title)+'"'+(st.done?" checked":"")+'>'+
      '<div class="body"><h4>'+t.title+'</h4><div class="meta">'+t.meta+(st.done&&st.by?'<span class="who-did">Checked off by '+esc(st.by)+'</span>':'')+'<span class="saved">Saved</span></div><p>'+t.text+'</p>'+
      '<details class="geek"><summary>'+(t.geekLabel||"For your web person")+'</summary><div class="inner">'+t.geek+'</div></details></div>'+
      '<span class="gain'+(t.soft?' soft':'')+'">'+t.gain+'</span>';
    var box=li.querySelector(".check");
    box.addEventListener("change",function(){var v=box.checked;li.classList.toggle("is-done",v);
      rpc("set_task_status",{p_token:TOKEN,p_task_key:t.k,p_done:v,p_name:myName()||null}).then(function(ok){
        if(!ok)throw 0;D.tasks[t.k]={done:v,by:myName()};prog();flash(li.querySelector(".saved"));
      }).catch(function(){box.checked=!v;li.classList.toggle("is-done",!v);alert("That didn't save. Please try again.");});});
    target.appendChild(li);}
  (c.lead_tasks||[]).forEach(function(t){one(t,$("#lead-tasks"));});
  (c.web_tasks||[]).forEach(function(t){one(t,$("#web-tasks"));});
  $("#todo-title").textContent=all.length+" fixes, most under an hour";
  prog();
}

function renderQuestions(c){
  qList(c).forEach(function(q){
    var fb=D.feedback[String(q.id)]||{},row=el("div","qrow");
    row.innerHTML='<div class="qt">'+esc(q.text)+'<small>Asked for: '+esc(q.who)+'<span class="saved">Saved</span></small></div>'+
      '<div class="choice" role="group" aria-label="Your rating"><button type="button" class="keep" data-v="keep">Keep</button><button type="button" class="reword" data-v="reword">Reword</button><button type="button" class="drop" data-v="drop">Not a fit</button></div>'+
      '<div class="reword-box"><textarea aria-label="How would you word it?" placeholder="How would a real person ask this?"></textarea></div>';
    var btns=row.querySelectorAll(".choice button"),box=row.querySelector(".reword-box"),ta=row.querySelector("textarea"),cur=fb.rating||null;
    ta.value=fb.reword||"";
    function paint(){btns.forEach(function(b){b.setAttribute("aria-pressed",cur===b.dataset.v?"true":"false");});box.classList.toggle("show",cur==="reword");}
    function save(){return rpc("save_question_feedback",{p_token:TOKEN,p_prompt_id:q.id,p_rating:cur,p_reword:cur==="reword"?ta.value:null,p_name:myName()||null})
      .then(function(ok){if(ok)flash(row.querySelector(".saved"));else throw 0;}).catch(function(){alert("That didn't save. Please try again.");});}
    btns.forEach(function(b){b.addEventListener("click",function(){cur=(cur===b.dataset.v?null:b.dataset.v);paint();save();});});
    ta.addEventListener("change",save);
    paint();$("#qlist").appendChild(row);});
  function listSug(){var ul=$("#sug-list");ul.innerHTML="";(D.suggestions||[]).forEach(function(x){
    var li=el("li");li.appendChild(el("span")).textContent=x.text;
    var stx=x.status==="accepted"?"Now tracked":x.status==="rejected"?"Not added":"Waiting for our review";
    li.appendChild(el("span","st")).textContent=stx;ul.appendChild(li);});}
  listSug();

  var box=$("#sug-box"), addBtn=$("#sug-add");
  var MAXQ=3;
  var storedCount=(D.suggestions||[]).filter(function(x){return x.status!=="rejected";}).length;
  function rowCount(){ return box.querySelectorAll(".sug-row").length; }
  function atCap(){ return storedCount+rowCount()>=MAXQ; }
  function syncAddBtn(){
    if(storedCount>=MAXQ){ box.style.display="none"; addBtn.style.display="none"; $("#sug-cap-note").style.display="block"; return; }
    addBtn.disabled = atCap(); addBtn.textContent = atCap() ? "That's the max for now (3)" : "+ Add another question";
  }
  function addRow(focus){
    var row=el("div","sug-row"); row.innerHTML='<input type="text" class="sug-in" maxlength="300" placeholder="Keep it the way a real person would say it out loud"><button type="button" class="sug-x" aria-label="Remove this question">&times;</button>';
    row.querySelector(".sug-x").addEventListener("click",function(){ if(rowCount()>1) row.remove(); else row.querySelector("input").value=""; syncAddBtn(); });
    box.appendChild(row); if(focus) row.querySelector("input").focus(); syncAddBtn();
  }
  if(storedCount<MAXQ) addRow(false); else syncAddBtn();
  addBtn.addEventListener("click",function(){ if(atCap()){$("#fb-status").textContent="Three is the max per report — send these, and we'll reach out about swapping them into your 8.";return;} addRow(true); });

  $("#sug-send").addEventListener("click",function(){
    var inputs=Array.prototype.slice.call(box.querySelectorAll(".sug-in"));
    var vals=inputs.map(function(i){return i.value.trim();}).filter(function(v){return v.length>0;});
    if(!vals.length){$("#fb-status").textContent="Write out at least one question first.";return;}
    var short=vals.find(function(v){return v.length<8;});
    if(short){$("#fb-status").textContent="\""+short+"\" looks too short — write it out as a full question.";return;}
    $("#sug-send").disabled=true; $("#fb-status").textContent="Sending…";
    var chain=Promise.resolve(), ok=[], failed=0;
    vals.forEach(function(v){ chain=chain.then(function(){ return rpc("add_question_suggestion",{p_token:TOKEN,p_text:v,p_name:myName()||null}).then(function(r){ if(r) ok.push(v); else failed++; }).catch(function(){ failed++; }); }); });
    chain.then(function(){
      ok.forEach(function(v){ D.suggestions.push({text:v,status:"pending"}); });
      listSug();
      storedCount=(D.suggestions||[]).filter(function(x){return x.status!=="rejected";}).length;
      box.innerHTML="";
      if(storedCount<MAXQ) addRow(false); else syncAddBtn();
      $("#sug-send").disabled=false;
      if(failed===0) $("#fb-status").textContent = ok.length>1 ? "Thanks! We'll review all "+ok.length+" before your next check." : "Thanks! We'll review it before your next check.";
      else $("#fb-status").textContent = ok.length ? (ok.length+" sent, "+failed+" didn't go through — try those again.") : "That didn't send. Please try again.";
    });
  });
}

function renderScore(s,c){
  var d=s.details||{},qs=d.questions||[],rep=d.reputation||{},ch=d.checks||{},meta=c.question_meta||{};
  var qi=qs.map(function(q){var lbl=(meta[q.prompt_id]||{}).label||q.question;return '<li class="'+(q.rate>=0.999?'y':q.rate>0?'h':'n')+'"><strong>'+q.mentioned+' of '+q.asked+'</strong> '+esc(lbl)+'</li>';}).join("");
  var avg=qs.length?qs.reduce(function(a,q){return a+(+q.rate);},0)/qs.length:0;
  var v12=s.formula_version==="v1.2", ci, passed, webIntro, webMath;
  if(v12){
    var earned=0, measurable=0;
    ci=CHECKS_V12.map(function(p){var v=ch[p[0]]||{},pt=+v.points||0,cls=v.pass===true?'y':v.pass===false?'n':'h';
      if(v.pass===true||v.pass===false){measurable+=pt;if(v.pass===true)earned+=pt;}
      return '<li class="'+cls+'">'+p[1]+' ('+pt+' pts'+(v.pass==null?', not measured this run':'')+')</li>';}).join("");
    webIntro="Nine checks, weighted by how much evidence supports each one.";
    webMath=earned+" of "+measurable+" measurable points earned"+(measurable<30?", scaled to 30":"")+" = "+r2(+s.website_readiness);
  } else {
    ci=Object.keys(CHECKS).map(function(k){return '<li class="'+(ch[k]?'y':'n')+'">'+CHECKS[k]+'</li>';}).join("");
    passed=Object.keys(CHECKS).filter(function(k){return ch[k];}).length;
    webIntro="Ten checks, 3 points each."; webMath=passed+" of 10 pass. "+passed+" × 3 = "+passed*3;
  }
  var ri='<li class="'+(rep.tone>=5?'y':'h')+'">Positive tone when named ('+r1(rep.tone||0)+' of 5)</li>'+
    '<li class="'+(rep.accuracy>=5?'y':'h')+'">No factual errors found ('+r1(rep.accuracy||0)+' of 5)</li>'+
    '<li class="'+(rep.top_pick>=5?'y':'h')+'">Top pick in '+(rep.top_pick_count||0)+' of '+(rep.mentions||0)+' mentions ('+r2(rep.top_pick||0)+' of 5)</li>'+
    '<li class="'+(rep.consistency>=5?'y':'n')+'">Google listing uses your main web address ('+r1(rep.consistency||0)+' of 5)</li>';
  var cards=[
    {pts:s.found_by_ai,max:50,name:"Found by AI",intro:"How often AI names you, question by question.",items:qi,math:"Average across "+qs.length+" questions: "+Math.round(avg*1000)/10+"%. Times 50 = "+r2(+s.found_by_ai)},
    {pts:s.website_readiness,max:30,name:"Website readiness",intro:webIntro,items:ci,math:webMath},
    {pts:s.reputation,max:20,name:"Reputation and accuracy",intro:"What AI says when it does mention you.",items:ri,math:"Four parts, 5 points each. Total "+r2(+s.reputation)}];
  cards.forEach(function(x){$("#explain").appendChild(el("div","tile",'<div class="big">'+Math.round(x.pts||0)+'<span style="font-size:1.1rem;color:var(--muted);font-weight:600"> / '+x.max+'</span></div><h3>'+x.name+'</h3><p class="muted" style="font-size:.93rem">'+x.intro+'</p><ul>'+x.items+'</ul><div class="math">'+x.math+'</div>'));});
  $("#score-title").textContent="How your score of "+s.total+" adds up";
  $("#score-foot").textContent=r2(+s.found_by_ai)+" + "+r2(+s.website_readiness)+" + "+r2(+s.reputation)+" = "+r2((+s.found_by_ai)+(+s.website_readiness)+(+s.reputation))+", rounded to "+s.total+". Based on "+(s.runs_included||[]).length+" tracking run"+((s.runs_included||[]).length===1?"":"s")+".";
}