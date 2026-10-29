(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  let lang = localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'zh';
  const tr = (zh, en) => lang === 'zh' ? zh : en;
  const name = s => lang === 'zh' ? s.nameZh : s.nameEn;
  let servants = [], classSelection = 'saber', filter = 'all', loop = 'power', loopStep = 0, openServant = null, artStage = 0;
  const classes = {
    saber:['剑士','Saber','剑',20,17,'lancer','archer'], lancer:['枪兵','Lancer','枪',8,53,'archer','saber'], archer:['弓兵','Archer','弓',32,53,'saber','lancer'],
    rider:['骑兵','Rider','骑',69,17,'caster','assassin'], caster:['魔术师','Caster','术',57,53,'assassin','rider'], assassin:['暗杀者','Assassin','杀',82,53,'rider','caster'],
    berserker:['狂战士','Berserker','狂',30,87,null,null], shielder:['盾兵','Shielder','盾',70,87,null,null]
  };
  const className = c => classes[c][lang === 'zh' ? 0 : 1];
  const chip = c => `<span class="deck-chip ${c}" title="${c}" aria-label="${c}">${c[0]}</span>`;
  const getSvt = c => servants.find(s => s.className === c);
  function renderClasses() {
    const c = classes[classSelection];
    let svg = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4" fill="#8da5b6"/></marker></defs>';
    for (const [key, v] of Object.entries(classes).filter(([,v]) => v[5])) {
      const to = classes[v[5]], dx = to[3]-v[3], dy = to[4]-v[4];
      svg += `<line x1="${v[3]+dx*.28}" y1="${v[4]+dy*.28}" x2="${v[3]+dx*.73}" y2="${v[4]+dy*.73}" stroke="${key===classSelection?'#dfc17e':'#58728a'}" stroke-width="${key===classSelection?'.65':'.35'}" marker-end="url(#arrow)"/>`;
    }
    $('#class-orbits').innerHTML = svg+'</svg>'+Object.entries(classes).map(([key,v])=>`<button class="class-node ${key===classSelection?'active':''}" data-class="${key}" style="left:${v[3]}%;top:${v[4]}%" aria-pressed="${key===classSelection}"><b>${tr(v[2],v[1])}</b><small>${tr(v[1],v[0])}</small></button>`).join('');
    let atk,def,explain;
    if(classSelection==='berserker') {
      atk=tr('七基本职阶 ×1.5','Basic seven ×1.5'); def=tr('通常承受 ×2','Usually takes ×2');
      explain=tr('广泛的攻击相性与较高的承伤并存；对狂阶自身的承伤为 ×1.5。数值只指职阶相性倍率，不是最终伤害。特殊职阶与个体技能另论。','Broad offensive affinity comes with higher incoming damage; another Berserker deals ×1.5. These are class-affinity factors, not final damage. Extra classes and individual skills are outside this model.');
    } else if(classSelection==='shielder') {
      atk=tr('图中职阶 ×1','Shown classes ×1');def=tr('图中职阶 ×1','Shown classes ×1');
      explain=tr('在本图范围内保持中性相性。职阶不等于完整战斗定位：玛修的保护能力仍来自具体技能与宝具，不能由“盾”字直接推导数值。','Neutral affinity within this diagram. Class is not a complete combat role: Mash’s protection comes from her particular skills and NP, not a label alone.');
    } else {
      atk=className(c[5])+' ×2';def=className(c[6])+' ×2';
      explain=tr(`攻击${className(c[6])}时为 ×0.5，受到${className(c[5])}攻击时为 ×0.5。克制形成编队选择，但仍需结合技能、宝具、礼装与关卡目标。`,`Deals ×0.5 to ${className(c[6])}, and takes ×0.5 from ${className(c[5])}. Affinity creates party choices, alongside skills, NP, Craft Essences and quest objectives.`);
    }
    $('#class-readout').innerHTML=`<span class="class-en">${c[1].toUpperCase()} / ${tr('职阶档案','CLASS RECORD')}</span><h3>${className(classSelection)}</h3><p>${explain}</p><div class="affinity-pair"><div><small>${tr('攻击有利','OFFENSE')}</small><strong>${atk}</strong></div><div><small>${tr('承伤注意','INCOMING')}</small><strong>${def}</strong></div></div><p class="fineprint">${tr('策划视角：类别关系提供可读的选择入口，个体能力决定更细的阵容分工。','Design lens: class relationships make choices legible; individual abilities shape finer party roles.')}</p><button data-open="${getSvt(classSelection)?.id}">${tr('查看代表从者 ↗','Open representative Servant ↗')}</button>`;
  }
  function renderCards() {
    $('#hero-cards').innerHTML=['archer','shielder','saber'].map(c=>{const s=getSvt(c);return `<button class="hero-card" data-open="${s.id}" aria-label="${tr('查看','View')} ${name(s)}"><img src="${s.cardImages[0]}" alt="${name(s)}" ${c==='saber'?'fetchpriority="high"':''}></button>`}).join('');
    $('#servant-filters').innerHTML=[['all',tr('全部档案','All records')],...Object.keys(classes).map(c=>[c,className(c)])].map(([id,label])=>`<button class="${filter===id?'active':''}" data-filter="${id}" aria-pressed="${filter===id}">${label}</button>`).join('');
    const query=$('#servant-search').value.toLowerCase().trim();
    const shown=servants.filter(s=>(filter==='all'||s.className===filter)&&`${s.nameZh} ${s.nameEn} ${s.className}`.toLowerCase().includes(query));
    $('#servant-grid').innerHTML=shown.length?shown.map(s=>`<button class="servant-card" data-open="${s.id}" aria-label="${tr('打开从者档案','Open Servant record')}: ${name(s)}"><div class="card-image"><img src="${s.cardImages[0]}" alt="${name(s)}" loading="lazy" width="512" height="724"><span class="card-open">↗</span></div><div class="card-meta"><small>${s.className.toUpperCase()} · ${'★'.repeat(s.rarity)}</small><strong>${name(s)}</strong><div class="deck-mini">${s.cards.map(chip).join('')}</div></div></button>`).join(''):`<div class="empty-state">${tr('没有匹配的从者，试试其他姓名或职阶。','No matching Servants. Try another name or class.')}</div>`;
  }
  const analysisEn={saber:'Ascension art makes progression visible, connecting numerical investment to the character’s presentation.',archer:'Class affinity is one layer of matching. Deck composition and NP identity add more party-building choices.',lancer:'A shared class does not imply identical play. Skills and survival tools differentiate individual Servants.',rider:'A low-rarity sample helps separate rarity, acquisition and useful party roles.',caster:'A deck with several Arts cards is a prompt to study NP access and team coordination, not proof of a single role.',assassin:'Deck composition offers a starting point for studying star generation, while actual results still depend on hit counts and skills.',berserker:'Broad offensive affinity comes with defensive risk, creating a reason to consider protection and party synergy.',shielder:'A story-linked character connects protection, narrative discovery and long-term attachment.'};
  function renderDialog() {
    const s=openServant;
    $('#servant-detail').innerHTML=`<div class="detail-layout"><div class="detail-art"><img src="${s.cardImages[artStage]}" alt="${name(s)} · ${tr('卡面阶段','Art stage')} ${artStage+1}"><div class="ascension-controls">${s.cardImages.map((_,i)=>`<button data-stage="${i}" class="${artStage===i?'active':''}" aria-pressed="${artStage===i}">${tr('阶段','Stage')} ${i+1}</button>`).join('')}</div><p class="fineprint">${tr('基础卡面样本；不展示最终再临。','Base art samples; final ascension is not shown.')}</p></div><div class="detail-info"><div class="eyebrow">${s.className.toUpperCase()} / ${'★'.repeat(s.rarity)}</div><h2>${name(s)}</h2><p>${tr(s.nameEn,s.nameZh)}</p><h3>${tr('角色定义 / 指令卡构成','Identity / Command deck')}</h3><div class="deck">${s.cards.map(chip).join('')}</div><p>${tr('Buster 偏向伤害，Arts 偏向 NP 获取，Quick 偏向暴击星获取；实际收益受卡位、命中数、技能与其他规则影响。','Buster emphasizes damage, Arts NP gain and Quick critical stars; results depend on card position, hit counts, skills and other rules.')}</p><h3>${tr('宝具样本 / 基础数据','Noble Phantasm / Base record')}</h3><p>${s.npName} · ${s.npCard}<br>${tr('此处为基础版本记录，不合并后续强化或剧情变化。','This is a base-version record, not a merge of later upgrades or story changes.')}</p><h3>${tr('设计观察','Design interpretation')}</h3><p>${tr(s.analysisZh,analysisEn[s.className])}</p><h3>${tr('接下来分析什么？','What to inspect next')}</h3><p>${tr('培养改变哪些数值？哪些内容随进度开放？将角色带入战斗或展示给他人，又会产生什么新的投入理由？','Which values can progression change? Which content unlocks over time? How do combat use and display create reasons to invest again?')}</p><a href="${s.source}" target="_blank" rel="noopener" class="text-link">Atlas Academy / ${tr('基础数据 ↗','Base data ↗')}</a><br><button class="primary" data-try-support="${s.id}">${tr('带入支援演示 →','Try in the support demo →')}</button></div></div>`;
  }
  const loops={
    power:[
      ['获得从者','Acquire','获得了新的能力组合与培养对象。获取渠道连接召唤、活动或兑换；获取并不自动等于已经形成战斗力。','A new ability set and investment target enters the collection. Acquisition alone is not usable power.','观察：获得后，玩家下一步去查看、编队还是培养？','Observe: does the player inspect, equip or develop the new Servant?'],
      ['投入资源','Invest','经验、QP 与阶段材料形成不同的限制。先确认当前目标，再判断哪一种投入能改变实际战斗结果。','EXP, QP and milestone materials impose different constraints. Identify the goal before deciding which investment changes the outcome.','取舍：培养喜欢的角色，还是补齐当前阵容缺口？','Trade-off: a favorite character, or a missing party function?'],
      ['完善能力','Build capability','成长可以提高数值，也可以开放能力或改善技能循环。不同培养项应分别记录成本、收益和前置条件。','Growth can increase stats, unlock abilities or improve skill cycles. Record each path’s costs, returns and prerequisites.','问题：收益是否足够可见，足以让玩家理解资源花在了哪里？','Question: is the return visible enough to explain the investment?'],
      ['关卡应用','Apply in quests','玩家在关卡中验证阵容。通关、回合数、稳定性与操作负担是不同结果，不能只用单一伤害数值代替。','Quests test the party. Completion, turn count, reliability and effort are distinct outcomes.','证据：同一任务下，对比培养前后的完成情况。','Evidence: compare results before and after investment on the same task.'],
      ['获得后续资源','Earn resources','奖励重新进入库存，支持下一轮培养。循环的速度受体力、材料来源、关卡条件和玩家时间共同约束。','Rewards replenish inventory for further growth. Energy, materials, access and player time all constrain the cycle.','问题：当一个瓶颈解除后，下一项瓶颈在哪里？','Question: when one constraint is removed, which becomes binding next?']
    ],
    emotion:[
      ['产生兴趣','Become curious','人物形象、故事出场和既有 IP 认知都可能成为入口。不同玩家的初始动机不必相同。','Art, story appearances and prior IP knowledge can all initiate interest. Players need not share one motive.','观察：玩家首先因为什么注意到这位角色？','Observe: what first drew this player to the character?'],
      ['接触与使用','Spend time','带入战斗、查看资料与互动增加接触机会。接触次数不等于正向情感，重复负担也可能削弱体验。','Combat, profiles and interactions create exposure. Repetition can build familiarity or become a burden.','取舍：高频接触与重复疲劳之间如何平衡？','Trade-off: familiarity versus repetitive fatigue.'],
      ['了解角色','Discover','语音、资料、羁绊和幕间补充人物信息。逐项记录解锁条件，区分内容观看与战斗强化。','Voices, profiles, bond and interludes reveal a character. Record distinct unlock conditions and separate content from power.','问题：新增内容是否改变了对角色的理解？','Question: does new content change the player’s understanding?'],
      ['形成认同','Build attachment','玩家可能形成偏好、记忆和展示意愿。这是解释假设，需要访谈与行为互相印证。','Players may form preferences, memories and a desire to display their investment. This needs behavioral and interview evidence.','证据：选择理由、主动查看和非效率最优时的使用。','Evidence: stated reasons, voluntary viewing and use beyond optimal efficiency.'],
      ['再次投入','Reinvest','培养、收集与展示成为新的表达。情感动机与效率动机可能互相支持，也可能产生资源分配冲突。','Growth, collection and display become forms of expression. Attachment and efficiency may align or compete for resources.','问题：玩家愿意投入什么，又愿意放弃什么？','Question: what will the player invest, and what will they forgo?']
    ]
  };
  function renderLoop(){
    $('#loop-tabs').innerHTML=[['power',tr('能力循环','Capability loop')],['emotion',tr('情感循环','Attachment loop')]].map(([id,n])=>`<button data-loop="${id}" class="${loop===id?'active':''}" aria-pressed="${loop===id}">${n}</button>`).join('');
    $('#loop-diagram').innerHTML=loops[loop].map((n,i)=>`<button data-loop-step="${i}" class="loop-node ${i===loopStep?'active':''}" aria-pressed="${i===loopStep}"><small>0${i+1}</small><strong>${tr(n[0],n[1])}</strong></button>`).join('');
    const n=loops[loop][loopStep];$('#loop-detail').innerHTML=`<div><small>${tr('机制 / 作用','MECHANISM / ROLE')}</small><h3>${tr(n[0],n[1])}</h3><p>${tr(n[2],n[3])}</p></div><div><small>${tr('进一步追问','NEXT QUESTION')}</small><p>${tr(n[4],n[5])}</p></div>`;
  }
  function renderEconomy(){
    const v=Object.fromEntries(['regen','cost','reward','upgrade','material'].map(k=>[k,Number($('#'+k).value)]));
    Object.entries(v).forEach(([k,n])=>$('#'+k+'-value').textContent=n.toLocaleString());
    const energy=Math.floor(1440/v.regen), runs=Math.floor(energy/v.cost), income=runs*v.reward, currencyCap=Math.floor(income/v.upgrade), up=Math.min(currencyCap,v.material);
    $('#economy-stats').innerHTML=[[tr('每日可用体力','Daily energy'),energy,'AP'],[tr('可完成关卡','Completed runs'),runs,tr('次','runs')],[tr('支持完整升级','Complete upgrades'),up,tr('次 / 日','/ day')]].map(([a,b,c])=>`<div><small>${a}</small><strong>${b}</strong> <span>${c}</span></div>`).join('');
    const reason=currencyCap<v.material?tr('当前瓶颈：货币','Binding constraint: currency'):currencyCap>v.material?tr('当前瓶颈：材料','Binding constraint: materials'):tr('货币与材料同时约束','Both resources constrain growth');
    $('#bottleneck').textContent=`${reason} · ${tr('货币支持','Currency supports')} ${currencyCap} / ${tr('材料支持','materials support')} ${v.material}`;
    const max=Math.max(currencyCap,v.material,1);
    $('#economy-chart').innerHTML=[[tr('货币可支持','Currency capacity'),currencyCap],[tr('材料可支持','Material capacity'),v.material]].map(([label,n])=>`<div class="bar-row"><span>${label}</span><div class="bar-track"><i style="width:${n/max*100}%"></i></div><span>${n}</span></div>`).join('')+`<p class="fineprint">${tr('产出','Income')} ${income.toLocaleString()} G · ${tr('升级后余款','Currency after upgrades')} ${(income-up*v.upgrade).toLocaleString()} G · ${tr('剩余体力','Energy left')} ${energy-runs*v.cost} AP</p>`;
  }
  // Each object below describes a screen; relationship and support configuration remain separate state.
  const screens={
    terminal:['关卡入口','Quest entry','我需要完成当前关卡。','I want to complete this quest.','把支援入口放在需求发生时：先看敌方职阶，再选择对应支援。','Put help where the need occurs: inspect enemies, then select support.','进入关卡选择，不改变好友关系。','Enter selection; no relationship change.','入口组织是否能减少寻找功能的成本？','Does the entry point reduce the cost of finding help?'],
    select:['选择支援','Choose support','找到适合当前敌人的从者。','Find a Servant suited to the enemy.','职阶筛选、资料与礼装信息帮助决策；刷新可以改变候选，但频繁刷新也增加负担。','Class filters, profiles and CE information inform selection. Refreshing changes candidates but adds effort.','未选择 → 已选择支援。','No selection → support selected.','记录查找时长、刷新次数、选中与放弃的原因。','Observe selection time, refreshes and reasons for selecting or leaving.'],
    party:['确认编队','Confirm party','确认借来的从者如何补充队伍。','Check how the borrowed Servant complements the party.','支援占据一位队伍位置，其 COST 不计入玩家编队总 COST；此处仅展示教学三人前排。','Support occupies one slot and does not count toward party COST; this study shows a three-person frontline only.','选择支援 → 编队确认。','Support selected → party confirmed.','是否能清楚区分自己的从者与借用支援？','Can players distinguish owned and borrowed Servants?'],
    result:['战后转化','After the battle','判断是否希望以后再次使用。','Decide whether to use this support again.','一次使用体验为关系判断提供依据；战后申请将即时价值连接到长期互助。','A use experience informs a relationship decision. Post-battle requests connect immediate value with future help.','无关系 → 申请中（需对方接受）。','No relationship → pending (requires acceptance).','申请率不能替代长期价值，需继续观察接受与再次使用。','Request rate is not long-term value; observe acceptance and reuse.'],
    requests:['申请处理','Requests','知道关系建立到了哪一步。','Understand the relationship’s current status.','发出申请不等于成为好友；这里可推进对方接受的模拟事件，也可处理一条收到的示例申请。','Sending is not acceptance. Advance a simulated recipient response or handle an example incoming request.','申请中 → 已成为好友 / 申请被拒绝。','Pending → friends / declined.','结果是否及时反馈，容量变化是否可理解？','Are outcomes timely and capacity changes understandable?'],
    friends:['关系维护','Manage friends','找到、保留和整理已有关系。','Find, keep and organize relationships.','锁定与关系本身分开：锁定保护已有关系，但不是新的关系等级。解除前先解锁。','Locking protects a relationship; it is not a relationship tier. Unlock before removal.','好友 + 锁定状态可以并存。','Friendship and lock state coexist.','维护成本是否随好友数量上升？哪些信息帮助玩家选择？','Does maintenance effort grow with friend count? Which information helps?'],
    supply:['配置支援','Configure support','把自己的培养成果提供给他人。','Make my developed Servants available to others.','按用途保存配置，减少重复调整；本原型用一个职阶槽位说明配置与应用的区别。','Save setups by use case to reduce repeat work. One class slot illustrates editing versus applying.','编辑草稿 → 保存到通常或活动配置。','Edit draft → save to normal or event setup.','更换礼装与从者的成本是否足够低？如何知道已生效？','Is changing a Servant or CE easy? Is the applied state visible?']
  };
  const fresh=()=>({screen:'terminal',selected:null,supportClass:'all',refresh:0,sent:false,accepted:false,incoming:'pending',friends:[{id:'seed',svt:100100,user:'Aster',locked:false}],friendQuery:'',friendSort:'name',supplyMode:'normal',draftId:100100,draftCE:'np',saved:{},feedback:null});
  let demo=fresh();
  const demoSvt=()=>servants.find(s=>s.id===demo.selected);
  const feedback=(zh,en)=>{demo.feedback=[zh,en];$('#demo-feedback').textContent=tr(zh,en)};
  const go=screen=>{demo.screen=screen;demo.feedback=null;renderSupport()};
  function supportRow(s,i){
    return `<div class="support-row"><img src="${s.cardImages[0]}" alt="${name(s)}"><div class="row-main"><strong>${name(s)} · ${className(s.className)}</strong><small>Observer ${String(i+1).padStart(2,'0')} · Lv.80 · ${tr('示例技能','Demo skills')} 6/6/6</small><small>${tr('礼装：起始 NP 型（示意）','CE: Starting NP effect (illustrative)')}</small><span class="relation-badge">${tr('非好友 · 教学候选','Non-friend · Demo candidate')}</span></div><div class="row-actions"><button data-open="${s.id}">${tr('详情','Details')}</button><button data-borrow="${s.id}">${tr('选择 →','Choose →')}</button></div></div>`;
  }
  function renderSupport(){
    const sc=demo.screen, d=screens[sc];
    $('#support-flow').innerHTML=Object.entries(screens).map(([id,s])=>`<button data-go="${id}" class="${sc===id?'active':''}" aria-current="${sc===id?'step':'false'}">${tr(s[0],s[1])}</button>`).join('');
    $('#game-status').textContent=`${tr('好友','FRIENDS')} ${demo.friends.length}/5 · DEMO`;
    $('#game-bottom').innerHTML=[['terminal',tr('关卡','Quests')],['friends',tr('好友','Friends')],['requests',tr('申请','Requests')],['supply',tr('支援编制','Support setup')]].map(([id,n])=>`<button data-go="${id}" class="${id===sc?'active':''}">${n}</button>`).join('');
    $('#screen-analysis').innerHTML=`<div class="eyebrow">SCREEN / ${String(Object.keys(screens).indexOf(sc)+1).padStart(2,'0')}</div><h3>${tr(d[0],d[1])}</h3><div class="analysis-block"><small>${tr('玩家目标','PLAYER GOAL')}</small><p>${tr(d[2],d[3])}</p></div><div class="analysis-block"><small>${tr('设计解读 · 推断','DESIGN INTERPRETATION')}</small><p>${tr(d[4],d[5])}</p></div><div class="status-transition">${tr(d[6],d[7])}</div><div class="analysis-block"><small>${tr('如何观察效果','WHAT TO OBSERVE')}</small><p>${tr(d[8],d[9])}</p></div>`;
    let content='';
    if(sc==='terminal') content=`<div class="terminal-hero"><div><div class="eyebrow">TERMINAL / TRAINING QUEST</div><h3>${tr('下一次出击，\n需要谁的帮助？','Who will help\non the next quest?').replaceAll('\n','<br>')}</h3><p>${tr('御主 FY · Lv.149（演示）','Master FY · Lv.149 (demo)')}</p></div><img src="${getSvt('shielder').cardImages[0]}" alt="Mash"></div><button class="quest-button" data-go="select"><strong>${tr('进入教学关卡 →','Enter the training quest →')}</strong><small>${tr('敌方：Lancer / 枪阶 · 此处不扣除真实 AP','Enemy: Lancer · No real AP is consumed')}</small></button><p class="screen-note">${tr('提示：试着借一位 Saber，再观察战后申请。','Tip: borrow a Saber, then explore the post-battle request.')}</p>`;
    if(sc==='select'){
      let candidates=servants.filter(s=>demo.supportClass==='all'||s.className===demo.supportClass);
      if(demo.refresh%2)candidates=[...candidates].reverse();
      content=`<div class="screen-top"><h3>${tr('选择支援','Choose support')}</h3><button id="refresh-support">${tr('刷新','Refresh')} ↻</button></div><div class="mini-filters">${['all',...Object.keys(classes)].map(c=>`<button data-support-class="${c}" class="${demo.supportClass===c?'active':''}">${c==='all'?'ALL':tr(classes[c][2],classes[c][1])}</button>`).join('')}</div><p>${tr('敌方：Lancer · 七基本职阶图示下 Saber 攻击有利。','Enemy: Lancer · Saber has offensive advantage in the basic diagram.')}</p>${candidates.slice(0,4).map(supportRow).join('')}<p class="fineprint">${tr('一次展示最多 4 个教学样本；刷新仅轮换顺序。','Up to four demo candidates per view; refresh rotates order only.')}</p>`;
    }
    if(sc==='party'){
      const chosen=demoSvt();
      content=chosen?`<div class="screen-top"><h3>${tr('编队确认','Party confirmation')}</h3><small>FRONT LINE / 3</small></div><div class="party-slots">${[getSvt('shielder'),getSvt('archer'),chosen].map((s,i)=>`<div class="party-slot ${i===2?'borrowed':''}"><img src="${s.cardImages[0]}" alt="${name(s)}"><strong>${name(s)}</strong><small>${i===2?'＋ SUPPORT':tr('自有从者','OWNED')}</small></div>`).join('')}</div><p class="screen-note">${tr('支援不计入队伍 COST。这个示意只呈现前排，完整编队还包含后备位。','Support does not count toward party COST. This diagram shows the frontline; full parties also have reserves.')}</p><div class="result-actions"><button data-go="select">${tr('重新选择','Choose again')}</button><button class="primary" id="simulate-battle">${tr('模拟完成战斗 →','Simulate battle completion →')}</button></div>`:`<div class="empty-state">${tr('先选择一位支援，才能确认编队。','Select a support before confirming the party.')}<br><button data-go="select">${tr('选择支援','Choose support')}</button></div>`;
    }
    if(sc==='result'){
      const chosen=demoSvt();
      content=chosen?`<div class="result-card"><div class="result-emblem">◇</div><h3>QUEST CLEAR</h3><p>${tr('模拟结算 · 未运行战斗算法','Simulated result · No combat algorithm')}</p><div class="result-rewards"><div><strong>+200</strong><small>${tr('友情点（演示值）','Friend points (demo)')}</small></div><div><strong>+100</strong><small>${tr('经验（演示值）','EXP (demo)')}</small></div></div><p>${tr('使用了','Used')} ${name(chosen)} ${tr('的支援，是否建立持续联系？','as support. Would you keep this connection?')}</p><div class="result-actions"><button class="primary" id="send-request" ${demo.sent||demo.accepted?'disabled':''}>${demo.accepted?tr('已成为好友','Already friends'):demo.sent?tr('申请已发送','Request sent'):tr('发送好友申请','Send friend request')}</button><button data-go="select">${tr('暂不申请，再次出击','Skip and play again')}</button></div>${demo.sent?`<button data-go="requests">${tr('查看申请状态 →','View request status →')}</button>`:''}</div>`:`<div class="empty-state">${tr('从选择支援开始，体验一次完整流程。','Start with support selection to experience the complete flow.')}<br><button data-go="select">${tr('开始','Start')}</button></div>`;
    }
    if(sc==='requests'){
      const chosen=demoSvt();
      const outgoing=demo.sent&&chosen?`<div class="support-row"><img src="${chosen.cardImages[0]}" alt="${name(chosen)}"><div class="row-main"><strong>${tr('已发出申请','Outgoing request')} · ${name(chosen)}</strong><small>${demo.accepted?tr('已接受，好友列表已更新','Accepted; friends list updated'):tr('等待对方接受','Waiting for recipient')}</small></div></div>${!demo.accepted?`<button class="primary" id="accept-outgoing">${tr('推进演示：对方接受','Advance demo: recipient accepts')}</button><p class="screen-note">${tr('此按钮模拟另一位玩家的操作；实际游戏需要对方接受。','This button simulates the other player. Real requests require their acceptance.')}</p>`:''}`:`<p class="screen-note">${tr('暂未发出申请。完成一次支援演示后可申请。','No outgoing request. Complete a support demo to send one.')}</p>`;
      content=`<h3>${tr('申请管理','Request management')}</h3>${outgoing}<hr><p>${tr('收到的示例申请','Example incoming request')}</p><div class="support-row"><img src="${getSvt('rider').cardImages[0]}" alt="Medusa"><div class="row-main"><strong>Nova</strong><small>${tr('希望借用你的支援','Wants to use your support')}</small><small>${demo.incoming==='pending'?tr('等待处理','Pending'):demo.incoming==='accepted'?tr('已接受','Accepted'):tr('已拒绝','Declined')}</small></div>${demo.incoming==='pending'?`<div class="row-actions"><button id="accept-incoming">${tr('接受','Accept')}</button><button id="reject-incoming">${tr('拒绝','Decline')}</button></div>`:''}</div>`;
    }
    if(sc==='friends'){
      const query=demo.friendQuery.toLowerCase();let list=demo.friends.filter(f=>f.user.toLowerCase().includes(query)||name(servants.find(s=>s.id===f.svt)).toLowerCase().includes(query));
      if(demo.friendSort==='name') list=[...list].sort((a,b)=>a.user.localeCompare(b.user));
      else list=[...list].reverse();
      content=`<div class="screen-top"><h3>${tr('好友列表','Friends')}</h3><small>${demo.friends.length} / 5 · ${tr('演示容量','demo cap')}</small></div><div class="friend-toolbar"><input id="friend-search" type="search" aria-label="${tr('搜索好友','Search friends')}" placeholder="${tr('昵称 / 从者','Name / Servant')}"><select id="friend-sort" aria-label="${tr('好友排序','Sort friends')}"><option value="name">${tr('昵称顺序','By name')}</option><option value="recent">${tr('最近添加','Recently added')}</option></select></div><div id="friend-rows">${list.length?list.map(f=>{const s=servants.find(s=>s.id===f.svt);return `<div class="support-row"><img src="${s.cardImages[0]}" alt="${name(s)}"><div class="row-main"><strong>${f.user} ${f.locked?'◆':''}</strong><small>${name(s)}</small><small>${tr('最近登录：今天（演示）','Last active: today (demo)')}</small></div><div class="row-actions"><button data-lock="${f.id}">${f.locked?tr('解锁','Unlock'):tr('锁定','Lock')}</button><button data-remove="${f.id}" ${f.locked?'disabled':''}>${tr('解除','Remove')}</button></div></div>`}).join(''):`<div class="empty-state">${tr('没有匹配的好友。可调整搜索，或前往申请管理。','No matching friends. Adjust the search or open requests.')}</div>`}</div><p class="screen-note">${tr('锁定后禁用解除按钮；锁定状态与好友关系独立。','Locking disables removal; lock state and friendship are independent.')}</p>`;
    }
    if(sc==='supply'){
      const s=servants.find(s=>s.id===demo.draftId),saved=demo.saved[demo.supplyMode];
      content=`<h3>${tr('支援编制','Support setup')}</h3><div class="mini-filters">${['normal','event'].map(m=>`<button data-supply-mode="${m}" class="${demo.supplyMode===m?'active':''}">${m==='normal'?tr('通常支援','Normal quests'):tr('活动支援','Event quests')}</button>`).join('')}</div><div class="supply-layout"><img src="${s.cardImages[0]}" alt="${name(s)}"><div class="supply-fields"><label><span>${tr('教学槽位 / 从者','Study slot / Servant')}</span><select id="supply-servant">${servants.map(x=>`<option value="${x.id}" ${x.id===demo.draftId?'selected':''}>${className(x.className)} · ${name(x)}</option>`).join('')}</select></label><label><span>${tr('概念礼装效果（示意）','CE effect (illustrative)')}</span><select id="supply-ce"><option value="np" ${demo.draftCE==='np'?'selected':''}>${tr('起始 NP','Starting NP')}</option><option value="event" ${demo.draftCE==='event'?'selected':''}>${tr('活动掉落加成','Event drop bonus')}</option></select></label><button class="primary" id="save-supply">${tr('保存此用途的支援','Save this setup')}</button></div></div><p class="screen-note">${tr('保存状态：','Saved state: ')}${saved?name(servants.find(x=>x.id===saved.id))+' / '+(saved.ce==='np'?tr('起始 NP','Starting NP'):tr('活动加成','Event bonus')):tr('此用途尚未保存','No saved setup for this use')}</p><p>${tr('这里只展示一个教学槽位；真实的职阶栏位、套数与生效规则须按版本确认。','One instructional slot is shown. Actual class slots, set counts and activation rules are version-specific.')}</p>`;
    }
    $('#game-screen').innerHTML=content;
    if(sc==='friends'){$('#friend-search').value=demo.friendQuery;$('#friend-sort').value=demo.friendSort;}
    $('#demo-feedback').textContent=demo.feedback?tr(...demo.feedback):tr('点击界面控件开始探索。数值与账号均为教学示例。','Use the controls to explore. All accounts and values are illustrative.');
  }
  function applyLanguage(){
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';
    $$('[data-zh][data-en]').forEach(el=>el.textContent=el.dataset[lang]);
    $('#lang-toggle').textContent=lang==='zh'?'EN':'中文';localStorage.setItem('portfolio-language',lang);
    document.title=tr('FGO · 系统观察室 | Fan Yu','FGO · Systems Observatory | Fan Yu');
    renderClasses();renderCards();renderLoop();renderEconomy();renderSupport();if(openServant)renderDialog();
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.class){classSelection=b.dataset.class;renderClasses();}
    if(b.dataset.filter){filter=b.dataset.filter;renderCards();}
    if(b.dataset.open){openServant=servants.find(s=>s.id===Number(b.dataset.open));artStage=0;renderDialog();$('#servant-dialog').showModal();}
    if(b.dataset.stage!==undefined){artStage=Number(b.dataset.stage);renderDialog();$('#servant-dialog').querySelector(`[data-stage="${artStage}"]`).focus();}
    if(b.classList.contains('dialog-close'))$('#servant-dialog').close();
    if(b.dataset.trySupport){demo.selected=Number(b.dataset.trySupport);demo.accepted=demo.friends.some(f=>f.id==='borrowed-'+demo.selected);demo.sent=demo.accepted;$('#servant-dialog').close();go('party');$('#support').scrollIntoView({behavior:'smooth'});}
    if(b.dataset.loop){loop=b.dataset.loop;loopStep=0;renderLoop();}
    if(b.dataset.loopStep!==undefined){loopStep=Number(b.dataset.loopStep);renderLoop();}
    if(b.dataset.go)go(b.dataset.go);
    if(b.dataset.supportClass){demo.supportClass=b.dataset.supportClass;renderSupport();}
    if(b.dataset.borrow){demo.selected=Number(b.dataset.borrow);demo.accepted=demo.friends.some(f=>f.id==='borrowed-'+demo.selected);demo.sent=demo.accepted;go('party');feedback('已选中支援。确认队伍后可以模拟完成战斗。','Support selected. Confirm the party to simulate completion.');}
    if(b.dataset.lock){const f=demo.friends.find(f=>f.id===b.dataset.lock);f.locked=!f.locked;renderSupport();feedback(f.locked?'关系已锁定，解除按钮已禁用。':'已解锁，可解除关系。',f.locked?'Relationship locked; removal disabled.':'Unlocked; removal is available.');}
    if(b.dataset.remove){demo.friends=demo.friends.filter(f=>f.id!==b.dataset.remove);renderSupport();feedback('已解除示例好友关系。','Demo friendship removed.');}
    if(b.dataset.supplyMode){demo.supplyMode=b.dataset.supplyMode;const saved=demo.saved[demo.supplyMode];demo.draftId=saved?.id||100100;demo.draftCE=saved?.ce||'np';renderSupport();}
    switch(b.id){
      case 'lang-toggle':lang=lang==='zh'?'en':'zh';applyLanguage();break;
      case 'economy-reset':Object.entries({regen:6,cost:20,reward:25000,upgrade:50000,material:8}).forEach(([k,v])=>$('#'+k).value=v);renderEconomy();break;
      case 'support-reset':demo=fresh();renderSupport();break;
      case 'refresh-support':demo.refresh++;renderSupport();feedback('已轮换教学候选顺序。真实刷新规则依游戏版本而定。','Demo candidate order rotated. Real refresh rules depend on version.');break;
      case 'simulate-battle':go('result');break;
      case 'send-request':demo.sent=true;renderSupport();feedback('申请已发送：等待对方接受。','Request sent: waiting for recipient acceptance.');break;
      case 'accept-outgoing':if(demo.friends.length<5){demo.accepted=true;demo.friends.push({id:'borrowed-'+demo.selected,svt:demo.selected,user:'Observer '+demoSvt().className,locked:false});renderSupport();feedback('模拟对方已接受：好友列表已更新。','Simulated acceptance: friends list updated.');}else feedback('演示好友容量已满，请先在好友列表整理。','Demo capacity reached; manage the friends list first.');break;
      case 'accept-incoming':if(demo.friends.length<5){demo.incoming='accepted';demo.friends.push({id:'nova',svt:getSvt('rider').id,user:'Nova',locked:false});renderSupport();feedback('已接受 Nova 的示例申请。','Accepted Nova’s example request.');}else feedback('好友容量已满。','Friend capacity reached.');break;
      case 'reject-incoming':demo.incoming='declined';renderSupport();feedback('已拒绝示例申请。','Example request declined.');break;
      case 'save-supply':demo.saved[demo.supplyMode]={id:demo.draftId,ce:demo.draftCE};renderSupport();feedback('支援配置已保存到当前演示会话。可切换用途检查各自配置。','Setup saved for this demo session. Switch modes to inspect each setup.');break;
    }
  });
  document.addEventListener('input',e=>{
    if(e.target.matches('.range-row input'))renderEconomy();
    if(e.target.id==='servant-search')renderCards();
    if(e.target.id==='friend-search'){demo.friendQuery=e.target.value;renderSupport();const input=$('#friend-search');input.focus();}
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='friend-sort'){demo.friendSort=e.target.value;renderSupport();}
    if(e.target.id==='supply-servant'){demo.draftId=Number(e.target.value);renderSupport();}
    if(e.target.id==='supply-ce')demo.draftCE=e.target.value;
  });
  $('#servant-dialog').addEventListener('click',e=>{if(e.target===$('#servant-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){$$('.chapter-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}}),{rootMargin:'-15% 0px -60% 0px'});
  $$('main section[id]').forEach(s=>observer.observe(s));
  fetch('../js/fgo-servants.json').then(r=>r.json()).then(data=>{servants=data;applyLanguage();}).catch(()=>{$('#servant-grid').innerHTML='<p>档案暂未加载，请刷新页面 / Records could not load. Please refresh.</p>';});
})();
