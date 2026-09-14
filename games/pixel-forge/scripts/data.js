'use strict';
window.Forge = {};
Forge.PALETTE = [null,
 {hex:'#17283a',name:'墨黑',element:'neutral'}, {hex:'#eaf4df',name:'米白',element:'neutral'}, {hex:'#b99b79',name:'木棕',element:'neutral'},
 {hex:'#bf4256',name:'莓红',element:'fire'}, {hex:'#f37569',name:'珊瑚',element:'fire'}, {hex:'#ffd0a1',name:'晨光',element:'fire'},
 {hex:'#3159a8',name:'深海',element:'ice'}, {hex:'#53bce9',name:'冰蓝',element:'ice'}, {hex:'#b0f2ed',name:'薄荷冰',element:'ice'},
 {hex:'#be8539',name:'琥珀',element:'electric'}, {hex:'#f5c95b',name:'金黄',element:'electric'}, {hex:'#fff0ba',name:'星光',element:'electric'}
];
Forge.ELEMENTS = {fire:{name:'火',color:'#f37569'},ice:{name:'冰',color:'#53bce9'},electric:{name:'电',color:'#f5c95b'}};
Forge.recipe = function(pixels){
 const counts={fire:0,ice:0,electric:0};
 for(const pixel of pixels){const element=Forge.PALETTE[pixel]?.element;if(element&&element!=='neutral')counts[element]++;}
 const total=counts.fire+counts.ice+counts.electric;
 return {fire:total?counts.fire/total:0,ice:total?counts.ice/total:0,electric:total?counts.electric/total:0};
};
Forge.WEAPONS = {
 slash:{name:'挥刃',unlock:1,damage:18,interval:.70,reach:90,description:'近身扇形挥砍，一次扫过多名敌人',label:'扇形挥砍'},
 throw:{name:'回旋器',unlock:2,damage:12,interval:1.10,reach:260,description:'旋转飞出再返回，去回各命中一次',label:'往返回旋'},
 shoot:{name:'发射器',unlock:4,damage:11,interval:.50,reach:360,description:'发射直线弹丸，击中首个敌人后消失',label:'直线射击'},
 spear:{name:'长枪',unlock:6,damage:23,interval:.95,reach:155,description:'直线突刺，贯穿同一列敌人',label:'贯穿突刺'},
 hammer:{name:'重锤',unlock:8,damage:34,interval:1.40,reach:80,description:'蓄力砸击圆形区域，可用闪避取消',label:'蓄力砸击'}
};
Forge.CRAFTS = {
 balanced:{name:'均衡',damage:1,interval:1,coverage:1,description:'标准伤害、节奏与覆盖'},
 swift:{name:'轻巧',damage:.8,interval:.85,coverage:1,description:'直接伤害 −20%，攻击间隔 −15%'},
 wide:{name:'宽幅',damage:.9,interval:1.1,coverage:1.2,description:'覆盖 +20%，伤害 −10%，间隔 +10%'}
};
Forge.FORMULAS = {
 emberwire:{name:'余烬导线',elements:['fire','electric'],description:'电弧第一跳附带半强度灼烧'},
 frostwire:{name:'霜电回路',elements:['ice','electric'],description:'电弧第一跳附带半强度减速'},
 thermal:{name:'冷热裂纹',elements:['fire','ice'],description:'留下2秒裂纹，同件武器后续直接伤害 +10%'}
};
Forge.formulaActive = (id,recipe)=>!!id&&Forge.FORMULAS[id].elements.every(element=>recipe[element]>=.25);
Forge.unlocks = function(level){
 const colorLevels={1:1,2:1,3:7,4:2,5:1,6:5,7:5,8:3,9:6,10:6,11:4,12:8};
 return {size:level>=9?24:level>=6?16:level>=3?12:8,colors:Forge.PALETTE.map((_,i)=>i).filter(i=>i&&colorLevels[i]<=level),modes:Object.keys(Forge.WEAPONS).filter(key=>Forge.WEAPONS[key].unlock<=level),slots:level>=4?2:1};
};
Forge.PRESETS = [];
function forgePreset(id,name,mode,unlock,size,rows){
 const width=rows[0].length,top=Math.floor((size-rows.length)/2),left=Math.floor((size-width)/2),map=Array(size).fill('.'.repeat(size));
 rows.forEach((row,y)=>{map[y+top]='.'.repeat(left)+row+'.'.repeat(size-left-width);});
 Forge.PRESETS.push({id,name,mode,unlock,size,map});
}
forgePreset('sword','珊瑚短剑','slash',1,8,['....15..','...155..','..155...','.155....','11511...','..11....','..11....','........']);
forgePreset('carrot','林火胡萝卜','slash',1,8,['..121...','..111...','.15551..','.15551..','..1551..','..1551..','...11...','........']);
forgePreset('star','落日飞星','throw',2,8,['...11...','..1441..','11154111','14555541','.145541.','..1551..','.144441.','..1..1..']);
forgePreset('pop','冰棒回旋器','throw',3,12,['..1111..','.188881.','.182881.','.188881.','.188881.','..1111..','...11...','...11...']);
forgePreset('fish','瀑布鱼骨杖','shoot',4,12,['......11','..1111B1','.1B1BB11','11BBB1..','.1B1BB11','..1111B1','....1.11','....1...']);
forgePreset('bubble','泡泡发射器','shoot',4,12,['..1111..','.18BB81.','11811811','188BB881','18888881','.111111.','..11....','..11....']);
forgePreset('fork','寒星长叉','spear',6,16,['1...1...1','18.18.181','18.18.181','188888881','.1118111.','....81...','....81...','....81...','....81...','....81...','....11...']);
forgePreset('umbrella','冰纹雨伞','spear',6,16,['....11....','..118811..','.18888881.','1888888881','1111811111','....81....','....81....','....81....','....81....','....811...','.....11...']);
forgePreset('lolly','星光棒棒锤','hammer',8,16,['..111111..','.1BCCCB1.1','1BCCBCBBC1','1CBCBCCBC1','1BCCBCBBC1','.1BCCCB1.1','..111111..','....33....','....33....','....33....','....11....']);
forgePreset('mushroom','珊瑚蘑菇锤','hammer',8,16,['...1111...','.11555511.','1552552551','1555555551','.11111111.','....33....','....33....','....33....','....11....']);
Forge.presetPixels = preset=>preset.map.join('').split('').map(value=>value==='.'?0:parseInt(value,16));
Forge.DEFAULT_PROJECTILE = ['..11..','.1BB1.','1BCCB1','1BCCB1','.1BB1.','..11..'].join('').split('').map(value=>value==='.'?0:parseInt(value,16));
Forge.LEVELS = [
 {name:'工坊草地',theme:'plain',chapter:0,hint:'带上你画的第一件武器。移动靠近墨团，空格闪避。',intro:'靠近敌人会自动攻击，使用闪避躲开伤害',enemies:['slime','slime','slime','bit','slime','slime'],interval:1.6},
 {name:'纸叶林入口',theme:'forest',chapter:0,hint:'火沿相邻草丛传播，石路隔断火势。试试回旋器的路线。',intro:'火焰沿相邻草丛传播，石路隔断火势',enemies:['slime','runner','bit','bit','slime','runner','bit','slime','runner'],interval:1.3},
 {name:'林心守卫',theme:'forest',chapter:0,hint:'躲开守卫的砸地预警。草火清小怪，冰减速追兵。',intro:'躲开砸地预警，用火清怪或用冰减速',enemies:['boss'],interval:1},
 {name:'雾瀑浅滩',theme:'waterfall',chapter:1,hint:'水滴表示潮湿：电弧增强，灼烧减弱。Q 切换备用武器。',intro:'潮湿敌人受到更强电弧、更弱灼烧',enemies:['slime','runner','shooter','slime','runner','shooter','bit','bit','runner'],interval:1.4},
 {name:'瀑边哨站',theme:'waterfall',chapter:1,hint:'干岩台不受水雾影响。比较两把武器，优先清理后排哨兵。',intro:'按湿区和干地切换武器，优先处理远程敌人',enemies:['shooter','runner','slime','shooter','runner','bit','bit','shooter','runner','slime','shooter'],interval:1.2,hpScale:1.1},
 {name:'回声石廊',theme:'cave',chapter:2,hint:'石墙形成狭长通道。让敌人排成一列，再用长枪突刺。',intro:'用长枪贯穿通道中排成一列的敌人',enemies:['runner','slime','runner','shooter','slime','runner','shooter','slime','runner','shooter','runner'],interval:1.2,hpScale:1.12},
 {name:'分裂岩室',theme:'cave',chapter:2,hint:'大墨团倒下后分成小怪。突刺与回旋可以守住通道。',intro:'大墨团被击败后会分裂，注意后续小怪',enemies:['splitter','bit','bit','splitter','runner','shooter','splitter','bit','splitter','runner','splitter'],interval:1.3,hpScale:1.16},
 {name:'旧熔炉入口',theme:'forge',chapter:3,hint:'重锤蓄力期间走得更慢，闪避可取消。等怪群聚拢后落锤。',intro:'重锤适合集中敌群，闪避可以取消蓄力',enemies:['splitter','slime','spitter','runner','splitter','slime','spitter','runner','splitter','spitter','slime'],interval:1.2,hpScale:1.16},
 {name:'熔炉守门人',theme:'forge',chapter:3,hint:'炮手的三道预警会变成散弹。利用石柱遮挡，逐群击破。',intro:'利用石柱遮挡，躲开炮手的散弹预警',enemies:['runner','spitter','splitter','shooter','runner','splitter','spitter','runner','splitter','spitter','shooter','splitter'],interval:1.1,hpScale:1.3,damageScale:1.1},
 {name:'画册交界',theme:'border',chapter:4,hint:'墨王游走在草丛、浅水和干地。换上适合当前区域的作品。',intro:'观察首领所在区域，切换适合的元素武器',enemies:['inklord'],interval:1}
];
Forge.CHAPTERS = [{name:'第一章 · 纸叶林',code:'INKWOOD'},{name:'第二章 · 雾瀑',code:'WATERFALL'},{name:'第三章 · 回声石窟',code:'CAVERN'},{name:'第四章 · 旧熔炉',code:'FOUNDRY'},{name:'终章 · 画册交界',code:'CONFLUENCE'}];
Forge.isFinalLevel = index=>index===Forge.LEVELS.length-1;
Forge.ENEMIES = {
 slime:{hp:34,speed:65,damage:10,radius:14,color:'#b08ada'},runner:{hp:37,speed:83,damage:14,radius:14,color:'#f5a282'},
 bit:{hp:19,speed:97,damage:7,radius:10,color:'#9b9fe7'},shooter:{hp:43,speed:45,damage:10,radius:15,color:'#df8fb2'},
 spitter:{hp:55,speed:38,damage:11,radius:17,color:'#e5a5d8'},splitter:{hp:65,speed:56,damage:13,radius:22,color:'#77bdb5'},
 boss:{hp:390,speed:43,damage:18,radius:32,color:'#b6cc92',boss:true},inklord:{hp:1000,speed:50,damage:20,radius:35,color:'#c796ea',boss:true},
 dummy:{hp:10000,speed:0,damage:0,radius:15,color:'#b99b79'}
};
Forge.UPGRADES = [
 {id:'quick',name:'快干墨',description:'攻击间隔 −10%',color:8,maxRank:2},
 {id:'power',name:'浓缩颜料',description:'直接伤害 +10%',color:5,maxRank:2},
 {id:'coat',name:'防水涂层',description:'受到的伤害 −10%',color:3,maxRank:2},
 {id:'ember',name:'余烬墨',description:'灼烧持续时间 +1 秒',color:4,element:'fire',maxRank:1},
 {id:'frost',name:'冰纹墨',description:'减速持续时间 +0.5 秒',color:9,element:'ice',maxRank:1},
 {id:'arc',name:'导电墨',description:'电弧寻找距离 +20%',color:11,element:'electric',maxRank:1},
 {id:'step',name:'轻盈步伐',description:'闪避冷却 −15%',color:12,maxRank:1},
 {id:'reach',name:'回旋长线',description:'回旋航程 +15%',color:7,mode:'throw',maxRank:1},
 {id:'vital',name:'厚实画纸',description:'每关最大生命 +10',color:2,maxRank:3,fallback:true},
 {id:'stride',name:'踏墨轻步',description:'移动速度 +5%',color:9,maxRank:3,fallback:true},
 {id:'focus',name:'沉着落笔',description:'直接伤害 +4%',color:6,maxRank:3,fallback:true}
];
Forge.upgradeRank = (owned,id)=>owned.filter(value=>value===id).length;
Forge.upgradeChoices = function(owned,loadout){
 const artworks=loadout.map(art=>({...art,recipe:Forge.recipe(art.pixels)}));
 const available=Forge.UPGRADES.filter(upgrade=>Forge.upgradeRank(owned,upgrade.id)<upgrade.maxRank&&(!upgrade.mode||artworks.some(art=>art.mode===upgrade.mode))&&(!upgrade.element||artworks.some(art=>art.recipe[upgrade.element]>0)));
 const shuffle=items=>items.map(item=>({item,order:Math.random()})).sort((a,b)=>a.order-b.order).map(entry=>entry.item);
 return [...shuffle(available.filter(upgrade=>!upgrade.fallback)),...shuffle(available.filter(upgrade=>upgrade.fallback))].slice(0,3);
};

Forge.createTerrain = function(theme='plain'){
 const terrain={theme,grass:[],wetZones:[],obstacles:[],hazards:[]};
 const patch=(x,y,columns,rows)=>{for(let row=0;row<rows;row++)for(let column=0;column<columns;column++)terrain.grass.push({x:x+column*32,y:y+row*32,size:32,state:'fresh',time:0,strength:0,spreadClock:0});};
 if(theme==='forest'){
  patch(144,144,8,4);patch(528,144,9,4);patch(176,368,8,4);patch(560,368,8,4);
  terrain.obstacles=[{x:96,y:280,w:96,h:48},{x:768,y:280,w:96,h:48},{x:432,y:136,w:64,h:112}];
 }else if(theme==='waterfall'){
  terrain.wetZones=[{x:96,y:128,w:288,h:352},{x:576,y:128,w:288,h:352}];
  terrain.obstacles=[{x:208,y:256,w:80,h:48},{x:680,y:352,w:80,h:48},{x:448,y:128,w:64,h:80}];
 }else if(theme==='cave'){
  terrain.obstacles=[{x:176,y:144,w:608,h:88},{x:176,y:408,w:608,h:80}];
 }else if(theme==='forge'){
  terrain.obstacles=[{x:256,y:176,w:80,h:72},{x:624,y:176,w:80,h:72},{x:256,y:408,w:80,h:72},{x:624,y:408,w:80,h:72}];
 }else if(theme==='border'){
  patch(144,144,7,5);patch(144,368,7,4);
  terrain.wetZones=[{x:624,y:128,w:224,h:352}];
  terrain.obstacles=[{x:432,y:136,w:64,h:64},{x:432,y:424,w:64,h:64}];
 }
 return terrain;
};

