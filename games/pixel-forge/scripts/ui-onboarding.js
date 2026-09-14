'use strict';

Forge.createOnboarding = ({store, audio, active, actions}) => {
  const {$, thumb} = Forge.UI;
  const progress = () => store.data.onboarding;
  let phase = 'story', age = 0, destination = null, paused = false;
  let loading = false, editingReward = false, draft = null;
  const keys = new Set();
  const lesson = new Forge.Game(onGameEvent);
  const renderer = new Forge.Renderer($('introWorld'), lesson);
  const editor = new Forge.Editor($('introPaintCanvas'), () => {
    if (loading || !draft) return;
    Object.assign(draft, editor.exportArtwork());
    store.keepDraft(draft.id, draft);
    store.save();
    refreshPainting();
    audio.play('paint');
  }, () => {});
  editor.setAllowedColors([5]);

  const copy = {
    story: ['失色的森林', '墨怪夺走了颜色。画一把武器，把森林救回来。', '画出第一把武器 →'],
    draw: ['小小工坊', '添一笔红色，给武器注入火焰。', '带上我的火剑 →'],
    awaken: ['火剑诞生', '看，你画的武器已经握在手里了。', ''],
    first: ['纸叶林', '点击地面移动。靠近墨怪，火剑会自动攻击。', '走近墨怪 →'],
    pack: ['纸叶林', '把火带到草丛边，看看会发生什么。', '走到草丛边 →'],
    restore: ['纸叶林', '你做到了。被墨怪夺走的颜色，正在回到森林。', ''],
    unlock: ['首场胜利', '这是你的首胜奖励。带上刚才的作品，试试回旋攻击。', '马上试试回旋器 →'],
    trial: ['回旋器试用', '走近木桩，试试飞出再返回的攻击。', '走近木桩 →'],
    complete: ['新的旅程', '搜集散落的颜色，探索更多的区域。', '选把武器再出发 →']
  };

  function renderPhase(next, persist = true) {
    phase = next;
    age = 0;
    destination = null;
    keys.clear();
    paused = false;
    if (persist) {
      progress().step = next;
      progress().editingReward = editingReward;
      store.save();
    }
    const combat = ['first', 'pack', 'trial'].includes(next);
    $('introScene').classList.toggle('hidden', next === 'draw');
    $('introPainting').classList.toggle('hidden', next !== 'draw');
    $('introUnlock').classList.toggle('hidden', next !== 'unlock');
    $('introObjective').classList.toggle('hidden', !combat);
    $('introPause').classList.toggle('hidden', !combat);
    $('introPause').textContent = '暂停';
    $('introRepeat').classList.toggle('hidden', next !== 'complete');
    $('introEdit').classList.toggle('hidden', next !== 'complete');
    $('introPlace').textContent = copy[next][0];
    $('introCoach').textContent = copy[next][1];
    $('introPrimary').textContent = copy[next][2];
    $('introPrimary').classList.toggle('hidden', !copy[next][2]);
    $('introPrimary').disabled = false;
    $('introContext').textContent = next === 'draw' ? '图案大小不改变攻击属性。' : combat ? '也可使用 WASD / 方向键移动' : '';
    $('introContext').classList.toggle('intro-context-keys', combat);
    $('introStageNote').textContent = next === 'complete' ? '每关结束，都可以换武器' : '';
    $('introWorld').setAttribute('aria-label', copy[next][0] + '。' + copy[next][1]);
    if (next === 'unlock') {
      thumb($('introRewardArt'), store.work(progress().rewardWorkId));
      audio.play('unlock');
    }
    if (next === 'complete') {
      lesson.input = {x: 0, y: 0};
      $('introSpeaker').textContent = '阿绘 · 画册守护者';
    }
    audio.setPaused(false);
  }

  function firstWork() {
    if (!progress().prepared) {
      const work = store.work(progress().workId || store.data.loadout[0]);
      if (progress().step === 'story') {
        work.name = '我的第一把火剑';
        work.pixels = work.pixels.map(color => Forge.PALETTE[color]?.element === 'fire' ? 2 : color);
        work.layers = [work.pixels.slice(), Array(work.size * work.size).fill(0)];
      }
      progress().workId = work.id;
      progress().prepared = true;
      store.save();
    }
    return store.work(progress().workId);
  }

  function open() {
    actions.enter();
    const work = firstWork();
    lesson.startTutorial(store.equipment(work.id));
    lesson.state = 'idle';
    lesson.tutorialWaypoint = null;
    lesson.restoration = 0;
    renderer.setArtwork(lesson.equipment);
    audio.setEnvironment('forest');
    const saved = progress().step;
    if (progress().rewardWorkId) {
      if (saved === 'draw' && progress().editingReward) openDrawing(true);
      else {
        lesson.restoration = 1;
        if (saved === 'trial') startTrial();
        else if (saved === 'complete') {
          lesson.startUnlockTrial(store.equipment(progress().rewardWorkId));
          lesson.enemies = [];
          lesson.state = 'idle';
          renderer.setArtwork(lesson.equipment);
          renderPhase('complete');
        }
        else renderPhase('unlock');
      }
    } else if (saved === 'draw') openDrawing(false);
    else if (['awaken', 'first', 'pack'].includes(saved)) startFight();
    else renderPhase('story');
    renderer.draw();
  }

  function openDrawing(reward = false) {
    editingReward = reward;
    draft = store.draft(reward ? progress().rewardWorkId : firstWork().id);
    renderPhase('draw');
    $('introPaintTitle').textContent = reward ? '让它更像你的作品。' : '给它添上你的第一笔。';
    $('introClear').classList.toggle('hidden', !reward);
    loading = true;
    editor.setTool('pencil');
    editor.setColor(5);
    editor.loadArtwork(draft);
    loading = false;
    refreshPainting();
  }

  function refreshPainting() {
    const ready = editingReward ? draft.pixels.some(Boolean) : Forge.recipe(draft.pixels).fire > 0;
    $('introPrimary').disabled = !ready;
    $('introUndo').disabled = editor.history.length === 0;
    $('introPrimary').textContent = editingReward ? '带回试用场 →' : '带上我的火剑 →';
    $('introArtStatus').textContent = ready ? '你的作品，准备好了。' : '它正等着你的颜色。';
    $('introCoach').textContent = editingReward ? '换个图案，继续试回旋器。新武器会一直保留。' : ready ? '你刚画的红色，变成了火。带上它，去救回森林。' : copy.draw[1];
    const canvas = $('introArtPreview'), c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#8baf7944';
    c.fillRect(53, 169, 170, 7);
    c.drawImage(Forge.Sprites.player, 74, 66, 80, 105);
    c.save();
    c.translate(189, 106);
    c.rotate(-.3);
    c.drawImage(Forge.artImage(draft.pixels, draft.size), -44, -44, 88, 88);
    c.restore();
  }

  function startFight() {
    lesson.startTutorial(store.equipment(progress().workId));
    renderer.setArtwork(lesson.equipment);
    renderPhase('first');
  }

  function startTrial() {
    lesson.startUnlockTrial(store.equipment(progress().rewardWorkId));
    lesson.restoration = 1;
    renderer.setArtwork(lesson.equipment);
    renderPhase('trial');
  }

  function onGameEvent(type, value) {
    if (type === 'sound') audio.play(value);
    if (type === 'tutorial') {
      if (value === 'first-hit') destination = null;
      if (value === 'pack') renderPhase('pack');
      if (value === 'fire') {
        $('introCoach').textContent = '火沿草丛蔓延，留下的余烬也会灼伤墨怪。';
        $('introPrimary').classList.add('hidden');
        $('introContext').textContent = '';
      }
      if (value === 'trial-complete') {
        destination = null;
        renderPhase('complete');
      }
    }
    if (type === 'clear' && !progress().rewardWorkId) {
      store.clearStage(0);
      store.unlockFirstReward(progress().workId);
      Object.assign(store.data.run, {level: 1, active: false, rewardPending: false, choices: []});
      renderPhase('restore');
      audio.play('clear');
      $('introStageNote').textContent = '森林的颜色，回来了。';
    }
  }

  function primary() {
    audio.unlock();
    audio.play('choose');
    if (phase === 'story') openDrawing();
    else if (phase === 'draw') {
      store.commit(draft.id, draft);
      if (editingReward) startTrial();
      else {
        lesson.equip(store.equipment(draft.id));
        renderer.setArtwork(lesson.equipment);
        renderPhase('awaken');
        audio.play('equip');
      }
    } else if (['first', 'pack', 'trial'].includes(phase)) {
      if (paused) togglePause();
      destination = {...lesson.tutorialWaypoint};
    } else if (phase === 'unlock') startTrial();
    else if (phase === 'complete') {
      store.completeOnboarding();
      actions.explore();
    }
  }

  function togglePause() {
    if (!['first', 'pack', 'trial'].includes(phase)) return;
    paused = !paused;
    keys.clear();
    destination = null;
    $('introPause').textContent = paused ? '继续' : '暂停';
    $('introCoach').textContent = paused ? '已暂停。点击“继续”回到战斗。' : phase === 'pack' && lesson.terrain.grass.some(g => g.state !== 'fresh') ? '火沿草丛蔓延，留下的余烬也会灼伤墨怪。' : copy[phase][1];
    audio.setPaused(paused);
  }

  function update(dt) {
    if (paused) return;
    age += dt;
    if (phase === 'awaken' && age > .8) startFight();
    if (phase === 'restore') {
      lesson.restoration = Math.min(1, age / 2.2);
      lesson.animateEffects(dt);
      if (age > 3.1) renderPhase('unlock');
    }
    if (['first', 'pack', 'trial'].includes(phase)) {
      let x = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
      let y = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
      if (x || y) destination = null;
      if (lesson.tutorial === 'pause') destination = null;
      if (destination) {
        x = destination.x - lesson.player.x;
        y = destination.y - lesson.player.y;
        const length = Math.hypot(x, y);
        if (length < 5) { destination = null; x = 0; y = 0; }
        else { x /= length; y /= length; }
      }
      lesson.input = {x, y};
      lesson.update(dt);
      $('introObjective').textContent = phase === 'first' ? (lesson.kills ? '第一只墨怪已击败' : '击败第一只墨怪') : phase === 'pack' ? '击败墨怪 ' + Math.max(0, lesson.kills - 1) + ' / 5' : '试试去程和回程的攻击';
      if (phase === 'trial' && lesson.projectiles.some(p => p.kind === 'weapon')) {
        $('introPrimary').classList.add('hidden');
        $('introContext').textContent = '';
        $('introObjective').textContent = lesson.projectiles.some(p => p.returning) ? '回旋器正在返回' : '回旋器已飞出';
      }
    }
    if (phase === 'complete') lesson.animateEffects(dt);
    if (phase !== 'draw') renderer.draw();
  }

  $('introPrimary').onclick = primary;
  $('introRepeat').onclick = startTrial;
  $('introEdit').onclick = () => openDrawing(true);
  $('introUndo').onclick = () => editor.undo();
  $('introClear').onclick = () => editor.setPixels(Array(draft.size * draft.size).fill(0));
  $('introPause').onclick = togglePause;
  $('introWorld').onpointerdown = event => {
    if (!['first', 'pack', 'trial'].includes(phase) || paused) return;
    const box = event.currentTarget.getBoundingClientRect();
    destination = {x: (event.clientX - box.left) / box.width * 960, y: (event.clientY - box.top) / box.height * 600};
  };
  document.addEventListener('keydown', event => {
    if (!active() || phase === 'draw' || !['first', 'pack', 'trial'].includes(phase)) return;
    const key = event.key.toLowerCase();
    if (key === 'escape') { togglePause(); return; }
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault();
      if (!paused) keys.add(key);
    }
  });
  document.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => { if (active() && !paused) togglePause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && active() && !paused) togglePause(); });
  return {open, update, lesson, editor, get phase() { return phase; }, get paused() { return paused; }};
};
