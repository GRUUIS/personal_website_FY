'use strict';
Forge.pixelImage = function(rows,colors){const canvas=document.createElement('canvas');canvas.width=rows[0].length;canvas.height=rows.length;const c=canvas.getContext('2d');for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++){const color=colors[rows[y][x]];if(color){c.fillStyle=color;c.fillRect(x,y,1,1);}}return canvas;};
Forge.artImage = function(pixels,size=Math.sqrt(pixels.length),crop=false){
  if(typeof size==='boolean'){crop=size;size=Math.sqrt(pixels.length);}
  let left=0,top=0,right=size-1,bottom=size-1;
  if(crop&&pixels.some(Boolean)){
    left=size;top=size;right=0;bottom=0;
    for(let i=0;i<pixels.length;i++)if(pixels[i]){const x=i%size,y=Math.floor(i/size);left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  }
  const canvas=document.createElement('canvas');canvas.width=right-left+1;canvas.height=bottom-top+1;const c=canvas.getContext('2d');
  for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const v=pixels[y*size+x];if(v){c.fillStyle=Forge.PALETTE[v].hex;c.fillRect(x-left,y-top,1,1);}}
  canvas.artBounds={left,top,width:canvas.width,height:canvas.height,size};
  return canvas;
};
Forge.Sprites = {
  init(){
    this.player=Forge.pixelImage([
      '......1111......','.....133331.....','....13333331....','...1334443331...','..133444443331..','.11113333311111.','....12222221....','....12122121....','....12222221....','.....122221.....','....15555551....','...1533333351...','..123344443321..','..123344443321..','...1333443331...','...1333333331...','....16611661....','....16611661....','...1111..1111...'
    ],{'1':'#112434','2':'#f1d3a8','3':'#4c9d8f','4':'#93e4bb','5':'#efb668','6':'#334659'});
    this.slime=Forge.pixelImage(['..............','.....1111.....','...11222211...','..1233333221..','.123333333321.','.122333333221.','12323223233221','12321221233221','12222222222221','.122244422221.','.122222222221.','..1122222211..','...11111111...'],{'1':'#282844','2':'#8265ba','3':'#b59adf','4':'#4e386c'});
    this.bit=Forge.pixelImage(['...11111...','..1233321..','.123333321.','12232323221','12212121221','12222222221','.122222221.','..1111111..'],{'1':'#27324d','2':'#7a80c4','3':'#c0c8ed'});
    this.runner=Forge.pixelImage(['..11......11..','.1221....1221.','.123111111321.','.123333333321.','12333333333321','12221222212221','12221222212221','.122222222221.','..1224444221..','..1222222221..','...11222211...','..1221111221..','..111....111..'],{'1':'#3c2939','2':'#ce775e','3':'#ffc28a','4':'#642f42'});
    this.shooter=Forge.pixelImage(['.....1111.....','....122221....','...12333321...','..1233333321..','.123333333321.','11122222222111','...14555441...','...14515441...','...14555441...','....144441....','...12666221...','..1266666221..','.122666662221.','.111111111111.'],{'1':'#32283e','2':'#ac688e','3':'#eea2b8','4':'#724e69','5':'#eac3a6','6':'#684770'});
    this.dummy=Forge.pixelImage(['.....1111.....','....133331....','...13222331...','...13222331...','....133331....','.....1111.....','..1113333111..','.133333333331.','.111133331111.','.....1331.....','.....1331.....','....133331....','...11111111...'],{'1':'#493d32','2':'#e2cb9c','3':'#a4895c'});
    this.spitter=Forge.pixelImage([
      '......1111......','....11222211....','...1233333321...','..123333333321..','.12334444333321.','.12241111433221.','1222415514322221','1222415514322221','.12241111432221.','.12224444332221.','..122222222221..','...1222222221...','..112211112211..','.11111....11111.'
    ],{'1':'#332441','2':'#8f527f','3':'#d496c1','4':'#dec29c','5':'#f7eac7'});
    this.splitter=Forge.pixelImage([
      '..................','.......1111.......','.....11233211.....','...112333333211...','..12333341333321..','.1233334413333321.','.1233344413333321.','123232441233232321','123212441233212321','122222144322222221','.1222214432222221.','.1222214432222221.','..12222413222221..','...112222222211...','....1111111111....'
    ],{'1':'#1e3d47','2':'#458e93','3':'#9bddc3','4':'#173a50'});
    this.boss=Forge.pixelImage([
      '.......111111.......','.....1122222211.....','....123333333321....','...12333333333321...','...12333333333321...','..1123333333333211..','.122222222222222221.','12333221111222333321','12332215555122333321','12332215115122333321','12332215555122333321','12333221111222333321','.122222222222222221.','..1122666666222211..','...12226666222221...','...12222222222221...','....122211122221....','....1221...12221....','...11111...111111...'
    ],{'1':'#374854','2':'#9daeb0','3':'#d7ddd1','5':'#eab37d','6':'#7f6f80'});
    this.inklord=Forge.pixelImage([
      '....11.....11.....11....','....151...1551...151....','....1551111551111551....','.....15555555555551.....','.....11111111111111.....','......123333333321......','.....12333333333321.....','....1233111111113321....','....1231455514551321....','....1231411514111321....','....1231455514551321....','.....12311111111321.....','......122266662221......','.....12226666662221.....','....1222333333332221....','...122334444443332221...','..12233445555443322221..','.1223344556655443322221.','122233445566554433222221','.1222334455554433222221.','..12222334444332222221..','...122222333322222221...','....1122222222222211....','...11111..1111..11111...'
    ],{'1':'#251f3f','2':'#563d78','3':'#9570bd','4':'#c7a2e1','5':'#f7d59c','6':'#f2b3d0'});
  },
  vial(color){return Forge.pixelImage(['....1111....','....1331....','...112211...','...122221...','..12444221..','..14555421..','..14555421..','..14444421..','..14444421..','..14444421..','...144421...','....1111....'],{'1':'#1d3344','2':'#d4e4cf','3':'#a88860','4':Forge.PALETTE[color].hex,'5':'#ffffffb0'});}
};
Forge.Renderer = class {
  constructor(canvas,game,background){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.game=game;this.background=background;
    this.artCache=new WeakMap();this.sceneCache=new Map();this.flashCache=new WeakMap();
    this.reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.setArtwork(Array(64).fill(0),8);
  }
  setArtwork(artwork,size){
    this.artwork=Array.isArray(artwork)?{pixels:artwork,size:size||Math.sqrt(artwork.length),anchors:{grip:{x:.25,y:.75}}}:artwork;
    this.weapon=Forge.artImage(this.artwork.pixels,this.artwork.size||Math.sqrt(this.artwork.pixels.length),true);
    this.artCache.set(this.artwork.pixels,this.weapon);
  }
  imageFor(artwork,projectile=false){
    const pixels=projectile&&artwork.projectilePixels?artwork.projectilePixels:artwork.pixels;
    if(!this.artCache.has(pixels))this.artCache.set(pixels,Forge.artImage(pixels,projectile&&artwork.projectilePixels?artwork.projectileSize||Math.sqrt(pixels.length):artwork.size||Math.sqrt(pixels.length),true));
    return this.artCache.get(pixels);
  }
  flashImage(image){
    if(!this.flashCache.has(image)){
      const flash=document.createElement('canvas');flash.width=image.width;flash.height=image.height;const c=flash.getContext('2d');c.drawImage(image,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#fff6d8';c.fillRect(0,0,flash.width,flash.height);this.flashCache.set(image,flash);
    }
    return this.flashCache.get(image);
  }
  sprite(image,x,y,scale=2,flip=false,alpha=1,bob=0,squash=1){
    const c=this.ctx;c.save();c.globalAlpha=alpha;c.translate(Math.round(x),Math.round(y+bob));c.scale(flip?-1:1,1);
    c.drawImage(image,Math.round(-image.width*scale*squash/2),Math.round(-image.height*scale/squash),image.width*scale*squash,image.height*scale/squash);c.restore();
  }
  weaponAt(x,y,angle,size=48,alpha=1,artwork=this.artwork,pivot='center'){
    const c=this.ctx,img=this.imageFor(artwork),b=img.artBounds,factor=size/Math.max(img.width,img.height);
    let px=img.width/2,py=img.height/2;
    if(pivot==='grip'){
      const grip=artwork.anchors?.grip||{x:.25,y:.75};px=grip.x*b.size-b.left;py=grip.y*b.size-b.top;
    }
    c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;
    c.drawImage(img,-px*factor,-py*factor,img.width*factor,img.height*factor);c.restore();
  }
  muzzleOffset(artwork,angle){
    const image=this.imageFor(artwork),factor=47/Math.max(image.width,image.height),size=image.artBounds.size;
    const grip=artwork.anchors?.grip||{x:.25,y:.75},muzzle=artwork.anchors?.muzzle||{x:.8,y:.2};
    const dx=(muzzle.x-grip.x)*size*factor,dy=(muzzle.y-grip.y)*size*factor,rotation=angle+Math.PI/4;
    return {x:Math.cos(angle)*16+dx*Math.cos(rotation)-dy*Math.sin(rotation),y:-21+Math.sin(angle)*8+dx*Math.sin(rotation)+dy*Math.cos(rotation)};
  }
  scene(theme){
    if(this.sceneCache.has(theme))return this.sceneCache.get(theme);
    const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;const c=canvas.getContext('2d');
    const palettes={plain:['#d7cbb0','#536856','#c3b496','#f4e7c4'],forest:['#79875d','#2c493c','#65794e','#bbc498'],waterfall:['#95ac9c','#344f56','#839a90','#d5e1c6'],cave:['#637275','#253943','#536368','#acb9ab'],forge:['#78665d','#382d35','#68574f','#baa283'],border:['#899080','#34484d','#77806f','#d4d3af']};
    const [floor,edge,grain,light]=palettes[theme]||palettes.plain;
    c.fillStyle=edge;c.fillRect(0,0,960,600);c.fillStyle=floor;c.fillRect(62,73,836,475);
    c.fillRect(78,61,804,498);c.fillStyle=grain;
    for(let i=0;i<330;i++){const x=84+(i*139)%788,y=89+(i*71)%440;c.fillRect(x,y,4+(i%4)*2,2);if(i%5===0)c.fillRect(x+3,y-3,2,3);}
    c.fillStyle=light;c.globalAlpha=.13;for(let i=0;i<18;i++)c.fillRect(86+(i*47)%790,97+(i*67)%420,26,2);c.globalAlpha=1;
    if(theme==='plain'){
      c.fillStyle='#b9a583';for(let y=110;y<540;y+=74){c.fillRect(78,y,804,2);for(let x=120+(y%3)*40;x<870;x+=150)c.fillRect(x,y,2,72);}
      c.fillStyle='#9c835f';c.fillRect(116,30,177,24);c.fillRect(130,50,10,18);c.fillRect(269,50,10,18);
      c.fillStyle='#e8e5cc';c.fillRect(165,15,74,25);c.fillStyle='#74a596';c.fillRect(180,23,9,7);c.fillStyle='#f1be6d';c.fillRect(203,22,14,10);
      for(let i=0;i<5;i++){c.fillStyle=['#e98471','#e9c668','#76bdce','#c5dca3','#d4d9c0'][i];c.fillRect(123+i*27,39,13,14);c.fillStyle='#303c37';c.fillRect(127+i*27,35,5,5);}
      c.fillStyle='#e8dfc4';c.fillRect(677,23,130,27);c.fillStyle='#8a9c7b';c.fillRect(691,29,102,3);c.fillRect(711,39,67,3);
    }
    if(theme==='forest'||theme==='border'){
      c.fillStyle=theme==='forest'?'#b3a989':'#b6b398';
      c.fillRect(76,277,808,56);c.fillRect(448,79,57,452);
      c.fillStyle='#d0c6a0';for(let i=0;i<12;i++)c.fillRect(91+i*68,288+(i%2)*15,47,5);
      for(let i=0;i<11;i++){this.tree(c,24+i*86,70+(i%2)*12,theme==='border'&&i>5?'#4e6a66':'#456649');this.tree(c,18+i*91,594-(i%2)*8,'#3c5845');}
      for(let i=0;i<5;i++){this.tree(c,29,150+i*83,'#486849');this.tree(c,941,168+i*77,'#4a6550');}
      c.fillStyle='#ddca97';c.fillRect(442,37,74,14);c.fillStyle='#647e56';c.fillRect(450,42,59,3);
    }
    if(theme==='waterfall'){
      c.fillStyle='#507885';c.fillRect(901,62,46,482);c.fillStyle='#a4d5cf';c.fillRect(911,63,18,479);c.fillStyle='#cee6dc';c.fillRect(918,65,5,472);
      for(let i=0;i<8;i++){this.rock(c,8+i*128,41+(i%2)*8,77,30,'#6b8580');this.rock(c,13+i*130,565+(i%2)*6,83,26,'#6a817d');}
      for(let i=0;i<5;i++)this.rock(c,13,142+i*81,39,53,'#6c8784');
    }
    if(theme==='cave'||theme==='forge'){
      for(let i=0;i<14;i++){this.rock(c,i*75-13,35+(i%2)*13,69,38,theme==='cave'?'#455762':'#564448');this.rock(c,i*74,574-(i%3)*9,65,41,theme==='cave'?'#3e535c':'#503d40');}
      for(let i=0;i<6;i++){this.rock(c,10,109+i*76,45,60,theme==='cave'?'#455762':'#59443f');this.rock(c,907,113+i*76,44,60,theme==='cave'?'#455762':'#59443f');}
      if(theme==='cave')for(const [x,y] of [[40,115],[915,245],[218,58],[717,573]]){c.fillStyle='#88b4af';c.fillRect(x,y-20,7,27);c.fillRect(x+9,y-11,6,20);c.fillStyle='#c5ded0';c.fillRect(x+1,y-18,2,19);}
      else{
        c.fillStyle='#d87343';c.fillRect(70,558,821,8);c.fillStyle='#f1bd69';for(let i=0;i<15;i++)c.fillRect(75+i*57,560,23,3);
        c.fillStyle='#4d3d3b';c.fillRect(402,11,153,49);c.fillStyle='#f6bb69';c.fillRect(435,28,88,20);c.fillStyle='#a95640';c.fillRect(451,35,53,12);
      }
    }
    c.fillStyle='#f0e5c94d';c.fillRect(77,76,806,2);c.fillStyle='#1b33304d';c.fillRect(77,538,806,3);
    this.sceneCache.set(theme,canvas);return canvas;
  }
  tree(c,x,y,color){
    c.fillStyle='#293b3066';c.fillRect(x-22,y-4,55,10);c.fillStyle='#645e42';c.fillRect(x-4,y-31,12,32);
    c.fillStyle=color;c.fillRect(x-26,y-71,52,41);c.fillRect(x-35,y-57,69,33);c.fillRect(x-16,y-81,32,13);
    c.fillStyle='#a3b57a55';c.fillRect(x-24,y-65,23,7);c.fillRect(x+9,y-49,15,5);c.fillStyle='#28453577';c.fillRect(x-27,y-28,53,6);
  }
  rock(c,x,y,w,h,color='#929b91'){
    c.fillStyle='#1a30374d';c.fillRect(x+6,y+8,w,h);c.fillStyle='#596969';c.fillRect(x,y+5,w,h);
    c.fillStyle=color;c.fillRect(x,y,w,h-5);c.fillStyle='#e0e1c64d';c.fillRect(x+4,y+3,w-8,3);
    c.fillStyle='#43575d55';c.fillRect(x+w*.6,y+8,3,h*.4);c.fillRect(x+w*.6,y+h*.4+5,w*.22,3);
  }
  fadedScene(theme){
    const key=theme+':faded';
    if(!this.sceneCache.has(key)){
      const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;const c=canvas.getContext('2d');
      c.filter='saturate(.08)';c.drawImage(this.scene(theme),0,0);this.sceneCache.set(key,canvas);
    }
    return this.sceneCache.get(key);
  }
  restoredColor(hex){
    if(this.game.restoration===1)return hex;
    const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),gray=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114,saturation=.08+.92*this.game.restoration;
    return 'rgb('+rgb.map(value=>Math.round(gray+(value-gray)*saturation)).join(',')+')';
  }
  draw(){
    const canvas=this.canvas,w=Math.round(canvas.clientWidth),h=Math.round(canvas.clientHeight);if(!w||!h)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    const c=this.ctx,g=this.game,p=g.player,theme=g.terrain?.theme||'plain';
    c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=false;c.fillStyle='#172b30';c.fillRect(0,0,w,h);
    // The complete playfield and every warning remain visible on portrait screens.
    this.scale=Math.min(w/960,h/600);this.offsetX=(w-960*this.scale)/2;this.offsetY=(h-600*this.scale)/2;
    c.save();c.translate(this.offsetX,this.offsetY);c.scale(this.scale,this.scale);
    c.beginPath();c.rect(0,0,960,600);c.clip();
    if(g.shake&&!this.reducedMotion)c.translate(Math.sin(g.time*83)*g.shake*.32,Math.cos(g.time*69)*g.shake*.26);
    c.drawImage(this.scene(theme),0,0);
    if(g.restoration<1){c.globalAlpha=1-g.restoration;c.drawImage(this.fadedScene(theme),0,0);c.globalAlpha=1;}
    this.drawTerrain();this.atmosphere(theme);this.warnings();
    if(g.moveTarget){c.strokeStyle='#ffe4a1';c.lineWidth=2;c.beginPath();c.ellipse(g.moveTarget.x,g.moveTarget.y,12,6,0,0,Math.PI*2);c.stroke();}
    if(g.tutorialWaypoint&&!g.trialLaunched&&['first','pack','trial'].includes(g.tutorial))this.drawTutorialWaypoint();
    if(g.preview&&g.equipment)this.drawRangeGuide();
    if(g.charge)this.drawCharge();
    for(const ghost of g.ghosts)this.sprite(Forge.Sprites.player,ghost.x,ghost.y,2.3,Math.cos(p.facing)<0,ghost.life/ghost.maxLife*.23);
    const actors=g.enemies.filter(e=>e.hp>0).map(e=>({y:e.y,enemy:e}));actors.push({y:p.y,player:true});actors.sort((a,b)=>a.y-b.y);
    for(const actor of actors){if(actor.player)this.drawPlayer();else this.drawEnemy(actor.enemy);}
    if(g.slash)this.drawAttack(g.slash);
    for(const projectile of g.projectiles)this.drawProjectile(projectile);
    this.drawEffects();
    for(const particle of g.particles){c.globalAlpha=Math.max(0,particle.life/particle.maxLife);c.fillStyle=particle.color;c.fillRect(Math.round(particle.x),Math.round(particle.y),particle.size,particle.size);}c.globalAlpha=1;
    for(const fleck of g.collections){c.globalAlpha=Math.min(1,fleck.life*4);c.fillStyle=fleck.color;c.fillRect(Math.round(fleck.x),Math.round(fleck.y),fleck.size,fleck.size);c.fillStyle='#fff2c5';c.fillRect(Math.round(fleck.x),Math.round(fleck.y),1,1);}c.globalAlpha=1;
    c.textAlign='center';c.font='500 15px Consolas, monospace';
    for(const text of g.texts){c.globalAlpha=Math.min(1,text.life/.2);c.fillStyle='#182e32';c.fillText(text.text,text.x+1,text.y+2);c.fillStyle=text.color;c.fillText(text.text,text.x,text.y);}c.globalAlpha=1;
    if(g.combo>1&&g.comboDisplay>0){c.globalAlpha=Math.min(1,g.comboDisplay*3);c.font='700 24px "Microsoft YaHei",sans-serif';c.fillStyle='#283832';c.fillText(g.combo+' 连击',480,112);c.fillStyle='#ffe0a0';c.fillText(g.combo+' 连击',480,110);c.globalAlpha=1;}
    if(g.preview&&g.trialTimer<=0){c.font='13px "Microsoft YaHei",sans-serif';c.fillStyle='#243a39';c.fillText('你的作品',p.x,p.y+29);}
    c.restore();
  }
  drawTerrain(){
    const c=this.ctx,g=this.game,t=this.reducedMotion?0:g.time,terrain=g.terrain;
    if(!terrain)return;
    const grassColor=this.restoredColor('#496845'),grassLight=this.restoredColor('#94ae69'),grassMid=this.restoredColor('#688c55');
    for(const z of terrain.wetZones){
      c.fillStyle='#589aa4';c.fillRect(z.x,z.y,z.w,z.h);c.fillStyle='#a5d6cf';c.fillRect(z.x,z.y,z.w,3);c.fillStyle='#79b7b6';c.fillRect(z.x+3,z.y+4,z.w-6,z.h-8);
      c.save();c.beginPath();c.rect(z.x,z.y,z.w,z.h);c.clip();
      for(let row=0;row<z.h/17+1;row++){const drift=(t*18+row*23)%49;c.fillStyle=row%3?'#c3e4d770':'#4b8f9b70';for(let x=z.x-45+drift;x<z.x+z.w;x+=58)c.fillRect(x,z.y+10+row*17,24,2);}
      c.fillStyle='#e2f2e21f';c.fillRect(z.x,z.y+z.h*.28+Math.sin(t*.6)*7,z.w,18);c.restore();
    }
    for(const tile of terrain.grass){
      const size=tile.size,x=tile.x,y=tile.y;
      if(tile.state==='charred'||tile.state==='embers'){
        c.fillStyle='#4a5144';c.fillRect(x+1,y+1,size-2,size-2);c.fillStyle='#78806a';
        c.fillRect(x+5,y+8,7,2);c.fillRect(x+19,y+18,6,2);c.fillStyle='#2f3b37';c.fillRect(x+12,y+12,3,9);
        if(tile.state==='embers'){
          c.save();c.globalAlpha=Math.min(1,tile.time/1.5);c.fillStyle='#db7a454d';c.fillRect(x+2,y+2,size-4,size-4);
          c.strokeStyle='#e99b57';c.lineWidth=1;c.strokeRect(x+2.5,y+2.5,size-5,size-5);
          for(let i=0;i<4;i++){
            const ex=x+5+(i*11)%22,ey=y+8+(i*7)%18,pulse=.65+Math.sin(t*5+i+x)*.25;
            c.fillStyle='#b65b3f';c.fillRect(ex-2,ey-1,9,5);c.fillStyle='#f5b569';c.globalAlpha=Math.min(1,tile.time/1.5)*pulse;c.fillRect(ex,ey,5,2);
          }
          c.restore();
        }
        continue;
      }
      c.fillStyle=tile.state==='burning'?'#6e643d':grassColor;c.fillRect(x+1,y+1,size-2,size-2);
      const sway=this.reducedMotion?0:Math.round(Math.sin(t*2+x*.1+y)*1.5);
      for(let i=0;i<5;i++){const gx=x+4+(i*13)%24,gy=y+8+(i*7)%20;c.fillStyle=i%2?grassLight:grassMid;c.fillRect(gx+sway,gy-5,2,9);c.fillRect(gx-3,gy-3,3,2);}
      if(tile.state==='burning')for(let i=0;i<4;i++){
        const fx=x+4+i*7,fy=y+18-Math.sin(t*9+i+x)*5;c.fillStyle='#df7144';c.fillRect(fx,fy-6,5,13);c.fillStyle='#f5c775';c.fillRect(fx+1,fy-1,3,7);c.fillStyle='#f9e3a0';c.fillRect(fx+2,fy+3,1,3);
      }
    }
    for(const obstacle of terrain.obstacles)this.rock(c,obstacle.x,obstacle.y,obstacle.w,obstacle.h,terrain.theme==='forge'?'#9c8772':'#b6b8a4');
    for(const hazard of terrain.hazards||[]){
      const active=hazard.active||hazard.state==='active',radius=hazard.radius||hazard.r||28;
      c.fillStyle=active?'#ed9c5566':'#e3bd8333';c.strokeStyle=active?'#f8cb79':'#b78666';c.lineWidth=2;c.beginPath();c.arc(hazard.x,hazard.y,radius,0,Math.PI*2);c.fill();c.stroke();
      if(active){c.fillStyle='#ffdc89';for(let i=0;i<4;i++)c.fillRect(hazard.x-15+i*9,hazard.y-5-Math.sin(t*9+i)*8,4,14);}
    }
  }
  atmosphere(theme){
    const c=this.ctx,t=this.reducedMotion?0:this.game.time;
    const colors={plain:'#f9e8b8',forest:'#dce8a4',waterfall:'#ecf9e8',cave:'#b5dacf',forge:'#ffbe77',border:'#e8ddb7'};
    c.fillStyle=this.restoredColor(colors[theme]||colors.plain);
    for(let i=0;i<15;i++){const x=40+(i*137)%870+Math.sin(t*.32+i)*9,y=75+(i*79)%458+Math.cos(t*.5+i)*8;c.globalAlpha=.2+(Math.sin(t+i)+1)*.1;c.fillRect(Math.round(x),Math.round(y),theme==='waterfall'?5:2,2);}c.globalAlpha=1;
    if(theme==='waterfall'){c.fillStyle='#d9efe66b';for(let i=0;i<18;i++)c.fillRect(907+(i%3)*11,80+(i*29+t*43)%448,7,14);}
    if(theme==='forge'){c.fillStyle='#f4ca7980';for(let i=0;i<9;i++)c.fillRect(420+(i*47)%128,30+(i*11-t*15)%28,2,3);}
  }
  shadow(x,y,r){const c=this.ctx;c.fillStyle='#1b302f55';c.beginPath();c.ellipse(x,y+1,r,r*.32,0,0,Math.PI*2);c.fill();}
  drawTutorialWaypoint(){
    const c=this.ctx,g=this.game,point=g.tutorialWaypoint;if(g.tutorial==='pack'&&g.tutorialFire)return;
    c.save();c.strokeStyle='#ffe4a1';c.fillStyle='#ffe4a12b';c.lineWidth=2;c.setLineDash([5,5]);c.beginPath();c.ellipse(point.x,point.y,22,11,0,0,Math.PI*2);c.fill();c.stroke();c.setLineDash([]);
    const lift=this.reducedMotion?0:Math.sin(g.time*4)*3;c.fillStyle='#ffe4a1';c.fillRect(point.x-2,point.y-29+lift,4,10);c.fillRect(point.x-6,point.y-23+lift,12,4);c.restore();
  }
  drawRangeGuide(){
    const c=this.ctx,g=this.game,p=g.player,s=g.stats(),mode=g.equipment.mode;c.save();c.translate(p.x,p.y);c.rotate(p.facing);
    c.strokeStyle='#203f4890';c.fillStyle='#dcf5dc16';c.lineWidth=1.5;c.setLineDash([6,5]);
    if(mode==='slash'){c.beginPath();c.moveTo(0,0);c.arc(0,0,s.slashRange,-s.slashArc/2,s.slashArc/2);c.closePath();c.fill();c.stroke();}
    else if(mode==='hammer'){c.beginPath();c.arc(s.hammerReach,0,s.hammerRadius,0,Math.PI*2);c.fill();c.stroke();}
    else{
      const reach=mode==='spear'?s.spearLength:s.reach,radius=mode==='spear'?s.spearWidth/2:mode==='shoot'?s.bulletRadius:s.throwRadius;
      c.fillRect(0,-radius,reach,radius*2);c.strokeRect(0,-radius,reach,radius*2);
      c.beginPath();c.moveTo(0,0);c.lineTo(reach,0);c.stroke();
      if(mode==='throw'){c.setLineDash([]);c.beginPath();c.arc(reach,0,radius,0,Math.PI*2);c.stroke();}
    }
    c.restore();
  }
  drawPlayer(){
    const g=this.game,p=g.player,c=this.ctx;this.shadow(p.x,p.y,21);
    const bob=this.reducedMotion?0:p.moving?Math.sin(g.time*17)*2:Math.sin(g.time*2)*.65;
    const alpha=p.invulnerable>0&&Math.floor(g.time*17)%2?.5:1;
    this.sprite(Forge.Sprites.player,p.x,p.y,2.3,Math.cos(p.facing)<0,alpha,bob);
    if(g.equipment&&!g.slash&&!g.charge){
      const mode=g.equipment.mode,throwAway=mode==='throw'&&g.projectiles.some(b=>b.kind==='weapon'&&b.artwork?.id===g.equipment.id);
      if(!throwAway)this.weaponAt(p.x+Math.cos(p.facing)*16,p.y-21+Math.sin(p.facing)*8,p.facing+Math.PI/4,mode==='spear'?67:mode==='hammer'?56:47,alpha,g.equipment,'grip');
    }
    if(p.dashTime>0){c.strokeStyle='#d6ffe7a0';c.lineWidth=2;c.beginPath();c.ellipse(p.x,p.y,26,10,0,0,Math.PI*2);c.stroke();}
    if(p.wetTime>0)this.wetDrops(p.x,p.y,17);
  }
  drawAttack(s){
    const c=this.ctx,progress=1-s.life/s.maxLife,color=s.color,kind=s.kind||'slash';
    c.save();c.translate(s.x,s.y);c.rotate(s.angle);c.strokeStyle=color;c.fillStyle=color;
    if(kind==='spear'){
      c.globalAlpha=(1-progress)*.2;c.fillRect(0,-s.width/2,s.length,s.width);c.globalAlpha=(1-progress)*.8;c.lineWidth=3;
      c.beginPath();c.moveTo(0,0);c.lineTo(s.length,0);c.stroke();c.restore();
      const thrust=s.length*(.3+.55*Math.sin(progress*Math.PI));this.weaponAt(s.x+Math.cos(s.angle)*thrust,s.y+Math.sin(s.angle)*thrust,s.angle+Math.PI/4,79,1,s.artwork);return;
    }
    if(kind==='hammer'){
      c.globalAlpha=(1-progress)*.22;c.beginPath();c.arc(0,0,s.radius,0,Math.PI*2);c.fill();c.globalAlpha=1-progress;c.lineWidth=4;c.stroke();c.restore();
      this.weaponAt(s.x,s.y-10,s.angle+Math.PI/4,66,1-progress,s.artwork);return;
    }
    c.globalAlpha=(1-progress)*.13;c.beginPath();c.moveTo(0,0);c.arc(0,0,s.radius,-s.halfAngle,s.halfAngle);c.closePath();c.fill();
    c.globalAlpha=(1-progress)*.8;c.lineWidth=7;c.beginPath();c.arc(0,0,s.radius,-s.halfAngle,s.halfAngle);c.stroke();c.lineWidth=2;c.strokeStyle='#fff3ca';c.stroke();c.restore();
    const swing=s.angle-s.halfAngle+progress*s.halfAngle*2;this.weaponAt(s.x+Math.cos(swing)*s.radius*.5,s.y+Math.sin(swing)*s.radius*.5,swing+Math.PI/4,57,1,s.artwork);
  }
  drawCharge(){
    const c=this.ctx,g=this.game,s=g.charge,progress=1-s.time/s.duration;
    c.save();c.strokeStyle='#f8d99b';c.fillStyle='#edc9802c';c.lineWidth=2;c.setLineDash([7,4]);c.beginPath();c.arc(s.x,s.y,s.radius,0,Math.PI*2);c.fill();c.stroke();c.setLineDash([]);
    c.strokeStyle='#fff0c4';c.lineWidth=4;c.beginPath();c.arc(s.x,s.y,s.radius,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);c.stroke();c.restore();
    this.weaponAt(g.player.x+9,g.player.y-55,Math.PI/4-progress*.5,65,1,s.artwork,'grip');
  }
  drawProjectile(b){
    const c=this.ctx;
    if(b.kind==='weapon'){
      this.shadow(b.x,b.y+13,b.radius);c.strokeStyle=b.color;c.globalAlpha=.4;c.lineWidth=2;c.beginPath();c.arc(b.x,b.y,b.radius+.5,b.rotation,b.rotation+Math.PI*1.45);c.stroke();c.globalAlpha=1;
      this.weaponAt(b.x,b.y,b.rotation,b.radius*2.45,1,b.artwork);return;
    }
    if(b.kind==='bullet'){
      // The muzzle affects only the first visible frames, never the logical bolt.
      const muzzle=this.muzzleOffset(b.artwork,b.angle),blend=Math.max(0,1-b.travel/40),x=b.x+muzzle.x*blend,y=b.y+muzzle.y*blend;
      if(b.artwork.projectilePixels){const img=this.imageFor(b.artwork,true),factor=18/Math.max(img.width,img.height);c.save();c.translate(x,y);c.rotate(b.rotation);c.drawImage(img,-img.width*factor/2,-img.height*factor/2,img.width*factor,img.height*factor);c.restore();}
      else{c.save();c.translate(x,y);c.rotate(Math.atan2(b.vy,b.vx));c.fillStyle=b.color;c.globalAlpha=.25;c.fillRect(-18,-3,17,6);c.globalAlpha=1;c.fillRect(-6,-5,11,10);c.fillStyle='#fff4d9';c.fillRect(-1,-2,5,4);c.restore();}
      return;
    }
    c.fillStyle='#51354e';c.fillRect(b.x-b.radius,b.y-b.radius,b.radius*2,b.radius*2);c.fillStyle='#d48cae';c.fillRect(b.x-b.radius+3,b.y-b.radius+3,b.radius*2-6,b.radius*2-6);c.fillStyle='#ffe2cb';c.fillRect(b.x-3,b.y-3,3,3);
  }
  drawEffects(){
    const c=this.ctx;
    for(const e of this.game.effects){
      const fade=e.life/e.maxLife;c.globalAlpha=fade;c.strokeStyle=e.color;
      if(e.kind==='defeat'){
        const scale=e.type==='inklord'?3.3:e.boss?3.8:e.type==='bit'?2.1:2.5;this.sprite(this.flashImage(Forge.Sprites[e.type]),e.x,e.y,scale,e.facing>Math.PI/2||e.facing<-Math.PI/2,fade*(this.reducedMotion?.35:.85));
      }else if(e.kind==='arc'){
        c.lineWidth=3;c.beginPath();c.moveTo(e.x,e.y);const dx=e.x2-e.x,dy=e.y2-e.y;
        for(let i=1;i<5;i++){const f=i/5;c.lineTo(e.x+dx*f+(i%2?7:-7),e.y+dy*f+(i%2?-7:7));}c.lineTo(e.x2,e.y2);c.stroke();c.lineWidth=1;c.strokeStyle='#fffbe0';c.stroke();
      }else if(e.kind==='impact'){
        const radius=e.radius*(.35+.65*(1-fade));c.lineWidth=fade>.6?4:2;
        for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;c.beginPath();c.moveTo(e.x+Math.cos(a)*radius*.35,e.y+Math.sin(a)*radius*.35);c.lineTo(e.x+Math.cos(a)*radius,e.y+Math.sin(a)*radius);c.stroke();}
      }else if(e.kind==='ring'||e.kind==='switch'||e.kind==='smash'){
        const radius=e.radius*(1-fade*.35);c.lineWidth=e.kind==='smash'?5:3;c.beginPath();c.ellipse(e.x,e.y,radius,e.kind==='smash'?radius:radius*.5,0,0,Math.PI*2);c.stroke();
        if(e.kind==='smash'){c.lineWidth=2;for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(e.x+Math.cos(a)*radius*.4,e.y+Math.sin(a)*radius*.4);c.lineTo(e.x+Math.cos(a+.07)*radius,e.y+Math.sin(a+.07)*radius);c.stroke();}}
      }
    }
    c.globalAlpha=1;
  }
  wetDrops(x,y,radius){
    const c=this.ctx,t=this.reducedMotion?0:this.game.time;c.strokeStyle='#bdecef';c.lineWidth=1;c.beginPath();c.ellipse(x,y,radius+4,6,0,0,Math.PI*2);c.stroke();
    for(let i=0;i<3;i++){const px=x+(i-1)*9,py=y-18+((t*16+i*9)%16);c.fillStyle='#347f9f';c.fillRect(px-1,py-2,4,6);c.fillStyle='#b9e9e9';c.fillRect(px,py-3,2,5);}
  }
  drawEnemy(e){
    const c=this.ctx,g=this.game,scale=e.type==='inklord'?3.3:e.boss?3.8:e.type==='bit'?2.1:2.5,image=Forge.Sprites[e.type];
    this.shadow(e.x,e.y,e.radius*1.2);
    if(e.groundBurn){
      c.strokeStyle='#f6b263';c.fillStyle='#e97a493b';c.lineWidth=2;c.beginPath();c.ellipse(e.x,e.y,e.radius+3,6,0,0,Math.PI*2);c.fill();c.stroke();
      for(let i=0;i<3;i++){const lift=this.reducedMotion?2:(g.time*12+i*5)%10;c.fillStyle=i%2?'#ffcf89':'#ed875f';c.fillRect(e.x+(i-1)*(e.radius+2),e.y-3-lift,3,5);}
    }
    const bob=this.reducedMotion||e.type==='dummy'?0:Math.sin(g.time*(e.phase==='charge'?22:7)+e.walkOffset)*1.5;
    const squash=this.reducedMotion||!['slime','bit','splitter'].includes(e.type)?1:1+Math.sin(g.time*6+e.walkOffset)*.035;
    const flip=e.facing>Math.PI/2||e.facing<-Math.PI/2;this.sprite(image,e.x,e.y,scale,flip,e.spawnTime>0?.5:1,bob,squash);
    if(e.hitFlash>0){
      this.sprite(this.flashImage(image),e.x,e.y,scale,flip,this.reducedMotion?.35:.75,bob,squash);
    }
    if(e.slowTime>0){c.strokeStyle='#9ee8ee';c.lineWidth=1.5;c.beginPath();c.ellipse(e.x,e.y,e.radius+4,6,0,0,Math.PI*2);c.stroke();c.fillStyle='#a9e5ed';c.fillRect(e.x-12,e.y-14,3,6);c.fillRect(e.x+9,e.y-8,3,7);}
    if(e.burnTime>0)for(let i=0;i<3;i++){c.fillStyle=i%2?'#ffcf89':'#ed875f';const x=e.x+(i-1)*9,y=e.y-9-Math.sin(g.time*10+i)*4;c.fillRect(x,y,4,9);}
    if(e.wetTime>0)this.wetDrops(e.x,e.y,e.radius);
    if(e.crackTime>0){c.strokeStyle='#ffe0b0';c.lineWidth=2;c.beginPath();c.moveTo(e.x-3,e.y-31);c.lineTo(e.x+3,e.y-24);c.lineTo(e.x-2,e.y-16);c.lineTo(e.x+5,e.y-8);c.stroke();}
    if(e.type==='inklord'&&e.hp<e.maxHp*.5){c.strokeStyle='#f6bdd575';c.lineWidth=2;c.beginPath();c.ellipse(e.x,e.y,e.radius+8,13,0,0,Math.PI*2);c.stroke();}
    if(e.type!=='dummy'&&!e.boss&&e.hp<e.maxHp){const y=e.y-image.height*scale-9;c.fillStyle='#233d40';c.fillRect(e.x-16,y,32,4);c.fillStyle=e.color;c.fillRect(e.x-16,y,32*Math.max(0,e.hp/e.maxHp),4);}
  }
  warnings(){
    const c=this.ctx,g=this.game;
    for(const e of g.enemies)if(e.phase==='windup'){
      if(e.type==='spitter'){
        c.save();c.translate(e.x,e.y-6);c.strokeStyle='#ffd5e0';c.lineWidth=2;c.setLineDash([5,6]);for(const offset of [-.24,0,.24]){c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(e.aim+offset)*220,Math.sin(e.aim+offset)*220);c.stroke();}c.restore();
      }else if(e.type==='inklord'){
        const progress=Math.max(0,1-e.phaseTime/e.windupDuration);
        if(e.move==='seals')for(const mark of e.seals){c.fillStyle='#9c466d44';c.strokeStyle='#ffd5eb';c.lineWidth=3;c.beginPath();c.arc(mark.x,mark.y,64,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#c96f9c55';c.beginPath();c.arc(mark.x,mark.y,64*progress,0,Math.PI*2);c.fill();}
        else{c.strokeStyle='#f0c3ee';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,48+progress*32,0,Math.PI*2);c.stroke();c.save();c.setLineDash([3,8]);for(let i=0;i<10;i++){const angle=i*Math.PI/5;c.beginPath();c.moveTo(e.x+Math.cos(angle)*45,e.y+Math.sin(angle)*45);c.lineTo(e.x+Math.cos(angle)*110,e.y+Math.sin(angle)*110);c.stroke();}c.restore();}
      }else if(e.type==='boss'&&e.move==='slam'){
        const progress=1-e.phaseTime/.85;c.fillStyle='#ab4e4a3d';c.strokeStyle='#ffd3a4';c.lineWidth=3;c.beginPath();c.arc(e.targetX,e.targetY,108,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#e88b6655';c.beginPath();c.arc(e.targetX,e.targetY,108*progress,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#ffead1';c.beginPath();c.moveTo(e.targetX-8,e.targetY);c.lineTo(e.targetX+8,e.targetY);c.moveTo(e.targetX,e.targetY-8);c.lineTo(e.targetX,e.targetY+8);c.stroke();
      }else{
        const distance=e.type==='boss'?200:166;c.save();c.translate(e.x,e.y);c.rotate(Math.atan2(e.chargeY,e.chargeX));c.fillStyle='#b1474940';c.fillRect(0,-e.radius,distance,e.radius*2);c.strokeStyle='#ffd3b0';c.lineWidth=3;c.setLineDash([6,5]);c.beginPath();c.moveTo(0,0);c.lineTo(distance,0);c.stroke();c.restore();
      }
    }
  }
};
