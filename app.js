const $=(s,c=document)=>c.querySelector(s);
const $$=(s,c=document)=>[...c.querySelectorAll(s)];
let xp=0;
const award=(n=10)=>{xp+=n;$('#xp').textContent=xp};

$$('[data-jump]').forEach(b=>b.onclick=()=>$(b.dataset.jump)?.scrollIntoView({behavior:'smooth'}));
$$('.flip').forEach(card=>card.onclick=()=>card.classList.toggle('flipped'));

const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});
$$('.zone>*').forEach(el=>{el.classList.add('reveal');io.observe(el)});
addEventListener('scroll',()=>{
  const d=document.documentElement,max=d.scrollHeight-d.clientHeight;
  $('#scrollbar').style.width=(max?d.scrollTop/max*100:0)+'%';
  let active='';
  $$('.zone').forEach(z=>{if(scrollY>=z.offsetTop-120)active=z.id});
  $$('nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+active));
},{passive:true});

// GAME 1: build a thing
const parts={
  sensor:['Sensor','Measures a physical, chemical or biological property and turns it into an electronic signal.','A smart thermostat measures room temperature.'],
  actuator:['Actuator','Receives an electronic command and changes something in the physical world.','A smart irrigation valve opens or closes water flow.'],
  mcu:['Microcontroller','Provides the embedded “smart” processing that interprets inputs and decides what to do.','A thermostat compares the measured temperature with your target.'],
  radio:['Transceiver','Contains the electronics needed to transmit and receive data, often wirelessly.','A sensor sends readings over Wi-Fi or ZigBee.'],
  power:['Power supply','Keeps the device alive; often a battery, so energy cost matters.','A remote sensor may need to survive months or years on one battery.']
};
const seenParts=new Set();
$$('[data-part]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.part,[title,text,ex]=parts[k];
  $('#partTitle').textContent=title;$('#partText').textContent=text;$('#partExample').textContent='Easy example: '+ex;
  b.classList.add('active','done');seenParts.add(k);
  $$('#partDots i').forEach((d,i)=>d.classList.toggle('on',i<seenParts.size));
  $('.device-screen').textContent=seenParts.size+' / 5 ONLINE';
  if(seenParts.size===5&&!$('.device-led').classList.contains('on')){$('.device-led').classList.add('on');$('.device-screen').textContent='DEVICE ONLINE';award(20)}
});

// route explainer
const routeInfo={
  edge:'<b>EDGE.</b> Sensors and actuators sit closest to the physical world. Data is generated here and physical actions may happen here too.',
  gateway:'<b>GATEWAY.</b> Bridges IoT protocols to higher-level networks, translates formats and can aggregate data before forwarding it.',
  fog:'<b>FOG.</b> Processing happens near the devices so decisions can be faster and raw data can be reduced before travelling further.',
  core:'<b>CORE.</b> High-capacity backbone links geographically dispersed fog networks and other enterprise resources.',
  cloud:'<b>CLOUD.</b> Large-scale storage, device-management applications and analytics operate on aggregated IoT data.'
};
$$('[data-layer]').forEach(b=>b.onclick=()=>{$$('[data-layer]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#routeReadout').innerHTML=routeInfo[b.dataset.layer]});
$('#routeReadout').innerHTML=routeInfo.edge;

// GAME 2: fog/cloud
const fogRounds=[
  {q:'A factory emergency-stop sensor must trigger within milliseconds. Where should the first decision happen?',a:'fog',opts:[['fog','Fog / near edge'],['cloud','Cloud only'],['core','Core only']],why:'Correct. Low-latency safety decisions should happen close to the device.'},
  {q:'A company wants to train a large model using months of aggregated sensor history. Best location?',a:'cloud',opts:[['edge','Tiny sensor'],['fog','Fog node only'],['cloud','Cloud']],why:'Correct. Large-scale historical storage and analytics are a natural cloud task.'},
  {q:'Thousands of sensors send raw readings every second. You want to summarise them before sending upstream. Best layer?',a:'fog',opts:[['fog','Fog'],['cloud','Cloud first'],['core','Core router']],why:'Correct. Fog can distill and reduce data near the edge.'}
];let fogIndex=0;
function renderFog(){
  const r=fogRounds[fogIndex];$('#fogQuestion').textContent=r.q;const host=$('#fogChoices');host.innerHTML='';
  r.opts.forEach(([v,l])=>{const b=document.createElement('button');b.dataset.answer=v;b.textContent=l;b.onclick=()=>{
    if(host.dataset.done)return;host.dataset.done='1';
    if(v===r.a){b.classList.add('correct');$('#fogFeedback').textContent=r.why;$('#fogFeedback').className='feedback good';award(10)}
    else{b.classList.add('wrong');$$('button',host).find(x=>x.dataset.answer===r.a).classList.add('correct');$('#fogFeedback').textContent='Not the best fit. Think about latency, data volume and where processing should happen.';$('#fogFeedback').className='feedback bad'}
    setTimeout(()=>{fogIndex=(fogIndex+1)%fogRounds.length;host.dataset.done='';renderFog()},1200)
  };host.appendChild(b)});
  $('#fogFeedback').textContent='Choose the location that best fits the requirement.';$('#fogFeedback').className='feedback';
}
renderFog();

// risk reader
const riskText={
  surface:'More devices, interfaces, networks and data types create more places an attacker can target.',
  resources:'Small memory, CPU and battery budgets can make advanced security controls difficult to run.',
  ecosystem:'IoT combines devices, communications, gateways, applications and cloud services, so dependencies become hard to assess.',
  standards:'Security standards and best-practice guidance are less mature and more fragmented than in traditional IT.',
  deployment:'IoT is rapidly deployed into commercial and critical environments, sometimes before full risk assessment.',
  integration:'Different protocols and authentication schemes make one consistent security design hard to achieve.',
  safety:'Because devices can act on the physical environment, cyber compromise can create real safety consequences.',
  cost:'Large-scale low-cost manufacturing can push vendors and buyers to accept weaker security features.',
  expertise:'IoT evolves quickly and there are relatively few people with deep IoT cybersecurity experience.',
  updates:'Many embedded devices are difficult to patch, badly supported or lack a safe update mechanism.',
  code:'Cost and usability pressure can cause developers to prioritise functionality over secure development practice.',
  liability:'Long supply chains and many interacting components can make responsibility unclear after an incident.'
};
$$('[data-risk]').forEach(b=>b.onclick=()=>{$$('[data-risk]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#riskReader').innerHTML='<b>'+b.querySelector('b').textContent+'</b><span>'+riskText[b.dataset.risk]+'</span>'});

// GAME 3 risk picks
const idealRisks=new Set(['updates','safety','resources']);const chosenRisks=new Set();
$$('[data-pick]').forEach(b=>b.onclick=()=>{
  if(chosenRisks.has(b.dataset.pick)){chosenRisks.delete(b.dataset.pick);b.classList.remove('selected')}else if(chosenRisks.size<3){chosenRisks.add(b.dataset.pick);b.classList.add('selected')}
  if(chosenRisks.size===3){
    const hits=[...chosenRisks].filter(x=>idealRisks.has(x)).length;
    $('#riskFeedback').textContent=hits===3?'Strong triage: patchability, safety impact and constrained resources are immediate design concerns for networked infusion pumps.':'Reasonable concerns, but for infusion pumps I would prioritise patchability, safety impact and constrained-device limitations first.';
    $('#riskFeedback').className='feedback '+(hits===3?'good':'bad');if(hits===3)award(15);
  }else{$('#riskFeedback').textContent='Choose three. There can be multiple reasonable concerns, but some are more immediate.';$('#riskFeedback').className='feedback'}
});

// GAME 4 security objectives
const objectives=[
  {q:'A smart factory separates the corporate LAN from the IoT network using firewalls and different credentials. Which objective?',a:'Restrict logical access',opts:['Restrict logical access','Restore after incident','Physical access']},
  {q:'A controller has a backup unit and can fall back from full automation to manual operation during failure. Which objective?',a:'Maintain functionality',opts:['Detect incidents','Maintain functionality','Protect data integrity']},
  {q:'A company disables unused services, patches devices and applies least privilege. Which objective?',a:'Protect components',opts:['Protect components','Physical access','Restore after incident']},
  {q:'The team wants alerts early enough to break the attack chain. Which objective?',a:'Detect incidents',opts:['Data integrity','Detect incidents','Logical access']}
];let oi=0;
function renderObjective(){
  const r=objectives[oi];$('#objectiveQuestion').textContent=r.q;const host=$('#objectiveChoices');host.innerHTML='';
  r.opts.forEach(opt=>{const b=document.createElement('button');b.textContent=opt;b.onclick=()=>{
    if(host.dataset.done)return;host.dataset.done='1';
    if(opt===r.a){b.classList.add('correct');$('#objectiveFeedback').textContent='Correct.';$('#objectiveFeedback').className='feedback good';award(10)}
    else{b.classList.add('wrong');$$('button',host).find(x=>x.textContent===r.a).classList.add('correct');$('#objectiveFeedback').textContent='Correct answer highlighted.';$('#objectiveFeedback').className='feedback bad'}
    setTimeout(()=>{oi=(oi+1)%objectives.length;host.dataset.done='';renderObjective()},1000)
  };host.appendChild(b)});
  $('#objectiveFeedback').textContent='Match the scenario to the security objective.';$('#objectiveFeedback').className='feedback';
}
renderObjective();

// GAME 5 tamper lab
let tamperChoice=null;
const tamperInfo={
  steel:['resistance','Hardened enclosure makes physical access more difficult.'],
  seal:['evidence','Tamper-evident seal shows visible evidence after interference.'],
  switch:['detection','Magnetic/pressure-style switches can detect opening or movement.'],
  sensor:['detection','Temperature, voltage or power sensors can detect environmental/electrical attack.'],
  mesh:['detection','Circuit mesh, wire or fiber can detect puncture or break.']
};
$$('[data-tamper]').forEach(b=>b.onclick=()=>{tamperChoice=b.dataset.tamper;$$('[data-tamper]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#tamperReadout').textContent=tamperInfo[tamperChoice][1]});
$('#openBox').onclick=()=>{
  const box=$('#tamperBox');
  if(!tamperChoice){$('#tamperState').textContent='NO EXTRA DEFENSE';box.classList.add('alarm');setTimeout(()=>box.classList.remove('alarm'),1600);return}
  const type=tamperInfo[tamperChoice][0];
  if(type==='resistance')$('#tamperState').textContent='ACCESS RESISTED';
  else if(type==='evidence')$('#tamperState').textContent='SEAL BROKEN: EVIDENCE';
  else $('#tamperState').textContent='TAMPER ALERT!';
  box.classList.add('alarm');setTimeout(()=>box.classList.remove('alarm'),1600);award(10);
};

// GAME 6 handshake
const hsSteps=[
  {title:'Step 1: identify the device.',correct:'Identify device',opts:['Identify device','Send firmware first','Disable logging'],msg:'Identity established.'},
  {title:'Step 2: authenticate the device and gateway.',correct:'Mutual authentication',opts:['One-way trust only','Mutual authentication','Anonymous access'],msg:'Both sides have proved who they are.'},
  {title:'Step 3: protect the data path.',correct:'Secure the data',opts:['Secure the data','Use plaintext','Share one global password'],msg:'Stored/transferred data is protected according to the required security level.'},
  {title:'Step 4: keep the gateway maintainable.',correct:'Enable signed updates',opts:['Disable updates forever','Enable signed updates','Remove audit trails'],msg:'Update capability supports long-term maintenance.'}
];let hi=0;
function renderHandshake(){
  if(hi>=hsSteps.length){$('#handshakeTitle').textContent='Trusted connection established.';$('#handshakeFeedback').textContent='Identity, mutual authentication, protected data and maintainability are all in place.';$('#handshakeWire').classList.add('live');award(20);return}
  const r=hsSteps[hi];$('#handshakeTitle').textContent=r.title;const host=$('#handshakeActions');host.innerHTML='';
  r.opts.forEach(opt=>{const b=document.createElement('button');b.textContent=opt;b.onclick=()=>{
    if(opt===r.correct){b.classList.add('correct');$('#handshakeFeedback').textContent=r.msg;$('#handshakeFeedback').className='feedback good';hi++;setTimeout(renderHandshake,650)}
    else{b.classList.add('wrong');$('#handshakeFeedback').textContent='That weakens the trust model. Try again.';$('#handshakeFeedback').className='feedback bad';setTimeout(()=>b.classList.remove('wrong'),500)}
  };host.appendChild(b)});
}
renderHandshake();

// GAME 7 replay attack
const packetCounters=[43,42,44,41,45];
let lastCounter=42,packetIndex=0;
function renderPackets(){
  const host=$('#packetQueue');host.innerHTML='';
  packetCounters.forEach((n,i)=>{const b=document.createElement('button');b.className='packet-card-btn';b.innerHTML='<span>COUNTER</span><b>'+n+'</b>';b.disabled=i!==packetIndex;b.onclick=()=>{
    const shouldAccept=n>lastCounter;
    if(shouldAccept){b.classList.add('accepted');lastCounter=n;$('#replayFeedback').textContent='Accepted. Counter '+n+' is newer than the last accepted value.';$('#replayFeedback').className='feedback good'}
    else{b.classList.add('rejected');$('#replayFeedback').textContent='Rejected. Counter '+n+' is equal to or smaller than the last accepted value — possible replay.';$('#replayFeedback').className='feedback bad'}
    b.disabled=true;packetIndex++;if(packetIndex<packetCounters.length){setTimeout(renderPackets,800)}else{award(20);$('#replayFeedback').textContent+=' Sequence complete.'}
  };host.appendChild(b)});
}
renderPackets();

// GAME 8 mode selector
const modeRounds=[
  {q:'One sensor sends privately to one gateway. Which mode?',a:'U',why:'MiniSec-U fits single-source / unicast communication.'},
  {q:'Many sensor nodes broadcast to a group of receivers. Which mode scales better?',a:'B',why:'MiniSec-B avoids keeping per-sender counter state for every broadcaster.'},
  {q:'You need replay defence across many broadcasters without expensive resynchronization. Which mode?',a:'B',why:'MiniSec-B uses timing epochs plus a bloom-filter approach.'}
];let mi=0;
function renderMode(){
  const r=modeRounds[mi];$('#modeQuestion').textContent=r.q;$('#modeFeedback').textContent='';
  $$('#modeChoices button').forEach(b=>{b.disabled=false;b.classList.remove('correct','wrong');b.onclick=()=>{
    if(b.dataset.mode===r.a){b.classList.add('correct');$('#modeFeedback').textContent=r.why;$('#modeFeedback').className='feedback good';award(10)}
    else{b.classList.add('wrong');$('#modeFeedback').textContent='Not the best fit. Think about one-to-one counters versus broadcast scale.';$('#modeFeedback').className='feedback bad';$$('#modeChoices button').find(x=>x.dataset.mode===r.a).classList.add('correct')}
    $$('#modeChoices button').forEach(x=>x.disabled=true);setTimeout(()=>{mi=(mi+1)%modeRounds.length;renderMode()},1100)
  }});
}
renderMode();

// Final quiz
const qs=[
 ['Which IoT component measures a physical property?',['Sensor','Actuator','Gateway'],0],
 ['Which component physically changes the environment?',['Transceiver','Actuator','Cloud'],1],
 ['Why is fog computing useful?',['It moves processing closer to devices and lowers latency','It removes every gateway','It always replaces cloud'],0],
 ['Which IoT development issue makes advanced controls hard to run?',['Limited device resources','Too many keyboards','Unlimited power'],0],
 ['What does graceful degradation mean?',['The system safely steps down from automation toward manual operation','The system deletes itself','The network always speeds up'],0],
 ['Which is an example of tamper detection?',['Hardened steel only','Magnetic switch detecting an opened case','A cheaper plastic case'],1],
 ['Why is the gateway important?',['It can translate protocols and enforce security functions','It is only decorative','It replaces every sensor'],0],
 ['MiniSec-U rejects which packet counters?',['Only counters greater than the last accepted one','Equal or smaller counters','All even counters'],1],
 ['Why is OCB attractive for sensor nodes?',['It is efficient authenticated encryption with low operation overhead','It needs maximum memory','It has no authentication'],0]
];
const fq=$('#finalQuiz');let answered=0,score=0;
qs.forEach((q,i)=>{const card=document.createElement('article');card.className='final-q';card.innerHTML='<h3>'+(i+1)+'. '+q[0]+'</h3>';q[1].forEach((opt,j)=>{const b=document.createElement('button');b.textContent=opt;b.onclick=()=>{
  if(card.dataset.done)return;card.dataset.done='1';answered++;const bs=$$('button',card);bs.forEach(x=>x.disabled=true);
  if(j===q[2]){b.classList.add('correct');score++}else{b.classList.add('wrong');bs[q[2]].classList.add('correct')}
  updateFinal();
};card.appendChild(b)});fq.appendChild(card)});
const result=document.createElement('div');result.className='final-result';result.textContent='Complete all 9 questions to reveal your score.';fq.appendChild(result);
function updateFinal(){
  if(answered<qs.length){result.textContent=answered+'/9 complete · current score '+score;return}
  const pct=Math.round(score/qs.length*100);
  result.innerHTML='FINAL SCORE: '+score+'/9 ('+pct+'%) · Defense XP '+xp+'<br><span style="font-weight:600">'+(pct>=89?'Excellent — the city is secure.':pct>=67?'Good foundation — revisit highlighted answers.':'Re-run the games and flip the deep-dive cards before trying again.')+'</span>';
}