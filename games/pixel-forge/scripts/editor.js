'use strict';

Forge.Editor = class {
  constructor(canvas, onChange, onSelect) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.onChange = onChange; this.onSelect = onSelect;
    this.size = 8; this.layers = [Array(64).fill(0), Array(64).fill(0)];
    this.activeLayer = 0; this.pixels = Array(64).fill(0);
    this.allowedColors = new Set([1, 2, 5]); this.color = 5;
    this.tool = 'pencil'; this.mirror = false; this.history = []; this.future = [];
    this.zoom = 1; this.pan = {x: 0, y: 0};
    this.selection = null; this.hover = null; this.keyboardCell = null;
    this.drawing = false; this.selecting = false; this.panning = false;
    this.pointerId = null; this.last = null; this.actionRecorded = false; this.dirty = false;
    canvas.style.touchAction = 'none'; canvas.style.imageRendering = 'pixelated'; canvas.tabIndex = 0;
    canvas.addEventListener('pointerdown', e => this.begin(e));
    canvas.addEventListener('pointermove', e => this.move(e));
    canvas.addEventListener('pointerup', e => this.end(e));
    canvas.addEventListener('pointercancel', e => this.end(e));
    canvas.addEventListener('lostpointercapture', e => this.end(e));
    canvas.addEventListener('pointerleave', () => { this.hover = null; this.render(); });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('keydown', e => this.key(e));
    canvas.addEventListener('wheel', e => this.wheel(e), {passive: false});
    this.render();
  }

  exportArtwork() {
    return {size: this.size, layers: this.layers.map(layer => layer.slice()), pixels: this.pixels.slice()};
  }

  snapshot() {
    return {...this.exportArtwork(), activeLayer: this.activeLayer,
      selection: this.selection ? {...this.selection} : null};
  }

  checkpoint() {
    this.history.push(this.snapshot());
    if (this.history.length > 60) this.history.shift();
    this.future = [];
  }

  loadArtwork(artwork, record = false) {
    this.end();
    if (record) this.checkpoint();
    else { this.history = []; this.future = []; }
    this.size = artwork.size;
    this.layers = artwork.layers ? artwork.layers.map(layer => layer.slice())
      : [artwork.pixels.slice(), Array(this.size * this.size).fill(0)];
    this.activeLayer = 0; this.selection = null; this.hover = null; this.keyboardCell = null;
    this.zoom = 1; this.pan = {x: 0, y: 0};
    this.changed();
  }

  setPixels(pixels, record = true) {
    this.loadArtwork({size: Math.sqrt(pixels.length), pixels}, record);
  }

  expandCanvas(size) {
    if (size <= this.size) return 0;
    this.end(); this.checkpoint();
    const previousSize = this.size, offset = (size - previousSize) / 2;
    this.layers = this.layers.map(layer => {
      const expanded = Array(size * size).fill(0);
      for (let y = 0; y < previousSize; y++) {
        for (let x = 0; x < previousSize; x++) {
          expanded[(y + offset) * size + x + offset] = layer[y * previousSize + x];
        }
      }
      return expanded;
    });
    this.size = size;
    if (this.selection) { this.selection.x += offset; this.selection.y += offset; }
    this.hover = null; this.keyboardCell = null;
    this.changed();
    return offset;
  }

  compose() { this.pixels = this.layers[0].map((pixel, i) => this.layers[1][i] || pixel); }

  changed() {
    this.compose(); this.dirty = false; this.render(); this.onChange(this.pixels);
  }

  setLayer(index) { this.end(); this.activeLayer = index; this.render(); }
  setTool(tool) { this.end(); this.tool = tool; this.render(); }

  setColor(index) {
    if (!this.allowedColors.has(index)) return false;
    this.color = index; this.onSelect(index); this.render();
    return true;
  }

  setAllowedColors(ids) {
    this.allowedColors = new Set(ids);
    if (!this.allowedColors.has(this.color)) this.setColor(ids[0]);
  }

  inside(x, y) { return x >= 0 && y >= 0 && x < this.size && y < this.size; }

  selected(x, y) {
    const s = this.selection;
    return !s || (x >= s.x && y >= s.y && x < s.x + s.width && y < s.y + s.height);
  }

  startEdit() { this.actionRecorded = false; this.dirty = false; }

  write(x, y, color, selectionOnly = true) {
    if (!this.inside(x, y) || (selectionOnly && !this.selected(x, y))) return;
    const layer = this.layers[this.activeLayer], i = y * this.size + x;
    if (layer[i] === color) return;
    if (!this.actionRecorded) { this.checkpoint(); this.actionRecorded = true; }
    layer[i] = color; this.dirty = true;
  }

  paint(x, y) {
    this.write(x, y, this.strokeColor);
    if (this.mirror) this.write(this.size - 1 - x, y, this.strokeColor);
  }

  line(a, b) {
    let x = a.x, y = a.y;
    const dx = Math.abs(b.x - x), dy = -Math.abs(b.y - y);
    const sx = x < b.x ? 1 : -1, sy = y < b.y ? 1 : -1;
    let error = dx + dy;
    while (true) {
      this.paint(x, y);
      if (x === b.x && y === b.y) break;
      const twice = 2 * error;
      if (twice >= dy) { error += dy; x += sx; }
      if (twice <= dx) { error += dx; y += sy; }
    }
  }

  flood(x, y, color) {
    if (!this.inside(x, y) || !this.selected(x, y)) return;
    const layer = this.layers[this.activeLayer], old = layer[y * this.size + x];
    if (old === color) return;
    const stack = [{x, y}];
    this.write(x, y, color);
    while (stack.length) {
      const cell = stack.pop();
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = cell.x + dx, ny = cell.y + dy;
        if (this.inside(nx, ny) && this.selected(nx, ny) && layer[ny * this.size + nx] === old) {
          this.write(nx, ny, color); stack.push({x: nx, y: ny});
        }
      }
    }
  }

  fill(x, y, color = this.color) {
    if (color && !this.allowedColors.has(color)) return;
    this.startEdit(); this.flood(x, y, color);
    if (this.mirror) this.flood(this.size - 1 - x, y, color);
    if (this.dirty) this.changed();
  }

  replaceColor(from, to, selectionOnly = false) {
    if ((to && !this.allowedColors.has(to)) || (selectionOnly && !this.selection)) return;
    this.startEdit();
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.layers[this.activeLayer][y * this.size + x] === from) this.write(x, y, to, selectionOnly);
      }
    }
    if (this.dirty) this.changed();
  }

  fillSelection(color = this.color) {
    if (!this.selection || (color && !this.allowedColors.has(color))) return;
    this.startEdit();
    const s = this.selection;
    for (let y = s.y; y < s.y + s.height; y++) {
      for (let x = s.x; x < s.x + s.width; x++) this.write(x, y, color);
    }
    if (this.dirty) this.changed();
  }

  clearSelection() { this.selection = null; this.render(); }

  restore(snapshot) {
    this.size = snapshot.size; this.layers = snapshot.layers.map(layer => layer.slice());
    this.activeLayer = snapshot.activeLayer;
    this.selection = snapshot.selection ? {...snapshot.selection} : null;
    this.hover = null; this.keyboardCell = null;
    this.changed();
  }

  undo() {
    this.end();
    if (!this.history.length) return;
    this.future.push(this.snapshot()); this.restore(this.history.pop());
  }

  redo() {
    this.end();
    if (!this.future.length) return;
    this.history.push(this.snapshot()); this.restore(this.future.pop());
  }

  view() {
    const width = this.canvas.width, height = this.canvas.height;
    const board = Math.min(width, height) * this.zoom;
    return {x: (width - board) / 2 + this.pan.x, y: (height - board) / 2 + this.pan.y,
      board, cell: board / this.size};
  }

  canvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {x: (event.clientX - rect.left) * this.canvas.width / rect.width,
      y: (event.clientY - rect.top) * this.canvas.height / rect.height};
  }

  point(event) {
    const p = this.canvasPoint(event), v = this.view();
    return {x: Math.floor((p.x - v.x) / v.cell), y: Math.floor((p.y - v.y) / v.cell)};
  }

  clampPan() {
    const board = Math.min(this.canvas.width, this.canvas.height) * this.zoom;
    const maxX = Math.max(0, (board - this.canvas.width) / 2);
    const maxY = Math.max(0, (board - this.canvas.height) / 2);
    this.pan.x = Math.max(-maxX, Math.min(maxX, this.pan.x));
    this.pan.y = Math.max(-maxY, Math.min(maxY, this.pan.y));
  }

  zoomAt(number, point) {
    const before = this.view(), next = Math.max(1, Math.min(6, number)), ratio = next / this.zoom;
    this.zoom = next;
    const board = before.board * ratio;
    this.pan.x = point.x - (point.x - before.x) * ratio - (this.canvas.width - board) / 2;
    this.pan.y = point.y - (point.y - before.y) * ratio - (this.canvas.height - board) / 2;
    this.clampPan(); this.hover = null; this.render();
  }

  setZoom(number) { this.zoomAt(number, {x: this.canvas.width / 2, y: this.canvas.height / 2}); }

  wheel(event) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      this.zoomAt(this.zoom * Math.exp(-event.deltaY * 0.002), this.canvasPoint(event));
    } else if (this.zoom > 1) {
      event.preventDefault(); this.pan.x -= event.deltaX; this.pan.y -= event.deltaY;
      this.clampPan(); this.hover = null; this.render();
    }
  }

  begin(event) {
    if (event.isPrimary === false || this.pointerId !== null || ![0, 1, 2].includes(event.button)) return;
    const p = this.point(event);
    const pan = event.button === 1 || (this.tool === 'pan' && event.button !== 2);
    if (!pan && !this.inside(p.x, p.y)) return;
    event.preventDefault(); this.canvas.focus({preventScroll: true});
    this.canvas.setPointerCapture(event.pointerId); this.pointerId = event.pointerId;
    this.keyboardCell = null; this.hover = this.inside(p.x, p.y) ? p : null;
    if (pan) {
      this.panning = true; this.panStart = {point: this.canvasPoint(event), pan: {...this.pan}};
      this.render(); return;
    }
    if (this.tool === 'picker' && event.button !== 2) {
      this.setColor(this.pixels[p.y * this.size + p.x]); return;
    }
    if (this.tool === 'select' && event.button !== 2) {
      this.selecting = true; this.selectionStart = p;
      this.selection = {x: p.x, y: p.y, width: 1, height: 1};
      this.render(); return;
    }
    this.strokeColor = event.button === 2 || this.tool === 'eraser' ? 0 : this.color;
    if (this.tool === 'fill' && event.button !== 2) { this.fill(p.x, p.y); return; }
    this.startEdit(); this.drawing = true; this.last = p; this.paint(p.x, p.y);
    if (this.dirty) this.changed();
  }

  move(event) {
    if (this.pointerId !== null && event.pointerId !== this.pointerId) return;
    if (this.panning) {
      const p = this.canvasPoint(event);
      this.pan.x = this.panStart.pan.x + p.x - this.panStart.point.x;
      this.pan.y = this.panStart.pan.y + p.y - this.panStart.point.y;
      this.clampPan(); this.render(); return;
    }
    const point = this.point(event);
    this.hover = this.inside(point.x, point.y) ? point : null;
    if (this.selecting) {
      const x = Math.max(0, Math.min(this.size - 1, point.x));
      const y = Math.max(0, Math.min(this.size - 1, point.y));
      const start = this.selectionStart;
      this.selection = {x: Math.min(x, start.x), y: Math.min(y, start.y),
        width: Math.abs(x - start.x) + 1, height: Math.abs(y - start.y) + 1};
      this.render(); return;
    }
    if (this.drawing) {
      const samples = event.getCoalescedEvents ? event.getCoalescedEvents() : [];
      for (const sample of [...samples, event]) {
        const p = this.point(sample), inside = this.inside(p.x, p.y);
        const end = {x: Math.max(0, Math.min(this.size - 1, p.x)), y: Math.max(0, Math.min(this.size - 1, p.y))};
        if (this.last) this.line(this.last, end);
        else if (inside) this.paint(p.x, p.y);
        this.last = inside ? p : null;
      }
      if (this.dirty) this.changed(); else this.render();
    } else this.render();
  }

  end(event) {
    if (event && this.pointerId !== event.pointerId) return;
    const wasPanning = this.panning;
    this.pointerId = null; this.drawing = false; this.selecting = false; this.panning = false; this.last = null;
    if (wasPanning) this.render();
  }

  key(event) {
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && (key === 'z' || key === 'y')) {
      event.preventDefault(); event.stopPropagation();
      if (key === 'y' || event.shiftKey) this.redo(); else this.undo();
      return;
    }
    const tool = {b: 'pencil', e: 'eraser', g: 'fill', i: 'picker', h: 'pan'}[key];
    if (tool && !event.ctrlKey && !event.metaKey) {
      event.preventDefault(); event.stopPropagation(); this.setTool(tool); return;
    }
    if (['+', '=', '-', '0'].includes(key)) {
      event.preventDefault(); event.stopPropagation();
      this.setZoom(key === '0' ? 1 : this.zoom * (key === '-' ? 0.8 : 1.25)); return;
    }
    if (key === 'escape') { event.preventDefault(); event.stopPropagation(); this.clearSelection(); return; }
    if ((key === 'delete' || key === 'backspace') && this.selection) {
      event.preventDefault(); event.stopPropagation(); this.fillSelection(0); return;
    }
    if (!['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) return;
    event.preventDefault(); event.stopPropagation();
    const p = this.keyboardCell || {x: Math.floor((this.size - 1) / 2), y: Math.floor((this.size - 1) / 2)};
    if (key === 'arrowup') p.y = Math.max(0, p.y - 1);
    if (key === 'arrowdown') p.y = Math.min(this.size - 1, p.y + 1);
    if (key === 'arrowleft') p.x = Math.max(0, p.x - 1);
    if (key === 'arrowright') p.x = Math.min(this.size - 1, p.x + 1);
    this.keyboardCell = p; this.hover = p;
    if (key === ' ') {
      if (this.tool === 'picker') this.setColor(this.pixels[p.y * this.size + p.x]);
      else if (this.tool === 'fill') this.fill(p.x, p.y);
      else if (this.tool === 'pencil' || this.tool === 'eraser') {
        this.startEdit(); this.strokeColor = this.tool === 'eraser' ? 0 : this.color; this.paint(p.x, p.y);
        if (this.dirty) this.changed();
      }
    }
    this.render();
  }

  render() {
    const c = this.ctx, v = this.view(), s = v.cell;
    c.imageSmoothingEnabled = false; c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    c.fillStyle = '#101c29'; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const pixel = this.pixels[y * this.size + x];
        c.fillStyle = pixel ? Forge.PALETTE[pixel].hex : ((x + y) % 2 ? '#94a69e' : '#acb8ad');
        c.fillRect(v.x + x * s, v.y + y * s, s, s);
      }
    }
    c.strokeStyle = '#183d3b30'; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i <= this.size; i++) {
      c.moveTo(v.x + i * s, v.y); c.lineTo(v.x + i * s, v.y + v.board);
      c.moveTo(v.x, v.y + i * s); c.lineTo(v.x + v.board, v.y + i * s);
    }
    c.stroke();
    if (this.mirror) {
      c.strokeStyle = '#9af0c980'; c.setLineDash([5, 5]); c.beginPath();
      c.moveTo(v.x + v.board / 2, v.y); c.lineTo(v.x + v.board / 2, v.y + v.board);
      c.stroke(); c.setLineDash([]);
    }
    if (this.selection) {
      const r = this.selection;
      c.fillStyle = '#9af0c910';
      c.fillRect(v.x + r.x * s, v.y + r.y * s, r.width * s, r.height * s);
      c.strokeStyle = '#adf3d8'; c.lineWidth = 2; c.setLineDash([6, 4]);
      c.strokeRect(v.x + r.x * s + 1, v.y + r.y * s + 1, r.width * s - 2, r.height * s - 2);
      c.setLineDash([]);
    }
    if (this.hover && this.tool !== 'pan') {
      const {x, y} = this.hover;
      c.strokeStyle = '#e6f5ed'; c.lineWidth = 2;
      c.strokeRect(v.x + x * s + 1, v.y + y * s + 1, s - 2, s - 2);
      if (this.mirror) c.strokeRect(v.x + (this.size - 1 - x) * s + 1, v.y + y * s + 1, s - 2, s - 2);
    }
    this.canvas.style.cursor = this.tool === 'pan' ? (this.panning ? 'grabbing' : 'grab') : 'crosshair';
  }
};
