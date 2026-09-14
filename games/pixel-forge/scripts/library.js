'use strict';
Forge.copy = value => JSON.parse(JSON.stringify(value));
Forge.WorkshopStore = class {
  constructor(storage,options={}){
    this.storage=storage;this.test=!!options.test;this.key=this.test?'pixel-forge-test-v5':'pixel-forge-save-v4';this.error=false;
    let saved=null,legacy=null;
    try{saved=JSON.parse(storage.getItem(this.key));if(!saved&&!this.test)legacy=JSON.parse(storage.getItem('pixel-forge-art-v1'));}catch{}
    this.data=saved||this.freshData();
    this.migrated=false;
    if(!saved&&legacy?.pixels?.length===256){
      const work=this.create({name:legacy.name||'旧日的作品',mode:legacy.mode==='slash'?'slash':'throw',size:16,pixels:legacy.pixels});
      this.data.level=8;this.data.loadout=[work.id];this.migrated=true;
    }
    if(!this.data.onboarding){
      const preset=Forge.PRESETS.find(p=>p.mode==='slash'&&p.unlock<=1),pixels=Forge.presetPixels(preset);
      const started=this.data.level>1||this.data.cleared.length>0||this.data.run.active||this.data.run.level>0||this.data.run.rewardPending||this.data.run.complete||this.data.works.length>1||this.data.works.some(work=>work.draft||work.name!==preset.name||work.mode!==preset.mode||work.size!==preset.size||work.pixels.some((pixel,index)=>pixel!==pixels[index]));
      this.data.onboarding={complete:!!started,step:started?'complete':'story',workId:this.data.loadout[0]||null,rewardWorkId:null};
    }
    if(this.migrated)this.data.onboarding={complete:true,step:'complete',workId:this.data.loadout[0],rewardWorkId:null};
    this.data.version=5;
    this.addStarter();
    this.save();
  }
  freshData(){
    return {version:5,level:1,cleared:[],works:[],loadout:[],onboarding:{complete:false,step:'story',workId:null,rewardWorkId:null},run:{level:0,upgrades:[],active:false,rewardPending:false,choices:[],complete:false}};
  }
  addStarter(){
    if(!this.data.works.length){
      const preset=Forge.PRESETS.find(p=>p.mode==='slash'&&p.unlock<=1);
      const work=this.create({name:preset.name,mode:preset.mode,size:preset.size,pixels:Forge.presetPixels(preset)});
      this.data.loadout=[work.id];
    }
  }
  resetTest(){
    const target=this.test?this:new Forge.WorkshopStore(this.storage,{test:true});
    target.data=target.freshData();target.migrated=false;target.addStarter();target.save();return target;
  }
  create(source){
    const size=source.size||Forge.unlocks(this.data.level).size;
    const pixels=(source.pixels||Array(size*size).fill(0)).slice();
    const work={id:'work-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),name:source.name||'新的作品',mode:source.mode||'slash',craft:source.craft||'balanced',size,pixels,layers:source.layers?Forge.copy(source.layers):[pixels.slice(),Array(size*size).fill(0)],formula:source.formula||'',anchors:Forge.copy(source.anchors||{grip:{x:.25,y:.75},muzzle:{x:.8,y:.2}}),projectileSize:source.projectileSize||8,projectilePixels:source.projectilePixels?.slice()||[...Array(64)].map((_,i)=>[19,20,26,27,28,29,34,35,36,37,43,44].includes(i)?5:0)};
    this.data.works.push(work);return work;
  }
  work(id){return this.data.works.find(w=>w.id===id);}
  equipment(id){const work=Forge.copy(this.work(id));delete work.draft;work.recipe=Forge.recipe(work.pixels);return work;}
  draft(id){const work=this.work(id);const draft=Forge.copy(work.draft||work);delete draft.draft;return draft;}
  keepDraft(id,draft){this.work(id).draft=Forge.copy(draft);}
  commit(id,draft){const work=this.work(id);Object.assign(work,Forge.copy(draft));delete work.draft;this.save();return work;}
  duplicate(id){const source=this.draft(id);source.name=source.name.slice(0,14)+' · 副本';const copy=this.create(source);this.save();return copy;}
  equip(id,slot){
    if(slot===1&&Forge.unlocks(this.data.level).slots<2)return;
    const existing=this.data.loadout.indexOf(id);
    if(existing>=0&&existing!==slot){const old=this.data.loadout[slot];this.data.loadout[existing]=old;}
    this.data.loadout[slot]=id;this.data.loadout=this.data.loadout.filter(Boolean);this.save();
  }
  loadout(){return this.data.loadout.slice(0,Forge.unlocks(this.data.level).slots).map(id=>this.equipment(id));}
  remove(id){
    if(this.data.works.length===1)return;
    this.data.works=this.data.works.filter(w=>w.id!==id);this.data.loadout=this.data.loadout.filter(w=>w!==id);
    if(!this.data.loadout.length)this.data.loadout=[this.data.works[0].id];this.save();
  }
  clearStage(index){
    const old=this.data.level;
    if(!this.data.cleared.includes(index)){this.data.cleared.push(index);this.data.level=Math.min(10,old+1);}
    this.save();return {from:old,to:this.data.level};
  }
  unlockFirstReward(sourceId){
    const onboarding=this.data.onboarding;
    if(onboarding.rewardWorkId)return this.work(onboarding.rewardWorkId);
    const source=this.work(sourceId),reward=this.create({...source,name:'我的第一把回旋器',mode:'throw'});
    onboarding.workId=sourceId;onboarding.rewardWorkId=reward.id;onboarding.step='trial';
    this.equip(reward.id,0);return reward;
  }
  completeOnboarding(){
    this.data.onboarding.complete=true;this.data.onboarding.step='complete';this.save();
  }
  newJourney(){this.data.run={level:0,upgrades:[],active:false,rewardPending:false,choices:[],complete:false};this.save();}
  save(){try{this.storage.setItem(this.key,JSON.stringify(this.data));this.error=false;}catch{this.error=true;}}
};
