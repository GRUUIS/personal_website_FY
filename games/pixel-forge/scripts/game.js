'use strict';
Forge.Game = class {
  constructor(onEvent=()=>{}){
    this.onEvent=onEvent;this.state='idle';this.preview=false;this.equipment=null;this.loadout=[];this.activeSlot=0;this.upgrades=[];this.serial=0;this.attackSerial=0;this.levelIndex=0;this.terrain=Forge.createTerrain();this.reset();
    this.reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  }
  copyEquipment(equipment){
    const size=equipment.size||Math.sqrt(equipment.pixels.length);
    return {...equipment,id:equipment.id||equipment.name||equipment.mode,craft:equipment.craft||'balanced',size,pixels:equipment.pixels.slice(),recipe:Forge.recipe(equipment.pixels),formula:equipment.formula||'',anchors:equipment.anchors?{grip:{...equipment.anchors.grip},muzzle:{...equipment.anchors.muzzle}}:{grip:{x:.25,y:.75},muzzle:{x:.8,y:.2}},projectilePixels:equipment.projectilePixels?.slice(),shape:Forge.measureShape(equipment.pixels,size)};
  }
  equip(equipment){this.setLoadout([equipment]);}
  setLoadout(equipments){this.loadout=equipments.map(equipment=>this.copyEquipment(equipment));this.activeSlot=0;this.equipment=this.loadout[0];this.switchCooldown=0;this.charge=null;}
  switchWeapon(){
    if(this.loadout.length<2||this.switchCooldown>0||!['playing','preview'].includes(this.state))return false;
    this.activeSlot=(this.activeSlot+1)%this.loadout.length;this.equipment=this.loadout[this.activeSlot];this.switchCooldown=2;this.charge=null;this.player.attackCooldown=this.stats().interval;
    this.effects.push({kind:'switch',x:this.player.x,y:this.player.y,radius:35,life:.35,maxLife:.35,color:this.elementColor()});this.onEvent('sound','switch');this.onEvent('switch',this.equipment);return true;
  }
  stats(equipment=this.equipment){
    const mode=equipment?.mode||'slash',craft=equipment?.craft||'balanced',base=Forge.weaponStats(mode,craft),rank=id=>Forge.upgradeRank(this.upgrades,id);
    const reach=base.reach*(mode==='throw'?1+.15*rank('reach'):1);
    return {...base,reach,damage:base.damage*(1+.1*rank('power')+.04*rank('focus')),interval:base.interval*.9**rank('quick'),speed:190*(1+.05*rank('stride')),dashCooldown:2*(rank('step')?.85:1),burnDuration:2+rank('ember'),slowDuration:1.5+.5*rank('frost'),chainRange:120*(1+.2*rank('arc')),maxHp:100+10*rank('vital')};
  }
  start(levelIndex,upgrades=[]){
    this.levelIndex=levelIndex;this.upgrades=upgrades.slice();this.preview=false;this.reset();this.level=Forge.LEVELS[levelIndex];this.terrain=Forge.createTerrain(this.level.theme);this.state='playing';this.spawnIndex=0;this.spawnClock=.5;this.total=this.level.enemies.length;this.introTime=1.6;
  }
  startTutorial(equipment){
    this.equip(equipment);this.start(0);this.terrain=Forge.createTerrain('forest');this.tutorial='first';this.restoration=0;this.introTime=0;
    this.spawnIndex=this.level.enemies.length;this.total=6;this.player.x=370;this.player.y=305;this.player.attackCooldown=0;
    this.tutorialWaypoint={x:430,y:305};
    const enemy=this.addEnemy('slime',520,305);enemy.hp=enemy.maxHp=this.stats().damage;enemy.stationary=true;enemy.spawnTime=0;
  }
  startUnlockTrial(equipment){
    this.equip({...equipment,mode:'throw'});this.start(0);this.terrain=Forge.createTerrain('forest');this.tutorial='trial';this.restoration=1;this.introTime=0;
    this.spawnIndex=this.level.enemies.length;this.total=3;this.player.x=350;this.player.y=330;this.player.attackCooldown=0;this.tutorialWaypoint={x:465,y:330};
    const hp=this.stats().damage*2;
    this.enemies=[545,610,680].map(x=>({...this.makeEnemy('dummy',x,330),hp,maxHp:hp,stationary:true,spawnTime:0}));
  }
  updateTutorial(dt){
    if(this.tutorial==='first'&&!this.enemies.length){this.tutorial='pause';this.tutorialPause=.55;this.onEvent('tutorial','first-hit');}
    if(this.tutorial==='pause'){
      this.tutorialPause-=dt;
      if(this.tutorialPause<=0){
        this.tutorial='pack';this.tutorialWaypoint={x:530,y:305};
        for(const [x,y] of [[552,248],[600,216],[632,184],[664,216],[696,248]]){
          const enemy=this.addEnemy('slime',x,y);enemy.hp=enemy.maxHp=10;enemy.stationary=true;
        }
        this.onEvent('tutorial','pack');
      }
    }
    if(this.tutorial==='pack'&&!this.enemies.length){
      this.tutorialClearDelay+=dt;
      if(this.tutorialClearDelay>=.8){this.state='cleared';this.onEvent('clear',this.levelIndex);}
    }
  }
  reset(){
    this.time=0;this.enemies=[];this.projectiles=[];this.particles=[];this.texts=[];this.effects=[];this.ghosts=[];this.collections=[];this.slash=null;this.charge=null;this.kills=0;this.damageDealt=0;this.shake=0;this.hitStop=0;this.combo=0;this.comboTime=0;this.comboDisplay=0;this.bossDefeated=false;this.switchCooldown=0;this.spawnSerial=0;
    this.tutorial=null;this.tutorialWaypoint=null;this.tutorialPause=0;this.tutorialClearDelay=0;this.tutorialFire=false;this.trialLaunched=false;this.trialComplete=false;this.restoration=1;
    const maxHp=100+10*Forge.upgradeRank(this.upgrades,'vital');
    this.player={x:480,y:355,hp:maxHp,maxHp,facing:-.35,invulnerable:0,dashTime:0,dashCooldown:0,attackCooldown:.25,moving:false};this.input={x:0,y:0};
  }
  setPreview(environment='plain'){
    this.reset();this.preview=true;this.state='preview';this.terrain=Forge.createTerrain(environment);this.trialTimer=0;
    const positions=environment==='waterfall'?[[510,320],[650,295],[735,350],[650,420]]:environment==='forest'?[[592,240],[688,240],[640,400]]:[[615,305],[690,370],[570,425]];
    this.enemies=positions.map(([x,y])=>this.makeEnemy('dummy',x,y));this.positionPreview();this.updateTerrain(0);
  }
  positionPreview(){
    const p=this.player,near=['slash','spear','hammer'].includes(this.equipment?.mode);
    if(this.terrain.theme==='waterfall'){p.x=near?600:430;p.y=355;}
    else if(this.terrain.theme==='forest'){p.x=near?535:395;p.y=285;}
    else{p.x=near?535:395;p.y=365;}
  }
  tryWeapon(){
    this.trialTimer=6;this.player.attackCooldown=0;this.terrain=Forge.createTerrain(this.terrain.theme);
    for(const e of this.enemies){e.hp=e.maxHp;e.burnTime=0;e.slowTime=0;e.crackTime=0;e.groundBurn=false;e.groundBurnTick=0;e.groundBurnDamage=0;}this.positionPreview();
  }
  makeEnemy(type,x,y){const data=Forge.ENEMIES[type];return {id:++this.serial,type,x,y,...data,maxHp:data.hp,hitFlash:0,burnTime:0,burnDamage:0,burnTick:0,groundBurn:false,groundBurnTick:0,groundBurnDamage:0,slowTime:0,slowAmount:0,wetTime:0,crackTime:0,crackSource:'',cooldown:data.boss?2:1+Math.random(),phase:'walk',phaseTime:0,chargeX:0,chargeY:0,attackCount:0,facing:0,spawnTime:.4,walkOffset:Math.random()*6,patrolIndex:0};}
  addEnemy(type,x,y){
    const enemy=this.makeEnemy(type,x,y);enemy.hp=enemy.maxHp=Math.round(enemy.hp*(this.level?.hpScale||1));enemy.damage=Math.round(enemy.damage*(this.level?.damageScale||1));this.enemies.push(enemy);this.burst(x,y,enemy.color,10,70);return enemy;
  }
  spawn(type){
    const theme=this.terrain.theme;
    const points=theme==='cave'?[[112,280],[848,280],[112,365],[848,365]]:theme==='waterfall'?[[152,176],[808,176],[152,432],[808,432]]:theme==='forge'?[[400,128],[560,128],[400,488],[560,488]]:[[112,128],[848,128],[112,488],[848,488]];
    let [x,y]=points[this.spawnSerial++%points.length];x+=(Math.random()-.5)*20;y+=(Math.random()-.5)*16;
    if(Forge.ENEMIES[type].boss){x=theme==='forest'?592:480;y=theme==='forest'?200:260;}
    return this.addEnemy(type,x,y);
  }
  dash(){
    if(this.state!=='playing'||this.player.dashCooldown>0||this.introTime>0)return false;
    const p=this.player,s=this.stats(),length=Math.hypot(this.input.x,this.input.y);p.dashX=length?this.input.x/length:Math.cos(p.facing);p.dashY=length?this.input.y/length:Math.sin(p.facing);p.dashTime=.19;p.invulnerable=.3;p.dashCooldown=s.dashCooldown;this.charge=null;this.burst(p.x,p.y,'#a1efdb',12,80);this.onEvent('sound','dash');return true;
  }
  moveActor(actor,dx,dy,radius){
    const previousX=actor.x,previousY=actor.y;
    actor.x+=dx;
    for(const box of this.terrain.obstacles)if(actor.y+radius>box.y&&actor.y-radius<box.y+box.h){if(dx>0&&previousX+radius<=box.x&&actor.x+radius>=box.x)actor.x=box.x-radius;else if(dx<0&&previousX-radius>=box.x+box.w&&actor.x-radius<=box.x+box.w)actor.x=box.x+box.w+radius;}
    actor.y+=dy;
    for(const box of this.terrain.obstacles)if(actor.x+radius>box.x&&actor.x-radius<box.x+box.w){if(dy>0&&previousY+radius<=box.y&&actor.y+radius>=box.y)actor.y=box.y-radius;else if(dy<0&&previousY-radius>=box.y+box.h&&actor.y-radius<=box.y+box.h)actor.y=box.y+box.h+radius;}
    actor.x=Math.max(80,Math.min(880,actor.x));actor.y=Math.max(95,Math.min(520,actor.y));
  }
  segmentDistance(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)):0;return Math.hypot(x-ax-dx*t,y-ay-dy*t);}
  segmentBlocked(ax,ay,bx,by,radius=0){
    return this.terrain.obstacles.some(box=>{
      let start=0,end=1;const dx=bx-ax,dy=by-ay;
      for(const [origin,delta,min,max] of [[ax,dx,box.x-radius,box.x+box.w+radius],[ay,dy,box.y-radius,box.y+box.h+radius]]){
        if(delta===0){if(origin<min||origin>max)return false;}
        else{const first=(min-origin)/delta,last=(max-origin)/delta;start=Math.max(start,Math.min(first,last));end=Math.min(end,Math.max(first,last));if(start>end)return false;}
      }
      return true;
    });
  }
  update(dt){
    if(this.state==='cleared'){this.time+=dt;this.animateEffects(dt);this.updateTerrain(dt);return;}
    if(this.state!=='playing'&&this.state!=='preview')return;
    this.time+=dt;this.animateEffects(dt);this.switchCooldown=Math.max(0,this.switchCooldown-dt);
    if(this.hitStop>0){const pause=Math.min(dt,this.hitStop);this.hitStop-=pause;dt-=pause;}
    if(this.preview){this.updatePreview(dt);return;}
    if(this.introTime>0){this.introTime-=dt;return;}
    const p=this.player,s=this.stats();p.invulnerable=Math.max(0,p.invulnerable-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);p.attackCooldown-=dt;
    const length=Math.hypot(this.input.x,this.input.y);p.moving=length>.05;
    if(p.dashTime>0){p.dashTime-=dt;this.moveActor(p,p.dashX*580*dt,p.dashY*580*dt,12);this.ghosts.push({x:p.x,y:p.y,life:.23,maxLife:.23});}
    else if(length){const speed=s.speed*(this.charge ? .6 : 1);this.moveActor(p,this.input.x/Math.max(1,length)*speed*dt,this.input.y/Math.max(1,length)*speed*dt,12);}
    this.updateTerrain(dt);this.spawnClock-=dt;
    if(this.spawnIndex<this.level.enemies.length&&this.spawnClock<=0){this.spawn(this.level.enemies[this.spawnIndex++]);this.spawnClock=this.level.interval;}
    for(const e of this.enemies)if(e.hp>0)this.updateEnemy(e,dt);
    this.updateCharge(dt);
    const target=this.nearest(p.x,p.y),trialReady=this.tutorial!=='trial'||(!this.trialLaunched&&Math.hypot(p.x-this.tutorialWaypoint.x,p.y-this.tutorialWaypoint.y)<20);
    if(target){p.facing=Math.atan2(target.y-p.y,target.x-p.x);if(trialReady&&p.attackCooldown<=0&&!this.charge&&p.dashTime<=0)this.attack(target);}else if(length)p.facing=Math.atan2(this.input.y,this.input.x);
    this.updateProjectiles(dt);this.enemies=this.enemies.filter(e=>e.hp>0);
    if(p.hp<=0){this.state='dead';this.onEvent('dead');}
    else if(this.tutorial)this.updateTutorial(dt);
    else if(this.spawnIndex===this.level.enemies.length&&!this.enemies.length){this.state='cleared';this.onEvent('clear',this.levelIndex);}
  }
  updatePreview(dt){
    this.player.attackCooldown-=dt;this.trialTimer=Math.max(0,this.trialTimer-dt);this.updateTerrain(dt);
    for(const e of this.enemies)this.updateStatuses(e,dt);
    this.updateCharge(dt);
    if(this.trialTimer>0){const target=this.nearest(this.player.x,this.player.y);if(target){this.player.facing=Math.atan2(target.y-this.player.y,target.x-this.player.x);if(this.player.attackCooldown<=0&&!this.charge)this.attack(target);}}
    this.updateProjectiles(dt);
  }
  isWet(x,y){return this.terrain.wetZones.some(zone=>x>=zone.x&&x<=zone.x+zone.w&&y>=zone.y&&y<=zone.y+zone.h);}
  circleTouchesBox(x,y,radius,box){return Math.hypot(x-Math.max(box.x,Math.min(box.x+(box.w||box.size),x)),y-Math.max(box.y,Math.min(box.y+(box.h||box.size),y)))<=radius;}
  lightGrass(grass,strength){
    if(grass.state!=='fresh'||strength<=0)return;
    grass.state='burning';grass.time=3;grass.strength=strength;grass.spreadClock=0;this.onEvent('sound','fire');this.burst(grass.x+16,grass.y+12,'#ffc57e',3,36);
    if(this.tutorial==='pack'&&!this.tutorialFire){this.tutorialFire=true;this.onEvent('tutorial','fire');}
  }
  igniteGrass(x,y,radius,strength){for(const grass of this.terrain.grass)if(this.circleTouchesBox(x,y,radius,grass))this.lightGrass(grass,strength);}
  updateTerrain(dt){
    const spreading=[];
    for(const grass of this.terrain.grass){
      if(grass.state==='embers'){
        grass.time=Math.max(0,grass.time-dt);if(grass.time===0)grass.state='charred';continue;
      }
      if(grass.state!=='burning')continue;
      grass.time-=dt;grass.spreadClock+=dt;
      if(grass.spreadClock>=.8){grass.spreadClock-=.8;for(const next of this.terrain.grass)if(next.state==='fresh'&&Math.abs(next.x-grass.x)+Math.abs(next.y-grass.y)===grass.size)spreading.push({grass:next,strength:grass.strength});}
      if(grass.time<=0){grass.state='embers';grass.time+=4;}
    }
    for(const entry of spreading)this.lightGrass(entry.grass,entry.strength);
    for(const enemy of this.enemies){if(this.isWet(enemy.x,enemy.y))enemy.wetTime=2;else enemy.wetTime=Math.max(0,enemy.wetTime-dt);}
  }
  updateStatuses(enemy,dt){
    enemy.hitFlash=Math.max(0,enemy.hitFlash-dt);enemy.spawnTime=Math.max(0,enemy.spawnTime-dt);enemy.slowTime=Math.max(0,enemy.slowTime-dt);enemy.crackTime=Math.max(0,enemy.crackTime-dt);
    if(enemy.burnTime>0){
      this.igniteGrass(enemy.x,enemy.y,enemy.radius,enemy.burnDamage/3);
      this.damage(enemy,enemy.burnDamage*Math.min(dt,enemy.burnTime)*(enemy.wetTime>0?.6:1),false);enemy.burnTime=Math.max(0,enemy.burnTime-dt);enemy.burnTick+=dt;
      if(enemy.burnTick>.4){enemy.burnTick=0;this.burst(enemy.x,enemy.y-12,'#f37569',2,30);}
    }
    let strength=0;
    for(const grass of this.terrain.grass)if((grass.state==='burning'||grass.state==='embers')&&this.circleTouchesBox(enemy.x,enemy.y,enemy.radius,grass))strength=Math.max(strength,grass.strength*(grass.state==='embers'?.5:1));
    enemy.groundBurn=strength>0;
    if(enemy.groundBurn){
      const amount=4*strength*dt;this.damage(enemy,amount,false);enemy.groundBurnTick+=dt;enemy.groundBurnDamage+=amount;
      if(enemy.groundBurnTick>=.6||enemy.hp<=0){
        const total=enemy.groundBurnDamage;this.texts.push({x:enemy.x,y:enemy.y-enemy.radius-12,text:'−'+(total<1?total.toFixed(1):String(Math.round(total))),color:'#ffc077',life:.6,maxLife:.6});
        this.burst(enemy.x,enemy.y-4,'#f2a15a',2,24);enemy.groundBurnTick=0;enemy.groundBurnDamage=0;
      }
    }else{enemy.groundBurnTick=0;enemy.groundBurnDamage=0;}
  }
  nearest(x,y){let result=null,distance=Infinity;for(const enemy of this.enemies){if(enemy.hp<=0||this.segmentBlocked(x,y,enemy.x,enemy.y))continue;const d=Math.hypot(enemy.x-x,enemy.y-y);if(d<distance){distance=d;result=enemy;}}return result;}
  attackContext(){const equipment=this.equipment;return {id:++this.attackSerial,equipment,recipe:equipment.recipe,stats:this.stats(equipment),formula:Forge.formulaActive(equipment.formula,equipment.recipe)?equipment.formula:'',chainUsed:false};}
  inSlash(x,y,radius,attack){const dx=x-attack.x,dy=y-attack.y,distance=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)-attack.angle;return distance<=attack.radius+radius&&Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<=attack.halfAngle+Math.asin(Math.min(1,radius/Math.max(distance,1)));}
  inSpear(x,y,radius,attack){const dx=x-attack.x,dy=y-attack.y,along=dx*Math.cos(attack.angle)+dy*Math.sin(attack.angle),across=-dx*Math.sin(attack.angle)+dy*Math.cos(attack.angle);return along>=-radius&&along<=attack.length+radius&&Math.abs(across)<=attack.width/2+radius;}
  attack(target){
    const p=this.player,s=this.stats(),mode=this.equipment.mode,distance=Math.hypot(target.x-p.x,target.y-p.y),extra=mode==='hammer'?s.hammerRadius:mode==='throw'?s.throwRadius:0;
    if(distance>s.reach+target.radius+extra||this.segmentBlocked(p.x,p.y,target.x,target.y))return;
    const context=this.attackContext(),color=this.elementColor(context.recipe),angle=Math.atan2(target.y-p.y,target.x-p.x);p.facing=angle;
    if(mode==='slash'||mode==='spear'){
      const attack={kind:mode,x:p.x,y:p.y,angle,life:mode==='slash'?.22:.18,maxLife:mode==='slash'?.22:.18,radius:s.slashRange,halfAngle:s.slashArc/2,length:s.spearLength,width:s.spearWidth,artwork:context.equipment,color};this.slash=attack;
      const contains=(x,y,radius)=>mode==='slash'?this.inSlash(x,y,radius,attack):this.inSpear(x,y,radius,attack);
      for(const enemy of this.enemies)if(enemy.hp>0&&contains(enemy.x,enemy.y,enemy.radius)&&!this.segmentBlocked(p.x,p.y,enemy.x,enemy.y))this.hit(enemy,s.damage,context);
      if(context.recipe.fire)for(const grass of this.terrain.grass)if(contains(grass.x+16,grass.y+16,22)&&!this.segmentBlocked(p.x,p.y,grass.x+16,grass.y+16))this.lightGrass(grass,context.recipe.fire);
      this.onEvent('sound',mode);
    }else if(mode==='hammer'){
      const landingDistance=Math.min(s.hammerReach,distance);
      this.charge={x:p.x+Math.cos(angle)*landingDistance,y:p.y+Math.sin(angle)*landingDistance,radius:s.hammerRadius,time:s.hammerWindup,duration:s.hammerWindup,angle,artwork:context.equipment,context};this.onEvent('sound','charge');
    }else{
      const speed=mode==='throw'?430:520;
      this.projectiles.push({kind:mode==='throw'?'weapon':'bullet',x:p.x,y:p.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,speed,angle,travel:0,returning:false,rotation:angle,radius:mode==='throw'?s.throwRadius:s.bulletRadius,reach:s.reach,hits:new Set(),life:mode==='throw'?5:s.reach/speed+.1,artwork:context.equipment,context,damage:s.damage,color});this.onEvent('sound',mode==='throw'?'throw':'shoot');
    }
    p.attackCooldown=s.interval;
    if(this.tutorial==='trial')this.trialLaunched=true;
  }
  updateCharge(dt){
    if(!this.charge)return;this.charge.time-=dt;if(this.charge.time>0)return;
    const strike=this.charge,context=strike.context;this.charge=null;
    this.slash={kind:'hammer',x:strike.x,y:strike.y,angle:strike.angle,radius:strike.radius,life:.25,maxLife:.25,artwork:context.equipment,color:this.elementColor(context.recipe)};
    this.effects.push({kind:'smash',x:strike.x,y:strike.y,radius:strike.radius,life:.4,maxLife:.4,color:this.elementColor(context.recipe)});this.shake=5;this.onEvent('sound','hammer');
    for(const enemy of this.enemies)if(enemy.hp>0&&Math.hypot(enemy.x-strike.x,enemy.y-strike.y)<=strike.radius+enemy.radius&&!this.segmentBlocked(strike.x,strike.y,enemy.x,enemy.y)){
      this.hit(enemy,context.stats.damage,context);const dx=enemy.x-strike.x,dy=enemy.y-strike.y,distance=Math.hypot(dx,dy)||1;this.moveActor(enemy,dx/distance*18,dy/distance*18,enemy.radius);
    }
    this.igniteGrass(strike.x,strike.y,strike.radius,context.recipe.fire);
  }
  updateEnemy(enemy,dt){
    const p=this.player;this.updateStatuses(enemy,dt);if(enemy.hp<=0||enemy.spawnTime>0||enemy.stationary)return;
    const dx=p.x-enemy.x,dy=p.y-enemy.y,distance=Math.hypot(dx,dy),nx=dx/Math.max(1,distance),ny=dy/Math.max(1,distance),previousPhase=enemy.phase;enemy.facing=Math.atan2(dy,dx);enemy.cooldown-=dt;
    const slow=enemy.slowTime>0?1-enemy.slowAmount:1,walk=(direction=1)=>this.moveActor(enemy,nx*enemy.speed*slow*dt*direction,ny*enemy.speed*slow*dt*direction,enemy.radius);
    if(enemy.type==='runner'){
      if(enemy.phase==='windup'){enemy.phaseTime-=dt;if(enemy.phaseTime<=0){enemy.phase='charge';enemy.phaseTime=.46;}}
      else if(enemy.phase==='charge'){this.moveActor(enemy,enemy.chargeX*360*slow*dt,enemy.chargeY*360*slow*dt,enemy.radius);enemy.phaseTime-=dt;if(enemy.phaseTime<=0){enemy.phase='walk';enemy.cooldown=2;}}
      else if(enemy.cooldown<=0&&distance<340){enemy.phase='windup';enemy.phaseTime=.62;enemy.chargeX=nx;enemy.chargeY=ny;}
      else walk();
    }else if(enemy.type==='shooter'){
      if(distance<170)walk(-1);else if(distance>290)walk();
      if(enemy.cooldown<=0&&!this.segmentBlocked(enemy.x,enemy.y,p.x,p.y)){this.inkBolt(enemy,enemy.facing,155,10);enemy.cooldown=2.25;this.burst(enemy.x,enemy.y-8,enemy.color,5,40);}
    }else if(enemy.type==='spitter'){
      if(enemy.phase==='windup'){enemy.phaseTime-=dt;if(enemy.phaseTime<=0){for(const offset of [-.24,0,.24])this.inkBolt(enemy,enemy.aim+offset,165,9);enemy.phase='walk';enemy.cooldown=2.2;}}
      else if(enemy.cooldown<=0&&!this.segmentBlocked(enemy.x,enemy.y,p.x,p.y)){enemy.phase='windup';enemy.phaseTime=.65;enemy.aim=enemy.facing;}
      else if(distance<165)walk(-1);else if(distance>290)walk();
    }else if(enemy.type==='inklord')this.updateInkLord(enemy,dt,nx,ny,slow);
    else if(enemy.type==='boss')this.updateBoss(enemy,dt,nx,ny,slow);
    else walk();
    if(previousPhase!=='windup'&&enemy.phase==='windup')this.onEvent('sound','warning');
    for(const other of this.enemies){if(other===enemy||other.hp<=0)continue;const ox=enemy.x-other.x,oy=enemy.y-other.y,od=Math.hypot(ox,oy),min=enemy.radius+other.radius-3;if(od>0&&od<min)this.moveActor(enemy,ox/od*25*dt,oy/od*25*dt,enemy.radius);}
    if(Math.hypot(p.x-enemy.x,p.y-enemy.y)<enemy.radius+12)this.hurt(enemy.damage,enemy.x,enemy.y);
  }
  updateBoss(enemy,dt,nx,ny,slow){
    if(enemy.phase==='windup'){
      enemy.phaseTime-=dt;if(enemy.phaseTime<=0){
        if(enemy.move==='slam'){this.effects.push({kind:'ring',x:enemy.targetX,y:enemy.targetY,radius:108,life:.45,maxLife:.45,color:'#f3987c'});this.burst(enemy.targetX,enemy.targetY,'#d2b99b',32,230);this.shake=7;if(Math.hypot(this.player.x-enemy.targetX,this.player.y-enemy.targetY)<112)this.hurt(22,enemy.targetX,enemy.targetY);enemy.phase='walk';enemy.cooldown=1.9;}
        else{enemy.phase='charge';enemy.phaseTime=.62;}
      }
    }else if(enemy.phase==='charge'){this.moveActor(enemy,enemy.chargeX*310*slow*dt,enemy.chargeY*310*slow*dt,enemy.radius);enemy.phaseTime-=dt;if(enemy.phaseTime<=0){enemy.phase='walk';enemy.cooldown=1.9;}}
    else if(enemy.cooldown<=0){enemy.attackCount++;
      if(enemy.attackCount%3===0){const count=Math.min(3,5-this.enemies.filter(other=>!other.boss&&other.hp>0).length);for(let i=0;i<count;i++){this.addEnemy('bit',enemy.x+(i-1)*36,enemy.y+52);this.total++;}enemy.cooldown=1.7;this.effects.push({kind:'ring',x:enemy.x,y:enemy.y,radius:90,life:.5,maxLife:.5,color:'#bb92dd'});}
      else{enemy.phase='windup';enemy.phaseTime=.85;enemy.move=enemy.attackCount%2===0?'charge':'slam';enemy.chargeX=nx;enemy.chargeY=ny;enemy.targetX=this.player.x;enemy.targetY=this.player.y;}
    }else this.moveActor(enemy,nx*enemy.speed*slow*dt,ny*enemy.speed*slow*dt,enemy.radius);
  }
  inkBolt(enemy,angle,speed,damage){this.projectiles.push({kind:'ink',x:enemy.x,y:enemy.y-6,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,radius:6,damage:Math.round(damage*(this.level?.damageScale||1)),life:4.5});}
  updateInkLord(enemy,dt,nx,ny,slow){
    const enraged=enemy.hp<enemy.maxHp*.5,recovery=enraged?1.3:1.9;
    if(enemy.phase==='windup'){
      enemy.phaseTime-=dt;if(enemy.phaseTime<=0){
        if(enemy.move==='seals'){for(const mark of enemy.seals){this.effects.push({kind:'ring',x:mark.x,y:mark.y,radius:64,life:.5,maxLife:.5,color:'#d795e9'});this.burst(mark.x,mark.y,'#c796ea',18,150);if(Math.hypot(this.player.x-mark.x,this.player.y-mark.y)<76)this.hurt(18,mark.x,mark.y);}enemy.seals=[];enemy.phase='walk';enemy.cooldown=recovery;this.shake=6;}
        else{enemy.phase='barrage';enemy.phaseTime=0;enemy.volleys=enraged?3:2;enemy.volleyIndex=0;}
      }
    }else if(enemy.phase==='barrage'){
      enemy.phaseTime-=dt;if(enemy.phaseTime<=0){for(let i=0;i<10;i++)this.inkBolt(enemy,i*Math.PI/5+enemy.volleyIndex*.19,140,10);enemy.volleyIndex++;enemy.volleys--;enemy.phaseTime=.48;if(!enemy.volleys){enemy.phase='walk';enemy.cooldown=recovery;}}
    }else if(enemy.cooldown<=0){
      enemy.attackCount++;
      if(enemy.attackCount%3===0){const adds=this.enemies.filter(other=>!other.boss&&other.hp>0).length;for(let i=0;i<Math.min(2,4-adds);i++){this.spawn(i===0?'runner':'slime');this.total++;}this.effects.push({kind:'ring',x:enemy.x,y:enemy.y,radius:95,life:.6,maxLife:.6,color:'#c796ea'});enemy.cooldown=recovery;}
      else{enemy.phase='windup';enemy.windupDuration=enraged?.8:1;enemy.phaseTime=enemy.windupDuration;enemy.move=enemy.attackCount%2?'barrage':'seals';if(enemy.move==='seals')enemy.seals=[-145,0,145].map(offset=>({x:Math.max(100,Math.min(860,this.player.x+offset)),y:this.player.y}));}
    }else{
      const route=[[272,256],[720,320],[480,365]],destination=route[enemy.patrolIndex],dx=destination[0]-enemy.x,dy=destination[1]-enemy.y,distance=Math.hypot(dx,dy);
      if(distance<30)enemy.patrolIndex=(enemy.patrolIndex+1)%route.length;else this.moveActor(enemy,dx/distance*enemy.speed*slow*dt,dy/distance*enemy.speed*slow*dt,enemy.radius);
    }
  }
  updateProjectiles(dt){
    const p=this.player;
    for(const bolt of this.projectiles){
      bolt.life-=dt;const previousX=bolt.x,previousY=bolt.y;
      if(bolt.kind==='weapon'||bolt.kind==='bullet'){
        const returning=bolt.kind==='weapon'&&bolt.returning;
        if(bolt.kind==='weapon')bolt.rotation+=dt*13;
        if(returning){
          const dx=p.x-bolt.x,dy=p.y-bolt.y,distance=Math.hypot(dx,dy);
          if(distance<22){
            bolt.life=0;this.onEvent('sound','recall');this.effects.push({kind:'switch',x:p.x,y:p.y-10,radius:25,life:.3,maxLife:.3,color:bolt.color});
            if(this.tutorial==='trial'&&!this.trialComplete){this.trialComplete=true;this.onEvent('tutorial','trial-complete');}
            continue;
          }
          bolt.vx=dx/distance*620;bolt.vy=dy/distance*620;
        }
        const step=returning?dt:Math.min(dt,Math.max(0,bolt.reach-bolt.travel)/bolt.speed);bolt.x+=bolt.vx*step;bolt.y+=bolt.vy*step;if(!returning)bolt.travel+=bolt.speed*step;
        if(!returning&&this.segmentBlocked(previousX,previousY,bolt.x,bolt.y,bolt.radius)){
          if(bolt.kind==='weapon'){bolt.x=previousX;bolt.y=previousY;bolt.returning=true;bolt.hits.clear();}else bolt.life=0;continue;
        }
        const candidates=this.enemies.filter(enemy=>enemy.hp>0&&!bolt.hits.has(enemy.id)&&this.segmentDistance(enemy.x,enemy.y,previousX,previousY,bolt.x,bolt.y)<=enemy.radius+bolt.radius).sort((a,b)=>Math.hypot(a.x-previousX,a.y-previousY)-Math.hypot(b.x-previousX,b.y-previousY));
        for(const enemy of candidates){if(this.segmentBlocked(previousX,previousY,enemy.x,enemy.y))continue;bolt.hits.add(enemy.id);this.hit(enemy,bolt.damage,bolt.context);if(this.tutorial==='trial')enemy[returning?'returnHits':'outboundHits']=(enemy[returning?'returnHits':'outboundHits']||0)+1;if(bolt.kind==='bullet'){bolt.life=0;break;}}
        if(bolt.context.recipe.fire)for(const grass of this.terrain.grass)if(this.segmentDistance(grass.x+16,grass.y+16,previousX,previousY,bolt.x,bolt.y)<=bolt.radius+22&&!this.segmentBlocked(previousX,previousY,grass.x+16,grass.y+16))this.lightGrass(grass,bolt.context.recipe.fire);
        if(!returning&&(bolt.travel>=bolt.reach||bolt.x<60||bolt.x>900||bolt.y<65||bolt.y>545)){if(bolt.kind==='weapon'){bolt.returning=true;bolt.hits.clear();}else bolt.life=0;}
        if(Math.random()<.6)this.particles.push({x:bolt.x,y:bolt.y,vx:0,vy:0,life:.2,maxLife:.2,color:bolt.color,size:2});
      }else{
        bolt.x+=bolt.vx*dt;bolt.y+=bolt.vy*dt;
        if(this.segmentBlocked(previousX,previousY,bolt.x,bolt.y,bolt.radius))bolt.life=0;
        else if(!this.preview&&this.segmentDistance(p.x,p.y,previousX,previousY,bolt.x,bolt.y)<bolt.radius+12){this.hurt(bolt.damage,bolt.x,bolt.y);bolt.life=0;}
        if(bolt.x<40||bolt.x>920||bolt.y<40||bolt.y>560)bolt.life=0;
      }
    }
    this.projectiles=this.projectiles.filter(bolt=>bolt.life>0);
  }
  applyBurn(enemy,amount,duration){if(enemy.burnTime<=0||amount>=enemy.burnDamage){enemy.burnDamage=amount;enemy.burnTime=duration;}}
  applySlow(enemy,amount,duration){if(enemy.slowTime<=0||amount>=enemy.slowAmount){enemy.slowAmount=amount;enemy.slowTime=duration;this.onEvent('sound','ice');}}
  hit(enemy,amount,context=this.attackContext()){
    const recipe=context.recipe,stats=context.stats;enemy.hitFlash=.13;this.hitStop=Math.max(this.hitStop,this.reducedMotion?.015:.025);this.shake=Math.max(this.shake,1.8);
    const cracked=context.formula==='thermal'&&enemy.crackTime>0&&enemy.crackSource===context.equipment.id;
    this.damage(enemy,amount*(cracked?1.1:1),true);this.onEvent('sound','hit');this.burst(enemy.x,enemy.y-7,this.elementColor(recipe),9,105);
    this.effects.push({kind:'impact',x:enemy.x,y:enemy.y-16,radius:19,life:.14,maxLife:.14,color:'#fff2cb'});
    if(enemy.hp>0&&enemy.type!=='dummy'){const dx=enemy.x-this.player.x,dy=enemy.y-this.player.y,distance=Math.hypot(dx,dy)||1;this.moveActor(enemy,dx/distance*6,dy/distance*6,enemy.radius);}
    if(recipe.fire>0)this.applyBurn(enemy,3*recipe.fire,stats.burnDuration);
    if(recipe.ice>0)this.applySlow(enemy,.35*recipe.ice,stats.slowDuration);
    if(context.formula==='thermal'){enemy.crackTime=2;enemy.crackSource=context.equipment.id;}
    if(recipe.electric>0&&!context.chainUsed){context.chainUsed=true;this.chainLightning(enemy,context);}
  }
  chainLightning(origin,context){
    const range=context.stats.chainRange;
    const choose=(from,exclude,wetOnly=false)=>this.enemies.filter(enemy=>enemy.hp>0&&!exclude.includes(enemy)&&(!wetOnly||enemy.wetTime>0)&&Math.hypot(enemy.x-from.x,enemy.y-from.y)<=range&&!this.segmentBlocked(from.x,from.y,enemy.x,enemy.y)).sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y))[0];
    const first=choose(origin,[origin]);if(!first)return;
    this.electricHit(origin,first,6*context.recipe.electric);
    if(context.formula==='emberwire')this.applyBurn(first,1.5*context.recipe.fire,context.stats.burnDuration);
    if(context.formula==='frostwire')this.applySlow(first,.175*context.recipe.ice,context.stats.slowDuration);
    if(origin.wetTime>0){const second=choose(first,[origin,first],true);if(second)this.electricHit(first,second,3*context.recipe.electric);}
  }
  electricHit(from,to,amount){this.effects.push({kind:'arc',x:from.x,y:from.y-12,x2:to.x,y2:to.y-12,life:.2,maxLife:.2,color:'#ffe491'});to.hitFlash=.1;this.onEvent('sound','electric');this.damage(to,amount*(to.wetTime>0?1.5:1),true);}
  damage(enemy,amount,show){
    if(enemy.hp<=0)return;enemy.hp-=amount;this.damageDealt+=amount;if(this.preview&&enemy.type==='dummy')enemy.hp=Math.max(1,enemy.hp);
    if(show)this.texts.push({x:enemy.x+(Math.random()-.5)*12,y:enemy.y-enemy.radius-12,text:amount<1?amount.toFixed(1):String(Math.round(amount)),color:'#f5f5de',life:.7,maxLife:.7});
    if(enemy.hp<=0){this.kills++;this.hitStop=Math.max(this.hitStop,this.reducedMotion?.025:.045);this.shake=Math.max(this.shake,2.6);this.combo=this.comboTime>0?this.combo+1:1;this.comboTime=2.7;this.comboDisplay=1.1;this.onEvent('sound','death');if(this.combo>1)this.onEvent('sound','combo'+Math.min(5,this.combo));this.burst(enemy.x,enemy.y,enemy.color,20,125);this.effects.push({kind:'ring',x:enemy.x,y:enemy.y,radius:25,life:.25,maxLife:.25,color:enemy.color},{kind:'defeat',type:enemy.type,boss:enemy.boss,facing:enemy.facing,x:enemy.x,y:enemy.y,life:.13,maxLife:.13,color:'#fff2cb'});if(enemy.boss)this.bossDefeated=true;
      for(let i=0;i<5;i++)this.collections.push({x:enemy.x+(Math.random()-.5)*30,y:enemy.y-12+(Math.random()-.5)*25,delay:.18+i*.045,life:1.1+i*.06,color:this.elementColor(),size:3+i%3});
      if(enemy.type==='splitter')for(const offset of [-17,17]){this.addEnemy('bit',Math.max(85,Math.min(875,enemy.x+offset)),Math.max(100,Math.min(515,enemy.y)));this.total++;}
    }
  }
  hurt(amount,x,y){
    const p=this.player;if(p.invulnerable>0||p.hp<=0)return;amount=Math.round(amount*.9**Forge.upgradeRank(this.upgrades,'coat'));p.hp=Math.max(0,p.hp-amount);p.invulnerable=.78;this.shake=5;this.onEvent('sound','hurt');this.burst(p.x,p.y,'#f99b8c',12,100);this.texts.push({x:p.x,y:p.y-37,text:'−'+amount,color:'#ffb0a0',life:.8,maxLife:.8});
    const dx=p.x-x,dy=p.y-y,distance=Math.hypot(dx,dy)||1;this.moveActor(p,dx/distance*18,dy/distance*18,12);
  }
  elementColor(recipe=this.equipment?.recipe){if(!recipe||!(recipe.fire+recipe.ice+recipe.electric))return '#b5ecd2';let key='ice';if(recipe.fire>recipe.ice)key='fire';if(recipe.electric>recipe[key])key='electric';return Forge.ELEMENTS[key].color;}
  burst(x,y,color,count,speed){for(let i=0;i<count;i++){const angle=Math.random()*Math.PI*2,velocity=(.2+Math.random()*.8)*speed,life=.2+Math.random()*.35;this.particles.push({x,y,vx:Math.cos(angle)*velocity,vy:Math.sin(angle)*velocity,life,maxLife:life,color,size:2+Math.floor(Math.random()*3)});}}
  animateEffects(dt){
    this.shake=Math.max(0,this.shake-dt*28);
    this.comboTime=Math.max(0,this.comboTime-dt);this.comboDisplay=Math.max(0,this.comboDisplay-dt);
    for(const fleck of this.collections){
      fleck.life-=dt;fleck.delay-=dt;if(fleck.delay>0)continue;
      const dx=this.player.x-fleck.x,dy=this.player.y-20-fleck.y;fleck.x+=dx*Math.min(1,dt*9);fleck.y+=dy*Math.min(1,dt*9);
      if(Math.hypot(dx,dy)<8){fleck.life=0;this.onEvent('sound','collect');}
    }
    this.collections=this.collections.filter(fleck=>fleck.life>0);
    for(const particle of this.particles){particle.life-=dt;particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;particle.vx*=.93;particle.vy*=.93;}this.particles=this.particles.filter(particle=>particle.life>0);
    for(const text of this.texts){text.life-=dt;text.y-=dt*28;}this.texts=this.texts.filter(text=>text.life>0);
    for(const effect of this.effects)effect.life-=dt;this.effects=this.effects.filter(effect=>effect.life>0);
    for(const ghost of this.ghosts)ghost.life-=dt;this.ghosts=this.ghosts.filter(ghost=>ghost.life>0);
    if(this.slash){this.slash.life-=dt;if(this.slash.life<=0)this.slash=null;}
  }
};
