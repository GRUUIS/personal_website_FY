'use strict';

Forge.UI = (() => {
  const $ = id => document.getElementById(id);
  const symbols = {slash:'✦',throw:'✧',shoot:'➶',spear:'↟',hammer:'▣'};
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const percent = value => (Math.floor(value * 1000) / 10) + '%';

  function thumb(canvas,art){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;const img=Forge.artImage(art.pixels,art.size);const margin=canvas.width*.1;ctx.drawImage(img,margin,margin,canvas.width-margin*2,canvas.height-margin*2);}

  function canvasThumb(art,size=80){const canvas=document.createElement('canvas');canvas.width=canvas.height=size;thumb(canvas,art);return canvas;}

  function recipeHTML(recipe){return Object.entries(Forge.ELEMENTS).filter(([key])=>recipe[key]>0).map(([key,e])=>`<span><i class="effect-dot" style="--dot:${e.color}"></i>${e.name} ${percent(recipe[key])}</span>`).join('')||'<span>无元素效果 · 物理攻击</span>';}

  function formulaText(art){const recipe=Forge.recipe(art.pixels),formula=Forge.FORMULAS[art.formula];return !formula?'未选择附加效果':formula.name+(Forge.formulaActive(art.formula,recipe)?' · 已激活':' · 比例不足');}

  function thumbRaw(canvas,art){const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(Forge.artImage(art.pixels,art.size),0,0,canvas.width,canvas.height);}

  function unlockSummary(from,to){const a=Forge.unlocks(from),b=Forge.unlocks(to),parts=[];if(b.size>a.size)parts.push(`${b.size} × ${b.size} 画布`);const newColors=b.colors.filter(c=>!a.colors.includes(c));if(newColors.length)parts.push(newColors.map(c=>Forge.PALETTE[c].name).join(' / ')+'颜料');for(const mode of b.modes.filter(m=>!a.modes.includes(m)))parts.push(Forge.WEAPONS[mode].name);if(a.slots<b.slots)parts.push('备用武器与战斗换装');if(from<3&&to>=3)parts.push('装饰图层与镜像');if(from<5&&to>=5)parts.push('选区与批量改色');return parts.join('、');}

  return {$, symbols, escape, percent, thumb, canvasThumb, recipeHTML, formulaText, thumbRaw, unlockSummary};
})();
