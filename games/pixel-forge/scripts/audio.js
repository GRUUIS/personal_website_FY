'use strict';

// Original procedural sound design. No samples, recordings, or external music.
Forge.Audio = class {
  constructor(){
    this.enabled=false;this.context=null;this.volume=.55;this.paused=false;
    this.environment='plain';this.ambience=null;this.birdTimer=null;
    this.lastEvent=new Map();this.voices=new Set();
  }
  unlock(){
    if(!this.context){
      const c=this.context=new (window.AudioContext||window.webkitAudioContext)();
      this.master=c.createGain();this.master.gain.value=this.volume;
      const limiter=c.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=20;limiter.ratio.value=3;
      this.master.connect(limiter);limiter.connect(c.destination);
      this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);
      const samples=this.noise.getChannelData(0);
      for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*.5;
    }
    if(this.context.state==='suspended')this.context.resume();
    if(this.enabled&&!this.paused&&!this.ambience)this.startEnvironment();
  }
  toggle(){
    this.enabled=!this.enabled;
    if(this.enabled){this.unlock();this.play('choose');}
    else{this.stopEnvironment();this.stopVoices();}
    return this.enabled;
  }
  setVolume(volume){
    this.volume=volume;
    if(this.context)this.master.gain.setTargetAtTime(volume,this.context.currentTime,.035);
  }
  setPaused(paused){
    if(this.paused===paused)return;
    this.paused=paused;
    if(paused){this.stopEnvironment();this.stopVoices();}
    else if(this.enabled){this.unlock();}
  }
  setEnvironment(theme){
    if(this.environment===theme)return;
    this.environment=theme;this.stopEnvironment();
    if(this.enabled&&!this.paused)this.startEnvironment();
  }
  track(source,nodes){
    this.voices.add(source);source.forgeGain=nodes[nodes.length-1];
    source.onended=()=>{this.voices.delete(source);for(const node of nodes)node.disconnect();};
  }
  stopVoices(){
    if(!this.context)return;
    const t=this.context.currentTime;
    for(const voice of this.voices){voice.forgeGain.gain.cancelScheduledValues(t);voice.forgeGain.gain.setTargetAtTime(.0001,t,.006);voice.stop(t+.035);}
    this.voices.clear();
  }
  tone(from,to,duration,volume,type='triangle',delay=0){
    const c=this.context,t=c.currentTime+delay,osc=c.createOscillator(),gain=c.createGain();
    osc.type=type;osc.frequency.setValueAtTime(from,t);osc.frequency.exponentialRampToValueAtTime(to,t+duration);
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain);gain.connect(this.master);this.track(osc,[osc,gain]);osc.start(t);osc.stop(t+duration+.01);
  }
  breath(duration,volume,frequency=900,delay=0){
    const c=this.context,t=c.currentTime+delay,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
    source.buffer=this.noise;filter.type='lowpass';filter.frequency.value=frequency;filter.Q.value=.5;
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    source.connect(filter);filter.connect(gain);gain.connect(this.master);this.track(source,[source,filter,gain]);source.start(t);source.stop(t+duration+.015);
  }
  play(kind){
    if(!this.enabled||this.paused)return;
    kind={switch:'equip',clear:'win',upgrade:'unlock',export:'save'}[kind]||kind;
    this.unlock();
    if(kind.startsWith('combo')){
      const pitch=[0,0,440,554,659,784][Number(kind.slice(5))];this.tone(pitch,pitch,.14,.04,'sine');this.tone(pitch*1.5,pitch*1.5,.16,.025,'sine',.07);return;
    }
    const t=this.context.currentTime,group=['hit','fire','ice','electric'].includes(kind)?kind:'event:'+kind;
    const interval={paint:.04,hit:.065,fire:.14,ice:.12,electric:.12,warning:.4,death:.12,collect:.085}[kind]||.025;
    if(t-(this.lastEvent.get(group)??-1)<interval)return;
    this.lastEvent.set(group,t);
    const tones={
      paint:[640,490,.045,.045],choose:[490,660,.09,.06],return:[540,390,.1,.055],
      save:[520,690,.13,.06],equip:[370,580,.13,.06],throw:[340,200,.13,.065],
      recall:[520,350,.1,.04],slash:[220,95,.115,.075],shoot:[660,280,.09,.06],
      spear:[390,165,.12,.065],hammer:[115,48,.24,.11],charge:[115,240,.25,.05],
      hit:[215,78,.065,.085],hurt:[130,66,.2,.075],dash:[370,610,.12,.045],collect:[760,1120,.09,.024],
      fire:[190,100,.19,.04],ice:[820,640,.18,.045],electric:[480,870,.115,.045],
      warning:[270,260,.19,.065],death:[220,75,.2,.06],lose:[290,115,.45,.075],
      win:[440,660,.25,.07],unlock:[550,830,.2,.06]
    };
    const tone=tones[kind]||tones.choose;
    this.tone(...tone,kind==='ice'||kind==='warning'?'sine':'triangle');
    if(['slash','throw','dash','spear'].includes(kind))this.breath(.11,.09,1100);
    if(['hit','hammer','hurt','death'].includes(kind))this.breath(kind==='hammer'?.22:.075,kind==='hammer'?.17:.09,kind==='hammer'?360:680);
    if(kind==='hit')this.tone(760,450,.035,.025,'square');
    if(kind==='fire')this.breath(.22,.1,900);
    if(kind==='electric')this.tone(940,650,.07,.026,'sine',.035);
    if(kind==='ice')this.tone(1090,820,.16,.021,'sine',.04);
    if(kind==='save'||kind==='equip')this.tone(740,740,.14,.035,'sine',.09);
    if(kind==='unlock'||kind==='win'){
      this.tone(660,660,.25,.045,'sine',.12);this.tone(880,880,.36,.04,'sine',.24);
    }
    if(kind==='lose')this.tone(185,90,.4,.04,'sine',.18);
  }
  startEnvironment(){
    if(!this.context||!this.enabled||this.paused)return;
    const c=this.context,t=c.currentTime,theme=this.environment;
    const settings={plain:[500,.018,.16],forest:[760,.046,.19],waterfall:[2050,.067,.12],cave:[310,.03,.09],forge:[940,.049,.21],border:[1150,.05,.15]};
    const [frequency,volume,speed]=settings[theme]||settings.plain;
    const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),lfo=c.createOscillator(),motion=c.createGain();
    source.buffer=this.noise;source.loop=true;filter.type='lowpass';filter.frequency.value=frequency;filter.Q.value=.4;
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.65);
    lfo.frequency.value=speed;motion.gain.value=volume*.18;lfo.connect(motion);motion.connect(gain.gain);
    source.connect(filter);filter.connect(gain);gain.connect(this.master);
    const nodes=[source,filter,gain,lfo,motion];this.ambience={source,lfo,gain,nodes};
    source.onended=()=>{for(const node of nodes)node.disconnect();};
    source.start();lfo.start();
    if(theme==='forest'||theme==='plain'||theme==='border')this.scheduleBird();
  }
  stopEnvironment(){
    clearTimeout(this.birdTimer);this.birdTimer=null;
    if(!this.ambience)return;
    const {source,lfo,gain}=this.ambience,t=this.context.currentTime;
    gain.gain.cancelScheduledValues(t);gain.gain.setTargetAtTime(0,t,.035);
    source.stop(t+.16);lfo.stop(t+.16);this.ambience=null;
  }
  scheduleBird(){
    this.birdTimer=setTimeout(()=>{
      if(!this.enabled||this.paused)return;
      this.tone(1250,1750,.13,.012,'sine');this.tone(1630,1190,.17,.011,'sine',.17);
      this.scheduleBird();
    },4200+Math.random()*3800);
  }
};
