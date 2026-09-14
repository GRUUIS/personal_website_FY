'use strict';

Forge.createArmoryView = ({store, ui, audio, actions}) => {
  const {$, thumb, canvasThumb, recipeHTML, formulaText, symbols, unlockSummary} = Forge.UI;
  const level = () => store.data.level;
  const unlocks = () => Forge.unlocks(level());
  const run = () => store.data.run;
  let filter = '';

  function renderMap(){
    const index=run().level,stage=Forge.LEVELS[index];$('mapBanner').dataset.theme=stage.theme;
    $('chapterName').textContent='下一站 · 第 '+(index+1)+' 关';$('mapTitle').textContent=stage.name;$('mapNumber').textContent=String(index+1).padStart(2,'0')+' / 10';
    const hints={plain:'靠近墨怪，武器自动攻击。',forest:'点燃草地，余烬持续伤敌。',waterfall:'带上电元素，在水雾中更强。',cave:'让敌人排成一列，再贯穿它们。',forge:'等敌人聚拢，一锤击破。',border:'随地形换元素，迎战墨王。'};
    $('mapHint').textContent=hints[stage.theme];
    const rules={plain:['✦ 自动攻击'],forest:['火 · 草丛蔓延','石路隔火'],waterfall:['电 ↑','火 ↓'],cave:['↟ 直线贯穿'],forge:['▣ 范围砸击'],border:['火 · 草地','电 · 水雾']};
    $('mapRules').innerHTML=rules[stage.theme].map(text=>'<span>'+text+'</span>').join('');
    const ctx=$('mapCanvas').getContext('2d'),terrain=Forge.createTerrain(stage.theme);ctx.save();ctx.scale(.3,.3);ctx.fillStyle='#182d30';ctx.fillRect(0,0,960,600);ctx.fillStyle=({forest:'#597052',waterfall:'#718d83',cave:'#657274',forge:'#776257',border:'#818675'})[stage.theme]||'#acac80';ctx.fillRect(62,73,836,475);
    for(const r of terrain.wetZones){ctx.fillStyle='#4a99aa';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.fillStyle='#8bd6d0';for(let y=r.y+18;y<r.y+r.h;y+=26)ctx.fillRect(r.x+8,y,r.w-16,3);}
    for(const r of terrain.grass){ctx.fillStyle='#344f36';ctx.fillRect(r.x+2,r.y+2,r.size-4,r.size-4);ctx.fillStyle='#99b46d';ctx.fillRect(r.x+8,r.y+6,3,12);}
    for(const r of terrain.obstacles){ctx.fillStyle='#374651';ctx.fillRect(r.x+3,r.y+5,r.w,r.h);ctx.fillStyle='#c1be9c';ctx.fillRect(r.x,r.y,r.w,r.h-4);}
    ctx.fillStyle='#f7d693';ctx.fillRect(474,337,12,18);ctx.restore();
  }

  function renderArmory(){
    const works=store.data.works,selected=store.work(ui.selectedId)||works[0];ui.selectedId=selected.id;
    $('workshopLevel').textContent='工坊 '+level()+' 级';$('collectionCount').textContent=works.length;renderMap();
    const modes=Object.keys(Forge.WEAPONS).filter(mode=>unlocks().modes.includes(mode)||works.some(work=>work.mode===mode));if(filter&&!modes.includes(filter))filter='';
    $('typeFilters').classList.toggle('hidden',modes.length<2||works.length<4);$('typeFilters').innerHTML='';for(const mode of ['',...modes]){const b=document.createElement('button');b.textContent=mode?Forge.WEAPONS[mode].name:'全部';b.classList.toggle('selected',filter===mode);b.setAttribute('aria-pressed',filter===mode);b.onclick=()=>{filter=mode;renderArmory();};$('typeFilters').append(b);}
    $('weaponGrid').innerHTML='';
    for(const work of works.filter(w=>!filter||w.mode===filter)){
      const b=document.createElement('button');b.className='weapon-card'+(work.id===ui.selectedId?' selected':'');b.setAttribute('aria-label','装备'+work.name);b.setAttribute('aria-pressed',store.data.loadout[0]===work.id);b.append(canvasThumb(work,160));
      const title=document.createElement('strong');title.textContent=work.name;b.append(title);
      const sub=document.createElement('small');sub.textContent=symbols[work.mode]+' '+Forge.WEAPONS[work.mode].label;b.append(sub);
      const recipe=Forge.recipe(work.pixels),track=document.createElement('div');track.className='mini-track';for(const [key,el] of Object.entries(Forge.ELEMENTS)){const bar=document.createElement('i');bar.style.width=recipe[key]*100+'%';bar.style.background=el.color;track.append(bar);}b.append(track);
      const slot=store.data.loadout.indexOf(work.id);const tag=document.createElement('span');tag.className='card-tag'+(slot<0?' available':'');tag.textContent=slot===0?'✓ 出战中':slot===1?'备用':'点击装备';b.append(tag);
      if(work.draft){const dot=document.createElement('span');dot.className='card-draft';dot.textContent='有草稿';b.append(dot);}
      b.onclick=()=>{ui.selectedId=work.id;actions.equip(work.id,0);};$('weaponGrid').append(b);
    }
    if(!$('weaponGrid').children.length)$('weaponGrid').innerHTML='<p class="subtle">还没有这类武器，可点击“新建武器”。</p>';
    $('loadoutSlots').innerHTML='';for(let slot=0;slot<unlocks().slots;slot++){
      const work=store.work(store.data.loadout[slot]),b=document.createElement('button');b.className='loadout-slot';
      if(work){b.append(canvasThumb(work));const label=document.createElement('div');const small=document.createElement('small');small.textContent=slot?'备用 · 点击更换':'主武器';const strong=document.createElement('strong');strong.textContent=work.name;label.append(small,strong);b.append(label);b.onclick=slot?chooseBackup:()=>{ui.selectedId=work.id;renderArmory();document.querySelector('.selection-details').open=true;};}
      else{b.textContent=works.length===1?'＋ 创建第二把武器':'＋ 选择备用武器';b.onclick=chooseBackup;}$('loadoutSlots').append(b);
    }
    thumb($('selectedArtwork'),selected);$('selectedName').textContent=selected.name;$('selectedType').textContent=Forge.WEAPONS[selected.mode].label+' · '+Forge.CRAFTS[selected.craft].name;
    $('selectedRecipe').innerHTML=recipeHTML(Forge.recipe(selected.pixels));$('selectedFormula').textContent=selected.formula?formulaText(selected):'';$('selectedFormula').classList.toggle('hidden',!selected.formula);
    const selectedSlot=store.data.loadout.indexOf(selected.id),backupLocked=unlocks().slots<2;
    $('equipMain').disabled=selectedSlot===0;$('equipMain').textContent=selectedSlot===0?'当前主武器':'设为主武器';$('equipMain').style.gridColumn=backupLocked?'1 / -1':'';
    $('equipBackup').classList.toggle('hidden',backupLocked);$('equipBackup').disabled=selectedSlot===1;
    $('equipBackup').textContent=works.length===1?'创建第二把武器':selectedSlot===1?'当前备用武器':selectedSlot===0&&!store.data.loadout[1]?'选择备用武器':'设为备用武器';$('deleteWorkButton').disabled=works.length===1;
    document.querySelector('.loadout-panel>.control-note').textContent=backupLocked?'每关可换 · Lv.4 可带两把':'每关可换 · 战斗中 Q 切换';
    $('progressText').textContent=store.data.cleared.length+' / 10 关已通关';$('route').innerHTML='';Forge.LEVELS.forEach((stage,index)=>{const node=document.createElement('span');node.className='route-node'+(store.data.cleared.includes(index)?' done':'')+(index===run().level?' current':'');node.textContent=store.data.cleared.includes(index)?'✓':index+1;node.title=stage.name;$('route').append(node);});
    $('nextUnlock').textContent=level()<10?`下一级解锁：${unlockSummary(level(),level()+1)||'通关展示'}`:'全部工坊功能已解锁';
    const lesson=store.data.onboarding.loadoutLessonPending&&!store.data.onboarding.loadoutLearned;
    $('armory').classList.toggle('learning-loadout',!!lesson);
    $('armoryStatus').textContent=run().complete?'十关完成 ✓':run().active?'调整装备，再试一次':run().level>0?'第 '+run().level+' 关完成 ✓':'准备出发';
    $('loadoutGuideTitle').textContent='每关结束，都能换武器';
    $('loadoutGuideText').textContent=lesson?'先点一把试试，原来的武器会保留。':'点卡片即可换上，也可以沿用当前装备。';
    $('chooseStep').classList.toggle('current',!!lesson);$('departStep').classList.toggle('current',!lesson);
    $('chooseStep').textContent=lesson?'1 选武器':'✓ 已装备';
    $('departureHint').textContent=lesson?'↓ 点选任意武器完成准备':store.work(store.data.loadout[0]).name+' · 已就位';
    $('startButton').disabled=!!lesson;
    $('startButton').textContent=lesson?'先点选一把武器':run().complete?'再来一轮 →':run().rewardPending?'领取强化 →':run().active?'重试第 '+(run().level+1)+' 关 →':'出发 · 第 '+(run().level+1)+' 关 →';
  }

  function showNewWork() {
    actions.showDialog('new','<h2 id="modalTitle">新建武器</h2><p>选择攻击类型，再绘制武器外观。</p><div id="newWorkChoices" class="new-work-grid"></div><div class="modal-actions"><button id="cancelNew" class="secondary-button">返回武器库</button></div>');
    for (const [mode, weapon] of Object.entries(Forge.WEAPONS).filter(([,weapon])=>weapon.unlock<=level())) {
      const button = document.createElement('button');
      button.className = 'new-work-card';
      button.innerHTML = '<span class="new-type-symbol">' + symbols[mode] + '</span><strong>' + weapon.name + '</strong><small>' +
        weapon.description + '</small>';
      button.onclick = () => actions.create(mode);
      $('newWorkChoices').append(button);
    }
    $('cancelNew').onclick = actions.hideDialog;
  }

  function chooseBackup(){
    const candidates=store.data.works.filter(work=>work.id!==store.data.loadout[0]);
    if(!candidates.length){showNewWork();return;}
    actions.showDialog('backup','<h2 id="modalTitle">选择备用武器</h2><div id="backupChoices" class="new-work-grid"></div><div class="modal-actions"><button id="createBackup" class="secondary-button">新建武器</button><button id="cancelBackup" class="secondary-button">返回武器库</button></div>');
    for(const work of candidates){const button=document.createElement('button');button.className='new-work-card';button.append(canvasThumb(work,80));const name=document.createElement('strong');name.textContent=work.name;button.append(name);button.onclick=()=>{actions.hideDialog();actions.equip(work.id,1);};$('backupChoices').append(button);}
    $('createBackup').onclick=showNewWork;$('cancelBackup').onclick=actions.hideDialog;
  }

  $('newWorkButton').onclick = showNewWork;
  $('editWorkButton').onclick = () => actions.edit(ui.selectedId);
  $('copyWorkButton').onclick = () => actions.duplicate(ui.selectedId);
  $('exportWorkButton').onclick = () => actions.export(store.work(ui.selectedId));
  $('deleteWorkButton').onclick = () => actions.remove(ui.selectedId);
  $('equipMain').onclick = () => actions.equip(ui.selectedId, 0);
  $('equipBackup').onclick = () => {
    if(store.data.works.length===1||(ui.selectedId===store.data.loadout[0]&&!store.data.loadout[1]))chooseBackup();
    else actions.equip(ui.selectedId,1);
  };
  $('newJourneyButton').onclick = actions.restart;
  $('startButton').onclick = actions.start;

  return {render: renderArmory};
};
