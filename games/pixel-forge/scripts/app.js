'use strict';
(() => {
  const {$, escape, thumbRaw, canvasThumb, unlockSummary} = Forge.UI;
  const audio=new Forge.Audio();Forge.Sprites.init();
  const address=new URL(location.href),testMode=address.searchParams.get('test')==='1';
  const store=new Forge.WorkshopStore(localStorage,{test:testMode});
  if(testMode&&address.searchParams.has('reset')){store.resetTest();address.searchParams.delete('reset');history.replaceState(null,'',address);}
  let state = 'armory';
  const ui = {selectedId: store.data.loadout[0], draft: null, part: 'body', environment: 'plain', anchor: 'grip'};
  let loadingEditor=false,saveTimer,toastTimer,dialogKind='',returnFocus=null,lastSlot=-1;
  const keys=new Set();let stick={x:0,y:0},battleDestination=null;
  const preview=new Forge.Game((type,value)=>{if(type==='sound'&&state==='workshop')audio.play(value);});
  const game=new Forge.Game((type,value)=>{
    if(type==='sound')audio.play(value);
    if(type==='switch'){renderer.setArtwork(value);renderBattleLoadout();}
    if(type==='clear')finishStage();
    if(type==='dead')showDeath();
  });
  const previewRenderer=new Forge.Renderer($('previewCanvas'),preview);
  const renderer=new Forge.Renderer($('gameCanvas'),game);
  const editor=new Forge.Editor($('paintCanvas'),()=>{
    if(loadingEditor||!ui.draft)return;
    captureEditor();saveDraft();workshopView.refresh();
  },()=>workshopView.refreshTools());
  const level=()=>store.data.level,unlocks=()=>Forge.unlocks(level()),run=()=>store.data.run;

  const armoryView = Forge.createArmoryView({
    store, ui, audio,
    actions: {
      edit: openWorkshop, create: createWork, export: exportArt,
      start: launchStage, showDialog, hideDialog,
      duplicate(id) {
        const work = store.duplicate(id);
        openWorkshop(work.id);
        toast('副本已创建，可以单独编辑');
      },
      remove(id) {
        confirmAction('删除武器？', '将删除“' + escape(store.work(id).name) + '”及其草稿。', () => {
          store.remove(id);
          ui.selectedId = store.data.loadout[0];
          armoryView.render();
        });
      },
      equip(id, slot) {
        store.equip(id, slot);
        if (slot === 0) {
          store.data.onboarding.loadoutLearned = true;
          store.save();
        }
        armoryView.render();
        audio.play('equip');
        toast(slot === 0 ? '已装备 · ' + store.work(id).name : '备用已就位');
      },
      restart() {
        confirmAction('重玩关卡？', '本轮强化和关卡位置会重置。武器、工坊等级与首次通关记录会保留。', () => {
          store.newJourney();
          armoryView.render();
        });
      }
    }
  });
  const workshopView = Forge.createWorkshopView({
    store, ui, editor, preview, previewRenderer, audio, run,
    actions: {
      saveDraft, loadPart, toast, showDialog, hideDialog,
      commit() {
        persistDraft();
        store.commit(ui.selectedId, ui.draft);
        openArmory();
        audio.play('equip');
        toast('武器已保存');
      }
    }
  });

  const onboarding=Forge.createOnboarding({store,audio,active:()=>state==='onboarding',actions:{enter:()=>setScreen('onboarding'),explore:()=>{store.data.onboarding.loadoutLessonPending=true;store.save();ui.selectedId=store.data.loadout[0];openArmory();}}});

  function createWork(mode) {
    const preset = Forge.PRESETS.find(item => item.mode === mode && item.unlock <= level());
    const size = unlocks().size, pixels = Array(size * size).fill(0);
    const source = Forge.presetPixels(preset), offset = (size - preset.size) / 2;
    source.forEach((color, index) => {
      pixels[(Math.floor(index / preset.size) + offset) * size + index % preset.size + offset] = color;
    });
    const work = store.create({name: preset.name, mode, size, pixels});
    store.save();
    openWorkshop(work.id);
    audio.play('choose');
  }

  function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2700);}
  function setScreen(next){state=next;battleDestination=null;for(const id of ['onboarding','armory','workshop','battle'])$(id).classList.toggle('hidden',id!==next);document.body.classList.toggle('playing',next==='battle');document.body.classList.toggle('first-adventure',next==='onboarding');$('navArmory').classList.toggle('selected',next==='armory');$('navWorkshop').classList.toggle('selected',next==='workshop');keys.clear();releaseStick();audio.setPaused(false);window.scrollTo(0,0);}
  function persistDraft(){clearTimeout(saveTimer);store.save();if(ui.draft)$('savedIndicator').textContent=store.error?'浏览器未能保存，请导出原画':'草稿已自动保存';}
  function saveDraft(){store.keepDraft(ui.selectedId,ui.draft);$('savedIndicator').textContent='正在保存草稿…';clearTimeout(saveTimer);saveTimer=setTimeout(persistDraft,180);}
  function captureEditor(){
    const art=editor.exportArtwork();
    if(ui.part==='body'){
      if(art.size!==ui.draft.size){const previous=ui.draft.size,offset=(art.size-previous)/2;for(const key of ['grip','muzzle']){ui.draft.anchors[key].x=(ui.draft.anchors[key].x*previous+offset)/art.size;ui.draft.anchors[key].y=(ui.draft.anchors[key].y*previous+offset)/art.size;}}
      Object.assign(ui.draft,art);
    }else{ui.draft.projectileSize=art.size;ui.draft.projectilePixels=art.pixels;ui.draft.projectileLayers=art.layers;}
  }
  function loadPart(){loadingEditor=true;editor.setAllowedColors(unlocks().colors);editor.loadArtwork(ui.part==='body'?ui.draft:{size:ui.draft.projectileSize,pixels:ui.draft.projectilePixels,layers:ui.draft.projectileLayers},false);loadingEditor=false;workshopView.refresh();}
  function openWorkshop(id){hideDialog();ui.selectedId=id;ui.draft=store.draft(id);ui.part='body';const theme=Forge.LEVELS[run().level].theme;ui.environment=['forest','waterfall'].includes(theme)?theme:'plain';editor.mirror=false;editor.setTool('pencil');setScreen('workshop');$('weaponName').value=ui.draft.name;workshopView.renderOptions();loadPart();audio.setEnvironment(ui.environment);}
  function openArmory(){if(state==='workshop')persistDraft();hideDialog();setScreen('armory');game.state='idle';audio.setEnvironment('plain');armoryView.render();}
  function showDialog(kind,html){dialogKind=kind;returnFocus=document.activeElement;$('modal').innerHTML=html;$('overlay').classList.remove('hidden');const button=$('modal').querySelector('button,input,select');if(button)button.focus();}
  function hideDialog(){const wasOpen=!$('overlay').classList.contains('hidden');$('overlay').classList.add('hidden');dialogKind='';if(wasOpen&&returnFocus?.isConnected)returnFocus.focus();}
  function confirmAction(title,message,action){showDialog('confirm',`<h2 id="modalTitle">${title}</h2><p>${message}</p><div class="modal-actions"><button id="confirmAction" class="primary-button">确定</button><button id="cancelAction" class="secondary-button">取消</button></div>`);$('confirmAction').onclick=()=>{hideDialog();action();};$('cancelAction').onclick=hideDialog;}
  function exportArt(art){const canvas=document.createElement('canvas');canvas.width=canvas.height=art.size*24;thumbRaw(canvas,art);const link=document.createElement('a');link.download=art.name+'.png';link.href=canvas.toDataURL('image/png');link.click();audio.play('export');toast('原画已导出为透明 PNG');}
  function launchStage(){
    if(run().rewardPending){showReward();return;}if(run().complete)store.newJourney();
    const loadout=store.loadout();if(loadout.some(w=>!w.pixels.some(Boolean))){toast('出战武器是空白，请先编辑武器');return;}
    hideDialog();setScreen('battle');run().active=true;store.save();game.setLoadout(loadout);game.start(run().level,run().upgrades);renderer.setArtwork(game.equipment);lastSlot=-1;renderBattleLoadout();
    const stage=Forge.LEVELS[run().level],number=String(run().level+1).padStart(2,'0');$('levelNumber').textContent='第 '+number+' 关 / 共 10 关';$('levelName').textContent=stage.name;$('introNumber').textContent='第 '+number+' 关';$('introName').textContent=stage.name;$('introHint').textContent=stage.intro;
    $('battleMessage').textContent=loadout.length>1?stage.hint:stage.hint.replace('Q 切换备用武器。','');$('bossHud').classList.toggle('hidden',!stage.enemies.some(type=>Forge.ENEMIES[type].boss));$('bossName').textContent=stage.name;$('bossFill').style.width='100%';audio.setEnvironment(stage.theme);audio.play('choose');
    document.querySelector('.keyboard-hint').innerHTML='<kbd>W A S D</kbd> 移动 <span>·</span> <kbd>空格</kbd> 闪避'+(loadout.length>1?' <span>·</span> <kbd>Q</kbd> 换武器':'');
    if(run().level===1){$('introHint').textContent='点击地面移动，点击「闪避」躲开敌人。';$('battleMessage').textContent='靠近自动攻击 · 点击闪避躲开敌人';}
    $('gameCanvas').setAttribute('aria-label','战场：点击地面或WASD移动，空格闪避'+(loadout.length>1?'，Q换武器':''));
  }
  function renderBattleLoadout(){
    $('battleWeaponName').textContent=game.equipment.name;lastSlot=game.activeSlot;$('battleLoadout').innerHTML='';game.loadout.forEach((work,index)=>{const b=document.createElement('button');b.className='battle-weapon'+(index===game.activeSlot?' active':'');b.setAttribute('aria-label',work.name+(index===game.activeSlot?'，正在使用':'，切换使用'));b.append(canvasThumb(work,64));const label=document.createElement('span');label.textContent=Forge.WEAPONS[work.mode].name;b.append(label);b.onclick=()=>{if(index!==game.activeSlot)game.switchWeapon();};$('battleLoadout').append(b);});$('switchButton').classList.toggle('hidden',game.loadout.length<2);
  }
  function finishStage(){
    const change=store.clearStage(run().level);run().lastUnlock=unlockSummary(change.from,change.to);run().unlockNoticePending=!!run().lastUnlock;run().unlockFrom=change.from;run().unlockTo=change.to;$('workshopLevel').textContent='工坊 '+level()+' 级';audio.setEnvironment('plain');audio.setPaused(false);audio.play('clear');
    if(Forge.isFinalLevel(run().level)){run().complete=true;run().active=false;store.save();showVictory();return;}
    run().rewardPending=true;run().choices=Forge.upgradeChoices(run().upgrades,store.loadout()).map(choice=>choice.id);store.save();showReward();
  }
  function showReward(){
    if(run().unlockNoticePending){showUnlockNotice();return;}
    state='reward';audio.setEnvironment('plain');audio.setPaused(false);const r=run();showDialog('reward',`<span class="eyebrow">第 ${r.level+1} 关完成 ✓</span><h2 id="modalTitle">选一份强化</h2><p>本轮一直生效 · 选好后换装出发</p><div id="rewardChoices" class="reward-grid"></div>`);
    for(const id of r.choices){const choice=Forge.UPGRADES.find(c=>c.id===id),b=document.createElement('button');b.className='reward-card';const canvas=document.createElement('canvas');canvas.width=48;canvas.height=64;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(Forge.Sprites.vial(choice.color),0,0,48,64);b.append(canvas);const name=document.createElement('strong');name.textContent=choice.name;const small=document.createElement('small');small.textContent=choice.description;b.append(name,small);b.onclick=()=>{r.upgrades.push(id);r.level++;r.active=false;r.rewardPending=false;r.choices=[];store.save();audio.setPaused(false);audio.play('upgrade');showCheckpoint();};$('rewardChoices').append(b);}
    $('rewardChoices').querySelector('button').focus();
  }
  function showUnlockNotice(){
    state='reward';audio.setEnvironment('plain');audio.setPaused(false);
    const r=run(),from=Forge.unlocks(r.unlockFrom),to=Forge.unlocks(r.unlockTo),colors=to.colors.filter(id=>!from.colors.includes(id)),modes=to.modes.filter(mode=>!from.modes.includes(mode));
    const title=modes.length?'新武器已解锁':colors.length?'找回了新的颜色':'工坊有了新工具';
    const list=[...modes.map(mode=>'<li><strong>'+Forge.WEAPONS[mode].name+'</strong><span>'+Forge.WEAPONS[mode].description+'</span></li>'),...colors.map(id=>'<li><i class="unlock-color" style="background:'+Forge.PALETTE[id].hex+'"></i><strong>'+Forge.PALETTE[id].name+'颜料</strong><span>'+(Forge.PALETTE[id].element==='neutral'?'装饰色，不计元素比例':Forge.ELEMENTS[Forge.PALETTE[id].element].name+'属性')+'</span></li>')];
    if(to.size>from.size)list.push('<li><strong>'+to.size+' × '+to.size+'画布</strong><span>可在工坊扩展，保留已有图案</span></li>');
    if(from.slots<to.slots)list.push('<li><strong>备用武器</strong><span>可携带两件作品，在战斗中切换</span></li>');
    if(r.unlockFrom<3&&r.unlockTo>=3)list.push('<li><strong>装饰图层与镜像</strong><span>给作品添上更多细节</span></li>');
    if(r.unlockFrom<5&&r.unlockTo>=5)list.push('<li><strong>选区与批量改色</strong><span>一次修改多个像素</span></li>');
    showDialog('unlock','<span class="eyebrow">第 '+(r.level+1)+' 关完成</span><h2 id="modalTitle">'+title+'</h2><ul class="unlock-list">'+list.join('')+'</ul><p>已加入工坊，可以随时使用。</p><div class="modal-actions"><button id="acceptUnlock" class="primary-button">收下，继续 →</button></div>');
    audio.play('unlock');$('acceptUnlock').onclick=()=>{r.unlockNoticePending=false;store.save();showReward();};
  }
  function showCheckpoint(){run().active=false;store.save();ui.selectedId=store.data.loadout[0];openArmory();}
  function showDeath(){state='dead';audio.setEnvironment('plain');audio.setPaused(false);audio.play('lose');showDialog('dead','<h2 id="modalTitle">再试一次？</h2><p>武器与强化已保留。</p><div class="modal-actions"><button id="retryStage" class="primary-button">原装备重试</button><button id="deathArmory" class="secondary-button">换把武器</button></div>');$('retryStage').onclick=launchStage;$('deathArmory').onclick=openArmory;}
  function pause(){if(state!=='battle')return;state='paused';battleDestination=null;keys.clear();releaseStick();audio.setPaused(true);showPauseDialog();}
  function showPauseDialog(){showDialog('pause','<h2 id="modalTitle">游戏已暂停</h2><p>回武器库后会保留强化与进度，再次挑战从本关开头开始。</p><div class="modal-actions"><button id="resumeStage" class="primary-button">继续战斗</button><button id="pauseArmory" class="secondary-button">回武器库</button></div>');$('resumeStage').onclick=resume;$('pauseArmory').onclick=openArmory;}
  function resume(){hideDialog();state='battle';audio.setPaused(false);}
  function showVictory(){state='victory';audio.setEnvironment('plain');audio.setPaused(false);showDialog('victory',`<h2 id="modalTitle">全部10关完成</h2><p>你的武器和工坊解锁已保留，可以继续编辑或重新挑战。</p><div id="victoryGallery" class="victory-gallery"></div><p class="subtle">点击武器图片可导出 PNG。</p><div class="modal-actions"><button id="victoryArmory" class="primary-button">返回武器库</button><button id="victoryRestart" class="secondary-button">重新开始10关</button></div>`);for(const work of store.loadout()){const b=document.createElement('button');b.className='victory-art';b.append(canvasThumb(work,192));const label=document.createElement('span');label.textContent=work.name;b.append(label);b.onclick=()=>exportArt(work);$('victoryGallery').append(b);}$('victoryArmory').onclick=openArmory;$('victoryRestart').onclick=()=>{store.newJourney();openArmory();};}
  function help(){
    const resumeAfterHelp=state==='battle',returnToPause=state==='paused';
    if(resumeAfterHelp)pause();showDialog('help','<h2 id="modalTitle">操作说明</h2><ol class="help-list"><li>每关结束都能换武器，点击卡片立即装备。4级解锁的备用槽，用于战斗中切换。编辑后点“保存武器”更新作品。</li><li>攻击类型决定打法；工艺调整节奏。武器长宽、面积与画布大小都不影响攻击属性。</li><li>火造成灼烧，冰让敌人减速，电向另一名敌人跳跃。两种元素各占 25% 可激活选定配方；黑白棕和透明不计比例。</li><li>草火蔓延后留下短暂余烬，持续灼伤敌人；冷却焦土安全。水雾增强电弧、削弱灼烧。</li><li>WASD / 方向键移动，空格闪避，Q 换武器。手机使用摇杆和按钮。攻击会自动瞄准。</li><li>首次通关提升工坊等级，逐步解锁画布、颜料和武器类型。重复刷关不会重复提升等级。</li></ol><label class="volume-label">声音音量 <input id="volumeControl" type="range" min="0" max="1" step="0.05"></label><div class="modal-actions"><button id="closeHelp" class="primary-button">明白了</button></div>');$('volumeControl').value=audio.volume;$('volumeControl').oninput=()=>audio.setVolume(Number($('volumeControl').value));$('closeHelp').onclick=()=>{hideDialog();if(resumeAfterHelp)resume();else if(returnToPause)showPauseDialog();};
  }

  $('navArmory').onclick=openArmory;$('navWorkshop').onclick=()=>openWorkshop(ui.selectedId);$('backToArmory').onclick=openArmory;
  $('pauseButton').onclick=pause;$('switchButton').onclick=()=>game.switchWeapon();$('dashButton').onclick=()=>game.dash();$('helpButton').onclick=help;
  $('soundButton').onclick=()=>{const on=audio.toggle();$('soundButton').setAttribute('aria-pressed',on);$('soundButton').setAttribute('aria-label',on?'关闭声音':'开启声音');$('soundButton').textContent=on?'音效开':'音效关';};
  $('sessionTools').classList.toggle('testing',testMode);$('testLabel').classList.toggle('hidden',!testMode);$('returnSaveButton').classList.toggle('hidden',!testMode);$('freshTestButton').textContent=testMode?'重新测试':'从1级测试';
  $('freshTestButton').onclick=()=>{const url=new URL(location.href);url.searchParams.set('test','1');url.searchParams.set('reset','1');location.assign(url);};
  $('returnSaveButton').onclick=()=>{const url=new URL(location.href);url.searchParams.delete('test');url.searchParams.delete('reset');location.assign(url);};
  document.querySelector('.brand').href=testMode?'./?test=1':'./';
  $('newJourneyButton').textContent='重玩关卡（保留解锁）';
  document.addEventListener('pointerdown',()=>audio.unlock(),{once:true});document.addEventListener('keydown',()=>audio.unlock(),{once:true});
  function releaseStick(){stick={x:0,y:0};$('joystickStick').style.transform='translate(0,0)';}
  function moveStick(event){const rect=$('joystick').getBoundingClientRect(),x=event.clientX-rect.left-rect.width/2,y=event.clientY-rect.top-rect.height/2,length=Math.hypot(x,y),radius=rect.width*.3,scale=length>radius?radius/length:1;stick={x:x*scale/radius,y:y*scale/radius};$('joystickStick').style.transform=`translate(${x*scale}px,${y*scale}px)`;}
  $('joystick').onpointerdown=event=>{$('joystick').setPointerCapture(event.pointerId);moveStick(event);};$('joystick').onpointermove=event=>{if($('joystick').hasPointerCapture(event.pointerId))moveStick(event);};$('joystick').onpointerup=$('joystick').onpointercancel=$('joystick').onlostpointercapture=releaseStick;
  $('gameCanvas').onpointerdown=event=>{if(state!=='battle')return;const box=event.currentTarget.getBoundingClientRect();battleDestination={x:(event.clientX-box.left)/box.width*960,y:(event.clientY-box.top)/box.height*600};};
  document.addEventListener('keydown',event=>{
    if(! $('overlay').classList.contains('hidden')){
      if(event.key==='Tab'){const focusable=[...$('modal').querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')],first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
      if(event.key==='Escape'){if(dialogKind==='pause')resume();else if(dialogKind==='help')$('closeHelp').click();else if(['confirm','new','replace'].includes(dialogKind))hideDialog();}return;
    }
    if(['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)||event.target===$('paintCanvas'))return;
    const key=event.key.toLowerCase();if(state==='battle'){
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','q','escape'].includes(key))event.preventDefault();keys.add(key);if(!event.repeat&&key===' ')game.dash();if(!event.repeat&&key==='q')game.switchWeapon();if(key==='escape')pause();
    }else if(state==='workshop'){
      workshopView.handleShortcut(event);
    }
  });
  document.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();audio.setPaused(true);if(ui.draft)persistDraft();}else audio.setPaused(state==='paused'||(state==='onboarding'&&onboarding.paused));});window.addEventListener('pagehide',()=>{audio.setPaused(true);if(ui.draft)persistDraft();});
  let previous=performance.now();function frame(now){const dt=Math.min((now-previous)/1000,.04);previous=now;
    if(state==='battle'){
      game.input={x:stick.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),y:stick.y+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)};
      if(game.input.x||game.input.y)battleDestination=null;
      if(battleDestination){const x=battleDestination.x-game.player.x,y=battleDestination.y-game.player.y,length=Math.hypot(x,y);if(length<5)battleDestination=null;else game.input={x:x/length,y:y/length};}
      game.moveTarget=battleDestination;game.update(dt);
      const p=game.player;$('healthFill').style.width=Math.max(0,p.hp/p.maxHp)*100+'%';$('healthText').textContent=Math.ceil(Math.max(0,p.hp))+' / '+p.maxHp;$('killCounter').textContent='击败 '+game.kills+' · 剩余 '+(game.enemies.length+game.level.enemies.length-game.spawnIndex);
      $('chapterIntro').classList.toggle('show',game.introTime>0);$('dashButton').disabled=p.dashCooldown>0;$('dashState').textContent=p.dashCooldown>0?p.dashCooldown.toFixed(1)+'s':'空格';$('dashCooldown').style.transform='scaleY('+p.dashCooldown/game.stats().dashCooldown+')';$('switchButton').disabled=game.switchCooldown>0;$('switchState').textContent=game.switchCooldown>0?game.switchCooldown.toFixed(1)+'s':'Q';
      const boss=game.enemies.find(e=>e.boss);if(boss)$('bossFill').style.width=Math.max(0,boss.hp/boss.maxHp)*100+'%';if(lastSlot!==game.activeSlot)renderBattleLoadout();renderer.draw();
    }else if(state==='workshop'){preview.update(dt);previewRenderer.draw();}else if(state==='onboarding')onboarding.update(dt);
    requestAnimationFrame(frame);
  }
  Forge.app={editor,game,preview,store,audio,onboarding,get state(){return state;},get draft(){return ui.draft;}};
  armoryView.render();audio.setEnvironment('plain');requestAnimationFrame(frame);
  if(store.migrated)toast('旧作品已保留，并开放对应的 16 × 16 工坊');
  if(!store.data.onboarding.complete)onboarding.open();
  else{setScreen('armory');if(run().rewardPending)showReward();}
})();
