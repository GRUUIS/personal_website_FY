'use strict';

Forge.createWorkshopView = ({store, ui, editor, preview, previewRenderer, audio, run, actions}) => {
  const {$, canvasThumb, percent} = Forge.UI;
  const level = () => store.data.level;
  const unlocks = () => Forge.unlocks(level());

  function renderWorkshopOptions(){
    $('weaponType').innerHTML=Object.entries(Forge.WEAPONS).filter(([key,w])=>w.unlock<=level()||key===ui.draft.mode).map(([key,w])=>`<option value="${key}">${w.name}</option>`).join('');
    $('craftSelect').innerHTML=Object.entries(Forge.CRAFTS).map(([key,c])=>`<option value="${key}">${c.name}</option>`).join('');
    const formulas=Object.entries(Forge.FORMULAS).filter(([,f])=>f.elements.every(el=>unlocks().colors.some(c=>Forge.PALETTE[c].element===el)));
    $('formulaSelect').innerHTML='<option value="">无附加配方</option>'+formulas.map(([key,f])=>`<option value="${key}">${f.name} · ${f.elements.map(el=>Forge.ELEMENTS[el].name).join('+')}</option>`).join('');
    $('formulaSelect').parentElement.classList.toggle('hidden',!formulas.length);$('formulaStatus').classList.toggle('hidden',!formulas.length);
    document.querySelector('.formula-panel h3').textContent='元素配比';
    $('palette').innerHTML='';document.querySelector('.palette-note').textContent='选颜色，画出元素效果';
    for(const group of [{name:'火 · 灼烧',ids:[4,5,6]},{name:'冰 · 减速',ids:[7,8,9]},{name:'电 · 电弧',ids:[10,11,12]},{name:'装饰色',ids:[1,2,3]}]){
      const colors=group.ids.filter(id=>unlocks().colors.includes(id));if(!colors.length)continue;
      const div=document.createElement('div');div.className='palette-group';div.innerHTML='<span>'+group.name+'</span><div class="palette-colors"></div>';
      for(const id of colors){const c=Forge.PALETTE[id],b=document.createElement('button');b.className='swatch';b.dataset.color=id;b.style.setProperty('--swatch',c.hex);b.setAttribute('aria-label',c.name);b.title=c.name;b.onclick=()=>{editor.setColor(id);if(['eraser','picker'].includes(editor.tool))editor.setTool('pencil');refreshPaintTools();audio.play('paint');};div.lastElementChild.append(b);}$('palette').append(div);
    }
    for(const b of document.querySelectorAll('[data-unlock]')){b.disabled=level()<Number(b.dataset.unlock);b.classList.toggle('hidden',b.disabled);if(b.dataset.tool==='select')b.setAttribute('aria-label','框选');}
    $('mirrorButton').disabled=level()<3;$('mirrorButton').classList.toggle('hidden',level()<3);$('mirrorButton').setAttribute('aria-label','左右镜像');
    $('decorLayer').disabled=level()<3;$('decorLayer').textContent='装饰';$('decorLayer').parentElement.classList.toggle('hidden',level()<3);
    $('replaceButton').disabled=level()<5;$('replaceButton').classList.toggle('hidden',level()<5);$('fillSelectionButton').classList.toggle('hidden',level()<5);
    for(const b of document.querySelectorAll('[data-environment]')){b.disabled=(b.dataset.environment==='forest'&&level()<2)||(b.dataset.environment==='waterfall'&&level()<4);b.classList.toggle('hidden',b.disabled);}
    $('trialTabs').classList.toggle('hidden',level()<2);$('saveEquipButton').textContent='保存武器 →';
    document.querySelector('.anchor-panel').classList.toggle('hidden',level()<3);
    renderPresets();
  }

  function renderPresets(){
    const {draft} = ui;
    $('presets').innerHTML='';for(const preset of Forge.PRESETS.filter(p=>p.unlock<=level()&&p.mode===draft.mode)){const b=document.createElement('button');b.className='preset';b.title=preset.name;b.setAttribute('aria-label','使用'+preset.name+'底稿');b.append(canvasThumb({size:preset.size,pixels:Forge.presetPixels(preset)},48));b.onclick=()=>{if(ui.part!=='body'){ui.part='body';actions.loadPart();}const target=Math.max(draft.size,preset.size),pixels=Array(target*target).fill(0),source=Forge.presetPixels(preset),offset=(target-preset.size)/2;source.forEach((p,i)=>pixels[(Math.floor(i/preset.size)+offset)*target+i%preset.size+offset]=p);editor.setPixels(pixels);actions.toast('已使用参考图，可以撤销');};$('presets').append(b);}
  }

  function refreshPaintTools(){
    const {draft, part} = ui;
    if(!draft)return;for(const b of document.querySelectorAll('[data-tool]')){const active=editor.tool===b.dataset.tool;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active);}
    for(const b of document.querySelectorAll('.swatch')){const active=Number(b.dataset.color)===editor.color;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active);}
    $('mirrorButton').classList.toggle('selected',editor.mirror);$('mirrorButton').setAttribute('aria-pressed',editor.mirror);
    $('baseLayer').classList.toggle('selected',editor.activeLayer===0);$('decorLayer').classList.toggle('selected',editor.activeLayer===1);
    $('undoButton').disabled=!editor.history.length;$('redoButton').disabled=!editor.future.length;$('fillSelectionButton').disabled=level()<5||!editor.selection;
    $('zoomValue').textContent=editor.zoom.toFixed(editor.zoom%1?1:0)+'×';$('canvasSize').textContent=editor.size+' × '+editor.size;
    $('expandButton').disabled=editor.size>=unlocks().size;$('expandButton').classList.toggle('hidden',$('expandButton').disabled);$('expandButton').textContent='扩至 '+unlocks().size+' × '+unlocks().size;
    const names={pencil:'画笔',eraser:'橡皮',fill:'填色',picker:'吸色',select:'框选',pan:'平移'};$('paintStatus').textContent=names[editor.tool]+' · '+Forge.PALETTE[editor.color].name+(part==='projectile'?' · 弹丸仅改变外观':'');
  }

  function refreshWorkshop(){
    const {draft, part, environment} = ui;
    preview.upgrades=run().upgrades.slice();preview.equip(draft);preview.setPreview(environment);
    refreshPaintTools();$('workshopLevel').textContent='工坊 '+level()+' 级';$('weaponType').value=draft.mode;$('craftSelect').value=draft.craft;$('formulaSelect').value=draft.formula;
    $('bodyTab').classList.toggle('selected',part==='body');$('projectileTab').classList.toggle('selected',part==='projectile');$('projectileTab').classList.toggle('hidden',draft.mode!=='shoot');$('bodyTab').parentElement.classList.toggle('hidden',draft.mode!=='shoot');$('bodyTab').closest('.art-tabs').classList.toggle('hidden',draft.mode!=='shoot'&&level()<3);
    const craftTraits={balanced:['均衡输出'],swift:['出手更快','伤害 −20%'],wide:['范围 +20%','伤害 −10%','出手稍慢']};
    $('craftHint').innerHTML=craftTraits[draft.craft].map((text,index)=>`<span class="craft-trait${index?' tradeoff':''}">${text}</span>`).join('');
    $('craftHint').title=Forge.CRAFTS[draft.craft].description+(preview.upgrades.length?'；预览已计入本轮强化':'');
    const stats=preview.stats();$('statRange').textContent=(draft.mode==='hammer'?'最多 ':'')+Math.round(stats.reach)+' px';
    $('statCoverage').textContent=({slash:Math.round(stats.slashArc*180/Math.PI)+'° 扇面',throw:'直径 '+Math.round(stats.throwRadius*2),shoot:'直径 '+Math.round(stats.bulletRadius*2),spear:'宽 '+Math.round(stats.spearWidth),hammer:'半径 '+Math.round(stats.hammerRadius)})[draft.mode];$('statSpeed').textContent=(1/stats.interval).toFixed(2)+' 次/秒';
    const recipe=Forge.recipe(draft.pixels);
    for(const key of Object.keys(Forge.ELEMENTS))$(key+'Bar').style.width=recipe[key]*100+'%';
    const effects={fire:'灼烧',ice:'减速',electric:'电弧'};
    const availableElements=Object.entries(Forge.ELEMENTS).filter(([key])=>unlocks().colors.some(id=>Forge.PALETTE[id].element===key));
    $('recipeLabels').innerHTML=availableElements.map(([key,element])=>`<span class="recipe-chip${recipe[key]?'':' empty'}" style="--element:${element.color}"><span class="recipe-chip-name"><i class="effect-dot" style="--dot:${element.color}"></i>${element.name}<small>${effects[key]}</small></span><strong>${percent(recipe[key])}</strong></span>`).join('');
    $('recipeLabels').setAttribute('aria-label',availableElements.map(([key,element])=>element.name+' '+percent(recipe[key])).join('，'));
    const formula=Forge.FORMULAS[draft.formula],active=formula&&Forge.formulaActive(draft.formula,recipe);$('formulaStatus').classList.toggle('inactive',!!formula&&!active);
    if(!formula){
      $('formulaStatus').innerHTML='<span class="formula-tip">混色奖励：两种元素各 ≥ 25%</span>';
      $('formulaStatus').removeAttribute('title');
    }else{
      const effect={emberwire:'电弧附带半强度灼烧',frostwire:'电弧附带半强度减速',thermal:'裂纹 2 秒 · 后续伤害 +10%'}[draft.formula];
      $('formulaStatus').innerHTML=`<div class="formula-state"><strong>${active?'✓ 配方生效':'补足配比即可生效'}</strong><div class="formula-requirements">${formula.elements.map(el=>`<span class="formula-requirement${recipe[el]>=.25?' met':''}" style="--element:${Forge.ELEMENTS[el].color}">${Forge.ELEMENTS[el].name} <b>${percent(recipe[el])}</b><small> / 25%</small></span>`).join('')}</div></div><span class="formula-effect">${effect}</span>`;
      $('formulaStatus').title=formula.description;
    }
    for(const b of document.querySelectorAll('[data-environment]'))b.classList.toggle('selected',b.dataset.environment===environment);
    $('saveEquipButton').disabled=!draft.pixels.some(Boolean);$('tryButton').disabled=!draft.pixels.some(Boolean);
    previewRenderer.setArtwork(preview.equipment);drawAnchors();
  }

  function drawAnchors(){
    const {draft, anchor} = ui;
    const canvas=$('anchorCanvas'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,160,160);ctx.imageSmoothingEnabled=false;ctx.drawImage(Forge.artImage(draft.pixels,draft.size),0,0,160,160);
    for(const [key,color] of [['grip','#98e8bc'],['muzzle','#f5c95b']]){const a=draft.anchors[key],x=a.x*160,y=a.y*160;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(x-5,y-5,10,10);ctx.beginPath();ctx.moveTo(x-9,y);ctx.lineTo(x+9,y);ctx.moveTo(x,y-9);ctx.lineTo(x,y+9);ctx.stroke();}
    $('gripAnchor').classList.toggle('selected',anchor==='grip');$('muzzleAnchor').classList.toggle('selected',anchor==='muzzle');
  }

  function showReplace(){
    const options=unlocks().colors.map(id=>`<option value="${id}">${Forge.PALETTE[id].name}</option>`).join('');actions.showDialog('replace',`<h2 id="modalTitle">批量换色</h2><p>调整当前图层的颜料，配方会随可见颜色更新。</p><div class="replace-controls"><label>原颜色<select id="replaceFrom">${options}</select></label><label>新颜色<select id="replaceTo">${options}</select></label></div><label class="checkbox-line"><input type="checkbox" id="replaceSelection" ${editor.selection?'checked':'disabled'}> 仅替换选区</label><div class="modal-actions"><button id="applyReplace" class="primary-button">替换颜色</button><button id="cancelReplace" class="secondary-button">取消</button></div>`);$('replaceFrom').value=editor.color;$('replaceTo').value=unlocks().colors.find(c=>c!==editor.color);$('applyReplace').onclick=()=>{editor.replaceColor(Number($('replaceFrom').value),Number($('replaceTo').value),$('replaceSelection').checked);actions.hideDialog();actions.toast('颜色已替换，可以撤销');};$('cancelReplace').onclick=actions.hideDialog;
  }

  $('weaponName').oninput = () => {
    ui.draft.name = $('weaponName').value.trim() || '未命名武器';
    actions.saveDraft();
  };
  $('weaponType').onchange = () => {
    ui.draft.mode = $('weaponType').value;
    if (ui.draft.mode !== 'shoot' && ui.part === 'projectile') {
      ui.part = 'body';
      actions.loadPart();
    }
    actions.saveDraft();
    renderPresets();
    refreshWorkshop();
  };
  $('craftSelect').onchange = () => {
    ui.draft.craft = $('craftSelect').value;
    actions.saveDraft();
    refreshWorkshop();
  };
  $('formulaSelect').onchange = () => {
    ui.draft.formula = $('formulaSelect').value;
    actions.saveDraft();
    refreshWorkshop();
  };
  $('bodyTab').onclick = () => switchPart('body');
  $('projectileTab').onclick = () => switchPart('projectile');
  function switchPart(part) {
    if (ui.part === part) return;
    ui.part = part;
    actions.loadPart();
  }
  $('baseLayer').onclick = () => { editor.setLayer(0); refreshPaintTools(); };
  $('decorLayer').onclick = () => { editor.setLayer(1); refreshPaintTools(); };
  document.querySelectorAll('[data-tool]').forEach(button => {
    button.onclick = () => { editor.setTool(button.dataset.tool); refreshPaintTools(); };
  });
  $('mirrorButton').onclick = () => {
    editor.mirror = !editor.mirror;
    refreshPaintTools();
    editor.render();
  };
  $('undoButton').onclick = () => editor.undo();
  $('redoButton').onclick = () => editor.redo();
  $('expandButton').onclick = () => {
    editor.expandCanvas(unlocks().size);
    actions.toast('画布已扩大，原有像素保持不变');
  };
  $('zoomOut').onclick = () => { editor.setZoom(editor.zoom - 0.5); refreshPaintTools(); };
  $('zoomIn').onclick = () => { editor.setZoom(editor.zoom + 0.5); refreshPaintTools(); };
  $('fillSelectionButton').onclick = () => editor.fillSelection(editor.color);
  $('replaceButton').onclick = showReplace;
  $('clearButton').onclick = $('blankButton').onclick = () => {
    editor.setPixels(Array(editor.size * editor.size).fill(0));
    actions.toast('画稿已清空，可以撤销');
  };
  $('paintCanvas').addEventListener('keydown', () => queueMicrotask(refreshPaintTools));
  $('paintCanvas').addEventListener('pointerup', refreshPaintTools);
  $('paintCanvas').addEventListener('wheel', () => queueMicrotask(refreshPaintTools));
  document.querySelectorAll('[data-environment]').forEach(button => {
    button.onclick = () => {
      ui.environment = button.dataset.environment;
      refreshWorkshop();
      audio.setEnvironment(ui.environment);
    };
  });
  $('tryButton').onclick = () => { preview.tryWeapon(); audio.play('choose'); };
  $('gripAnchor').onclick = () => { ui.anchor = 'grip'; drawAnchors(); };
  $('muzzleAnchor').onclick = () => { ui.anchor = 'muzzle'; drawAnchors(); };
  $('anchorCanvas').onpointerdown = event => {
    const rect = $('anchorCanvas').getBoundingClientRect();
    ui.draft.anchors[ui.anchor] = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };
    actions.saveDraft();
    refreshWorkshop();
  };
  $('resetAnchors').onclick = () => {
    ui.draft.anchors = {grip: {x: 0.25, y: 0.75}, muzzle: {x: 0.8, y: 0.2}};
    actions.saveDraft();
    refreshWorkshop();
  };
  $('saveEquipButton').onclick = actions.commit;

  function handleShortcut(event) {
    const key = event.key.toLowerCase();
    if (((event.ctrlKey || event.metaKey) && ['z', 'y'].includes(key)) ||
        (!event.ctrlKey && !event.metaKey && ['b', 'e', 'g', 'i', 'h'].includes(key))) {
      editor.key(event);
      refreshPaintTools();
    }
  }

  return {renderOptions: renderWorkshopOptions, refresh: refreshWorkshop, refreshTools: refreshPaintTools, handleShortcut};
};
