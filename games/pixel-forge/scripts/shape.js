'use strict';

// Artwork bounds are presentation information. Combat never reads these values.
Forge.EMPTY_SHAPE = {length:0,width:0,area:0};
Forge.measureShape = function(pixels,size=Math.sqrt(pixels.length)){
  let left=size,top=size,right=-1,bottom=-1,area=0;
  pixels.forEach((value,index)=>{if(value){const x=index%size,y=Math.floor(index/size);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);area++;}});
  return area?{length:Math.max(right-left+1,bottom-top+1),width:Math.min(right-left+1,bottom-top+1),area,left,top,right,bottom}:{...Forge.EMPTY_SHAPE};
};

Forge.weaponStats = function(mode='slash',craft='balanced'){
  const weapon=Forge.WEAPONS[mode],work=Forge.CRAFTS[craft];
  return {
    damage:weapon.damage*work.damage,interval:weapon.interval*work.interval,reach:weapon.reach,
    slashRange:90,slashArc:110*Math.PI/180*work.coverage,
    throwRadius:18*work.coverage,bulletRadius:6*work.coverage,
    spearLength:155,spearWidth:24*work.coverage,
    hammerReach:80,hammerRadius:52*work.coverage,hammerWindup:.30,
    speed:190,dashCooldown:2,burnDuration:2,slowDuration:1.5,chainRange:120,chainTargets:1
  };
};

// Retained for old callers: shape is deliberately ignored.
Forge.shapeStats = function(shape,mode='slash',craft='balanced'){return Forge.weaponStats(mode,craft);};
