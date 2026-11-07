(function () {
'use strict';
const E = window.MocapEngine;
const $ = id => document.getElementById(id);
const viewer = new E.MocapViewer($('view'));
const chart = new E.ChartView($('chart')), chart2 = new E.ChartView($('chart2'));
const chartF = new E.ChartView($('cmjF')), chartV = new E.ChartView($('cmjV'));
chartF.noEventLabels = chartV.noEventLabels = true;
let cmj = null;
let ds = null, tab = 'marker', kin = null, fa = null, chartK = 1;
const cache = new Map();

/* ---------- theme tokens for the chart canvas */
function readTheme() {
  const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
  const th = { fg: g('--fg'), fg2: g('--fg-2'), line: g('--line'), accent: g('--accent'), panel: g('--panel') };
  for (const c of [chart, chart2, chartF, chartV]) { c.theme = th; c.draw(); }
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readTheme);
new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
readTheme();


/* ---------- helpers */
function note(msg, kind) {
  const n = $('note');
  if (!msg) { n.hidden = true; return; }
  n.hidden = false; n.className = 'note' + (kind ? ' ' + kind : ''); n.textContent = msg;
}
function row(dl, k, v) {
  const dt = document.createElement('dt'), dd = document.createElement('dd');
  dt.textContent = k; dd.textContent = v; dl.append(dt, dd);
}

/* ---------- dataset load */
function load(d) {
  ds = d; cache.clear(); kin = null; viewer.kin = null; fa = null; chartK = 1; resetFa(); $('bCsv').disabled = true; $('tabA').disabled = true;
  viewer.setDataset(d);
  $('badge').hidden = !d.synthetic;
  // info
  const dl = $('info'); dl.textContent = '';
  const dur = d.nFrames / d.rate;
  let missing = 0, total = 0, nUnl = 0;
  for (let i = 0; i < d.nM; i++) if (d.side[i] === 'U') nUnl++;
  for (let i = 0; i < d.nM; i++) { if (d.side[i] === 'U') continue; for (let f = 0; f < d.nFrames; f++) { total++; if (!d.vis[f * d.nM + i]) missing++; } }
  row(dl, 'ชื่อ', d.name);
  row(dl, 'ความถี่', d.rate + ' Hz');
  row(dl, 'เฟรม', d.nFrames + ' (' + dur.toFixed(2) + ' s)');
  row(dl, 'หน่วยในไฟล์', d.info.unitsLabel + ' → แสดงเป็น m');
  row(dl, 'Prefix', d.prefix || '—');
  row(dl, 'Marker', (d.nM - nUnl) + ' + unlabeled ' + nUnl);
  row(dl, 'ข้อมูลขาด', total ? (100 * missing / total).toFixed(1) + ' %' : '—');
  if (d.info.analogChannels) row(dl, 'Analog', d.info.analogChannels + ' ch @ ' + d.info.analogRate + ' Hz');
  if (d.plates.length) d.plates.forEach(p => row(dl, 'FP' + p.index, p.supported ? p.note : '⚠ ' + p.note));
  else row(dl, 'Force plate', 'ไม่พบ');
  row(dl, 'Event', d.events.length ? d.events.length + ' รายการ' : '—');
  const warn = (d.warnings || []).concat(d.plates.filter(p => !p.supported).map(p => 'FP' + p.index + ': ' + p.note));
  note(warn.length ? warn.join(' · ') : '', warn.length ? 'warn' : '');
  // timeline
  const sl = $('slider'); sl.max = d.nFrames - 1; sl.value = 0;
  const tk = $('ticks'); tk.textContent = '';
  for (const ev of d.events) { const s = document.createElement('span'); s.style.left = (ev.frame / (d.nFrames - 1) * 100) + '%'; s.dataset.l = ev.label; tk.append(s); }
  // tabs
  const hasF = d.plates.some(p => p.supported);
  $('tabG').disabled = !hasF; $('tabG2').disabled = !hasF; fillMsel(); if (!hasF && tab === 'grf') setTab('marker');
  buildList(); syncChecks();
  // default selected marker
  let sel = d.base.findIndex(b => /^RKNE$/i.test(b)); if (sel < 0) sel = d.side.findIndex(s => s !== 'U');
  viewer.select(sel);
  $('oUnl').checked = false;
  updateLinkCount(); updateChart();
}

/* ---------- marker list */
function buildList() {
  const ul = $('mlist'); ul.textContent = '';
  for (let i = 0; i < ds.nM; i++) {
    const li = document.createElement('li');
    li.className = 'mrow' + (ds.side[i] === 'U' ? ' unl' : ''); li.dataset.i = i;
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.className = 'mchk'; cb.setAttribute('aria-label', 'แสดง ' + ds.base[i]);
    const sw = document.createElement('span'); sw.className = 'sw'; sw.style.background = E.SIDE_COLOR[ds.side[i]] || E.SIDE_COLOR.C;
    const nm = document.createElement('span'); nm.className = 'mname'; nm.textContent = ds.base[i]; nm.title = ds.labels[i];
    const gp = document.createElement('span'); gp.className = 'mgap';
    const vr = E.validRatio(ds, i); if (vr < 0.9995) { gp.textContent = Math.round(vr * 100) + '%'; gp.title = 'สัดส่วนเฟรมที่มีข้อมูล'; }
    li.append(cb, sw, nm, gp); ul.append(li);
  }
  $('mfilter').value = '';
}
function syncChecks() {
  document.querySelectorAll('#mlist .mrow').forEach(li => { li.querySelector('input').checked = !!viewer.visible[+li.dataset.i]; });
}
function markSelected(i) {
  document.querySelectorAll('#mlist .mrow').forEach(li => li.classList.toggle('sel', +li.dataset.i === i));
  const li = document.querySelector('#mlist .mrow.sel'), ul = $('mlist');
  if (li) { const r = li.getBoundingClientRect(), u = ul.getBoundingClientRect(); if (r.top < u.top) ul.scrollTop -= u.top - r.top; else if (r.bottom > u.bottom) ul.scrollTop += r.bottom - u.bottom; }
}
$('mlist').addEventListener('click', e => {
  const li = e.target.closest('.mrow'); if (!li) return;
  const i = +li.dataset.i;
  if (e.target.classList.contains('mchk')) { viewer.setVisible(i, e.target.checked); return; }
  viewer.select(i === viewer.selected ? -1 : i);
});
$('mfilter').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll('#mlist .mrow').forEach(li => { li.hidden = q && !ds.base[+li.dataset.i].toLowerCase().includes(q); });
});
$('mAll').addEventListener('click', () => { for (let i = 0; i < ds.nM; i++) if (ds.side[i] !== 'U' || $('oUnl').checked) viewer.setVisible(i, true); syncChecks(); });
$('mNone').addEventListener('click', () => { for (let i = 0; i < ds.nM; i++) viewer.setVisible(i, false); syncChecks(); });

/* ---------- viewer events */
viewer.onselect = i => { markSelected(i); updateChart(); };
viewer.onlinks = () => updateLinkCount();
viewer.onframe = (f, playing) => {
  if (!ds) return;
  const fi = Math.floor(f);
  $('slider').value = fi;
  $('readout').textContent = 't ' + (f / ds.rate).toFixed(3) + ' s · f ' + (fi + 1) + '/' + ds.nFrames;
  $('icPlay').hidden = playing; $('icPause').hidden = !playing;
  $('bPlay').setAttribute('aria-label', playing ? 'หยุดชั่วคราว' : 'เล่น');
  chart.cursor = f * chartK; chart.draw();
  if (PB.on) { chart2.cursor = f * PB.k; chart2.draw(); }
  if (cmj) { const c = f * (fa.fs / ds.rate) - cmj.c0; chartF.cursor = c; chartV.cursor = c; chartF.draw(); chartV.draw(); }
};
chart.onseek = f => { viewer.setFrame(f / chartK); };
chart2.onseek = f => { viewer.setFrame(f / PB.k); };
chartF.onseek = chartV.onseek = f => { if (cmj) viewer.setFrame((f + cmj.c0) / (fa.fs / ds.rate)); };
function updateLinkCount() { $('linkCount').textContent = ds ? viewer.links.length + ' link' : ''; }

/* ---------- chart */
function markerSeries(i) {
  const key = 'm' + i; if (cache.has(key)) return cache.get(key);
  const n = ds.nFrames, nM = ds.nM, out = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  for (let f = 0; f < n; f++) {
    const k = f * nM + i, ok = ds.vis[k];
    for (let a = 0; a < 3; a++) out[a][f] = ok ? ds.pts[k * 3 + a] : NaN;
  }
  cache.set(key, out); return out;
}
function grfSeries(pl) {
  const key = 'g' + pl.index; if (cache.has(key)) return cache.get(key);
  const n = ds.nFrames, out = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  for (let f = 0; f < n; f++) for (let a = 0; a < 3; a++) out[a][f] = pl.F[f * 3 + a];
  cache.set(key, out); return out;
}
const PA = { c: chart, sfx: '', get tab() { return tab; }, set tab(v) { tab = v; }, k: 1 };
const PB = { c: chart2, sfx: '2', tab: 'ang', k: 1 };
function updateChart() { updatePanel(PA); if (PB.on) updatePanel(PB); }
function updatePanel(P) {
  if (!ds) return;
  const c = P.c, S = P.sfx, T = P.tab; P.k = 1;
  const title = t => { $('ctitle' + S).textContent = t; };
  const base = { n: ds.nFrames, rate: ds.rate, events: ds.events, cursor: viewer.f };
  if (T === 'marker') {
    const i = S ? +$('msel2').value : viewer.selected;
    if (i < 0 || isNaN(i)) { c.set(Object.assign({ series: [], empty: T('คลิก marker ในมุมมอง 3D หรือในรายการ เพื่อดูกราฟ') }, base)); title('—'); return; }
    const s = markerSeries(i);
    c.set(Object.assign({ series: [{ name: 'X', color: E.AXIS.x, data: s[0] }, { name: 'Y', color: E.AXIS.y, data: s[1] }, { name: 'Z', color: E.AXIS.z, data: s[2] }], dec: 3 }, base));
    title(ds.base[i] + ' · ตำแหน่งใน lab frame (m)');
  } else if (T === 'force') {
    if (!fa || !fa.ok) { c.set(Object.assign({ series: [], empty: T('กด “วิเคราะห์ FP” ก่อน') }, base)); title('—'); return; }
    P.k = fa.fs / ds.rate;
    const Pp = fa.phases, ev = [['Start', Pp.s], ['Braking', Pp.b], ['Split', Pp.z], ['Take-off', Pp.t], ['Landing', Pp.l]].map(([label, frame]) => ({ frame, label, context: '' }));
    const ser = [{ name: T('Fz รวม'), color: E.AXIS.z, data: fa.traces.sf }];
    if (fa.lr) ser.push({ name: T('ซ้าย'), color: E.AXIS.x, data: fa.traces.sl }, { name: T('ขวา'), color: E.AXIS.y, data: fa.traces.sr });
    c.set({ series: ser, dec: 0, n: fa.n, rate: fa.fs, events: ev, cursor: viewer.f * P.k });
    title('Fz หลังกรอง ลบ offset flight (N) · FP' + fa.plates.join('+') + ' · ' + fa.fs + ' Hz');
  } else if (T === 'ang') {
    const js = $('jsel' + S), A = kin && kin.angles[js.value];
    if (!A) { c.set(Object.assign({ series: [], empty: T('กด “คำนวณมุมข้อต่อ” ก่อน') }, base)); title('—'); return; }
    c.set(Object.assign({ series: [{ name: 'X flex/ext', color: E.AXIS.x, data: A.a }, { name: 'Y ab/add', color: E.AXIS.y, data: A.b }, { name: 'Z axial', color: E.AXIS.z, data: A.g }], dec: 1 }, base));
    title(js.selectedOptions[0].textContent + ' · Cardan Z-X-Y (°)' + (kin.params.normalize ? ' · ลบ offset static' : ''));
  } else {
    const pl = ds.plates.find(p => p.supported);
    if (!pl) { c.set(Object.assign({ series: [], empty: T('ไม่มีข้อมูล force plate') }, base)); title('—'); return; }
    const s = grfSeries(pl);
    c.set(Object.assign({ series: [{ name: 'Fx', color: E.AXIS.x, data: s[0] }, { name: 'Fy', color: E.AXIS.y, data: s[1] }, { name: 'Fz', color: E.AXIS.z, data: s[2] }], dec: 1 }, base));
    title('FP' + pl.index + ' · GRF ใน lab frame (N)' + (ds.synthetic ? ' · สังเคราะห์' : ''));
  }
  if (!S) chartK = P.k;
}
function syncTabs(P) {
  const S = P.sfx, t = P.tab;
  for (const [id, v] of [['tabM', 'marker'], ['tabG', 'grf'], ['tabA', 'ang'], ['tabF', 'force']]) $(id + S).setAttribute('aria-selected', t === v);
  $('jsel' + S).hidden = t !== 'ang'; if (S) $('msel2').hidden = t !== 'marker';
}
function setTab(t) { PA.tab = t; syncTabs(PA); updatePanel(PA); }
function setTabB(t) { PB.tab = t; syncTabs(PB); updatePanel(PB); }
$('tabM').addEventListener('click', () => setTab('marker'));
$('tabG').addEventListener('click', () => setTab('grf'));
$('tabA').addEventListener('click', () => setTab('ang'));
$('tabF').addEventListener('click', () => setTab('force'));
$('jsel').addEventListener('input', () => updatePanel(PA));
$('tabM2').addEventListener('click', () => setTabB('marker'));
$('tabG2').addEventListener('click', () => setTabB('grf'));
$('tabA2').addEventListener('click', () => setTabB('ang'));
$('tabF2').addEventListener('click', () => setTabB('force'));
$('jsel2').addEventListener('input', () => updatePanel(PB));
$('msel2').addEventListener('input', () => updatePanel(PB));
$('bCmp').addEventListener('click', () => {
  PB.on = !PB.on; $('boxB').hidden = !PB.on; $('chartPair').classList.toggle('two', PB.on);
  $('bCmp').setAttribute('aria-pressed', PB.on); if (PB.on) { fillMsel(); syncTabs(PB); chart2.resize && chart2.resize(); updatePanel(PB); } chart.resize && chart.resize(); chart.draw();
});
function fillMsel() {
  const m = $('msel2'), keep = m.value; m.textContent = '';
  if (!ds) return;
  ds.base.forEach((b, i) => { if (ds.side[i] === 'U' && /^\*|^C_|unl/i.test(b)) return; const o = document.createElement('option'); o.value = i; o.textContent = b; m.appendChild(o); });
  if (keep && [...m.options].some(o => o.value === keep)) m.value = keep; else { const j = ds.base.findIndex(b => /^LKNE$/i.test(b)); if (j >= 0) m.value = j; }
}
$('tabA').disabled = true;

/* ---------- joint angles (V3D-style, computed in the browser) */
function runAngles() {
  if (!ds) return;
  const num = id => parseFloat($(id).value);
  const p = { staticStart: num('aS0') | 0, staticN: num('aSN') | 0, kneeW: { R: num('aKR'), L: num('aKL') }, ankleW: { R: num('aAR'), L: num('aAL') }, markerR: num('aMR'), normalize: $('aNorm').checked };
  const r = E.computeLowerBody(ds, p), n = $('angNote');
  if (!r.ok) { kin = null; viewer.kin = null; $('tabA').disabled = true; $('tabA2').disabled = true; $('bCsv').disabled = true; n.className = 'note err'; n.textContent = r.error; viewer.invalidate(); return; }
  kin = r; viewer.kin = r; viewer.invalidate();
  $('tabA').disabled = false; $('tabA2').disabled = false; $('bCsv').disabled = false;
  const fmt = j => { const g = r.ranges[j].a; return j + ' ' + g[0].toFixed(0) + '…' + g[1].toFixed(0) + '°'; };
  n.className = 'note' + (r.warnings.length ? ' warn' : '');
  n.textContent = 'static f' + r.staticRange[0] + '–' + r.staticRange[1] + ' (marker ขยับสูงสุด ' + (r.staticMove * 1000).toFixed(1) + ' mm) · flex: ' + ['RHip', 'RKnee', 'RAnkle', 'LHip', 'LKnee', 'LAnkle'].map(fmt).join(' · ') + (r.warnings.length ? ' · ⚠ ' + r.warnings.join(' · ') : '') + ' · ยังไม่เทียบกับ Visual3D';
  setTab('ang');
}
$('bAng').addEventListener('click', runAngles);
$('bSide').addEventListener('click', () => { const on = document.querySelector('.app').classList.toggle('nosideb'); $('bSide').setAttribute('aria-pressed', on); $('bSide').textContent = on ? '◨ เมนู' : '◧ เมนู'; viewer.invalidate(); });
$('oBody').addEventListener('input', e => { viewer.opt.body = e.target.checked; viewer.invalidate(); });
$('oSegs').addEventListener('input', e => { viewer.opt.segs = e.target.checked; viewer.invalidate(); });
$('bCsv').addEventListener('click', () => {
  if (!kin) return;
  const J = ['RHip', 'RKnee', 'RAnkle', 'LHip', 'LKnee', 'LAnkle'], h = ['frame', 'time_s'];
  J.forEach(j => ['X_flex', 'Y_abd', 'Z_rot'].forEach(c => h.push(j + '_' + c)));
  const rows = [h.join(',')];
  for (let f = 0; f < ds.nFrames; f++) {
    const r = [f, (f / ds.rate).toFixed(4)];
    J.forEach(j => ['a', 'b', 'g'].forEach(c => { const v = kin.angles[j][c][f]; r.push(v === v ? v.toFixed(3) : ''); }));
    rows.push(r.join(','));
  }
  saveText((ds.name || 'take').replace(/\.c3d$/i, '') + '_JointAngles_ZXY.csv', rows.join('\r\n'));
});

async function saveText(fname, text) {
  let dl = null;
  try { dl = window.claude && await window.claude.use('downloads'); } catch (e) { dl = null; }
  if (dl) { try { await dl.save({ filename: fname, data: text }); } catch (e) { if (e && e.code !== 'declined') note('บันทึกไฟล์ไม่ได้: ' + (e.message || e.code), 'err'); } return; }
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' })), a = document.createElement('a');
  a.href = url; a.download = fname; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---------- Force analysis (FP embedded in the C3D only) */
const fnum = id => parseFloat($(id).value);
function resetFa() {
  cmj = null;
  $('faOut').hidden = true; $('bFaCsv').disabled = true; $('tabF').disabled = true; $('tabF2').disabled = true;
  const pls = ds ? ds.plates.filter(p => p.supported && p.fzFull) : [];
  $('bFa').disabled = !pls.length; $('faPanel').hidden = !pls.length;
  $('faHint').textContent = 'พบ force plate ที่ใช้ได้ ' + pls.length + ' แผ่นใน C3D' + (pls.length === 1 ? ' · แผ่นเดียว: แสดงเฉพาะค่ารวม (ไม่มี L/R)' : ' · เลือกแผ่นซ้าย/ขวาได้') + ' · พอร์ตจาก Force-Analysis';
  $('fLRbox').hidden = pls.length < 2;
  if (pls.length >= 2) {
    for (const id of ['fPL', 'fPR']) { const s = $(id); s.textContent = ''; pls.forEach(p => { const o = document.createElement('option'); o.value = p.index; o.textContent = 'FP' + p.index; s.append(o); }); }
    $('fPL').value = pls[0].index; $('fPR').value = pls[1].index;
  }
}
function faOptions(withPhases) {
  const o = { filterType: $('fFilter').value, cutoff: fnum('fCut') || 50, bwMethod: $('fBw').value, mass: fnum('fMass'), fn: fnum('fFn') || 0 };
  if (o.bwMethod === 'window') o.window = [fnum('fQ0'), fnum('fQ1')];
  if (!$('fLRbox').hidden) { o.leftPlate = +$('fPL').value; o.rightPlate = +$('fPR').value; }
  if (withPhases) o.phaseTimes = { s: fnum('pS'), b: fnum('pB'), z: fnum('pZ'), t: fnum('pT'), l: fnum('pL') };
  return o;
}
function renderFa() {
  const out = $('faOut'), note_ = $('faNote'), r = fa;
  out.hidden = false;
  if (!r.ok) { note_.className = 'note err'; note_.textContent = r.error + (r.warnings && r.warnings.length ? ' · ' + r.warnings.join(' · ') : ''); $('faTbl').textContent = ''; $('faImp').textContent = ''; $('bFaCsv').disabled = true; $('tabF').disabled = true; $('tabF2').disabled = true; return; }
  $('tabF').disabled = false; $('tabF2').disabled = false; $('bFaCsv').disabled = false;
  const P = r.phases, f3 = v => (v / r.fs).toFixed(3);
  $('pS').value = f3(P.s); $('pB').value = f3(P.b); $('pZ').value = f3(P.z); $('pT').value = f3(P.t); $('pL').value = f3(P.l);
  note_.className = 'note' + (r.warnings.length ? ' warn' : '');
  note_.textContent = 'BW ' + r.bw.toFixed(0) + ' N (' + r.mass.toFixed(1) + ' kg) จาก ' + r.bwSrc + ' · filter ' + (r.params.filterType === 'butter' ? 'Butterworth 4th zero-phase ' + r.params.cutoff + ' Hz' : r.params.filterType === 'ma' ? 'moving average 15' : 'raw') + (r.warnings.length ? ' · ⚠ ' + r.warnings.join(' · ') : '');
  const tb = $('faTbl'); tb.textContent = '';
  for (const g of r.groups) {
    const card = document.createElement('div'); card.className = 'fgcard';
    const h = document.createElement('div'); h.className = 'fgrp'; h.textContent = g.title; card.append(h);
    const t = document.createElement('table'); t.className = 'ftbl';
    const hr = t.insertRow(); (r.lr ? ['', 'L', 'R', 'รวม', 'Δ'] : ['', 'รวม']).forEach(x => { const c = document.createElement('th'); c.textContent = x; hr.append(c); });
    for (const x of g.rows) { const tr = t.insertRow(); (r.lr ? [x.name, x.l, x.r, x.t, x.d] : [x.name, x.t]).forEach(v => { tr.insertCell().textContent = v; }); }
    card.append(t); tb.append(card);
  }
  const im = $('faImp'); im.textContent = '';
  if (r.impactErr) { im.textContent = 'ข้ามการวิเคราะห์: ' + r.impactErr; }
  else for (const x of r.impact) {
    const card = document.createElement('div'); card.className = 'fgcard';
    const t = document.createElement('table'); t.className = 'ftbl';
    [['Channel', x.channel], ['Peak (N)', x.peak], ['Rise 10–90% (ms)', x.rise], ['f_rise (Hz)', x.fRise], ['f_dur (Hz)', x.fDur], ['f 99% energy (Hz)', x.fC99], ['f ที่ใช้ (Hz)', x.fUsed], ['fn / f', x.ratio], ['Amp. error (%)', x.err], ['Status', x.status]].forEach(([k, v]) => { const tr = t.insertRow(); tr.insertCell().textContent = k; tr.insertCell().textContent = v; });
    card.append(t); if (x.notes.length) { const p = document.createElement('p'); p.className = 'note'; p.style.margin = '6px 0 0'; p.textContent = x.notes.join(' · '); card.append(p); }
    im.append(card);
  }
  drawCmj();
}
/* CMJ-only charts: force cropped to start-20% … landing+20% of the jump, coloured by phase */
function drawCmj() {
  const r = fa, P = r.phases, span = Math.max(1, P.l - P.s), pad = Math.round(0.2 * span);
  const c0 = Math.max(0, P.s - pad), c1 = Math.min(r.n - 1, P.l + pad), len = c1 - c0 + 1, rel = v => v - c0;
  cmj = { c0, c1 };
  const sub = a => Float32Array.from(a.subarray(c0, c1 + 1));
  const ser = [{ name: T('Fz รวม'), color: E.AXIS.z, data: sub(r.traces.sf) }];
  if (r.lr) ser.push({ name: T('ซ้าย'), color: E.AXIS.x, data: sub(r.traces.sl) }, { name: T('ขวา'), color: E.AXIS.y, data: sub(r.traces.sr) });
  const ph = [['Unweighting', P.s, P.b, 'rgba(239,148,202,0.20)'], ['Braking', P.b, P.z, 'rgba(77,41,148,0.16)'], ['Propulsive', P.z, P.t, 'rgba(171,29,121,0.18)'], ['Flight', P.t, P.l, 'rgba(140,130,165,0.20)'], ['Landing', P.l, c1, 'rgba(208,195,241,0.30)']];
  const bands = ph.map(([label, a, b, color]) => ({ label, from: rel(a), to: rel(b), color }));
  const ev = ph.slice(0, 4).map(([label, a]) => ({ frame: rel(a), label, context: '' }));
  chartF.set({ series: ser, n: len, rate: r.fs, t0: c0 / r.fs, events: ev, bands, hlines: [{ v: r.bw, label: 'BW ' + r.bw.toFixed(0) + ' N' }], dec: 0, cursor: viewer.f * (r.fs / ds.rate) - c0 });
  $('cmjT1').textContent = 'Fz ช่วง CMJ (N) · ' + (c0 / r.fs).toFixed(2) + '–' + (c1 / r.fs).toFixed(2) + ' s · FP' + r.plates.join('+');
  $('cmjLeg').innerHTML = ph.map(([label, , , color]) => '<span><i style="background:' + color.replace(/0\.\d+\)/, '0.55)') + '"></i>' + label + '</span>').join('');
  const vel = new Float32Array(len).fill(NaN); for (let i = P.s; i <= Math.min(P.t, r.n - 1); i++) vel[rel(i)] = r.traces.vel[i];
  chartV.set({ series: [{ name: T('ความเร็ว COM'), color: E.AXIS.z, data: vel }], n: len, rate: r.fs, t0: c0 / r.fs, events: ev, bands, hlines: [{ v: 0, label: '0 m/s' }], dec: 2, cursor: viewer.f * (r.fs / ds.rate) - c0 });
  $('cmjT2').textContent = 'ความเร็วจุดศูนย์กลางมวล (m/s) · start → take-off (impulse-momentum)';
}
function runFa(withPhases) {
  if (!ds) return;
  fa = E.FA.analyzePlates(ds, faOptions(withPhases));
  renderFa();
  updateChart();
}
$('bFa').addEventListener('click', () => runFa(false));
$('bFaRe').addEventListener('click', () => runFa(true));
$('bFaAuto').addEventListener('click', () => runFa(false));
$('bFaCsv').addEventListener('click', () => {
  if (!fa || !fa.ok) return;
  const q = s => '"' + String(s).replace(/"/g, '""') + '"', rows = [['group', 'metric', 'left', 'right', 'total', 'deficit'].join(',')];
  for (const g of fa.groups) for (const x of g.rows) rows.push([q(g.title), q(x.name), q(x.l), q(x.r), q(x.t), q(x.d)].join(','));
  rows.push('', ['phase', 'time_s'].join(','));
  for (const [k, v] of [['start', fa.phases.s], ['braking', fa.phases.b], ['split', fa.phases.z], ['take-off', fa.phases.t], ['landing', fa.phases.l]]) rows.push(k + ',' + (v / fa.fs).toFixed(3));
  saveText((ds.name || 'take').replace(/\.c3d$/i, '') + '_ForceAnalysis.csv', rows.join('\r\n'));
});

/* ---------- toolbar + options */
document.querySelectorAll('.vp-tools [data-view]').forEach(b => b.addEventListener('click', () => {
  const v = b.dataset.view; if (v === 'fit') viewer.fit(); else viewer.view(v);
}));
const bindOpt = (id, key, fn) => $(id).addEventListener('input', e => { viewer.opt[key] = fn(e.target); viewer.invalidate(); });
bindOpt('oLinks', 'links', t => t.checked); bindOpt('oGrid', 'grid', t => t.checked); bindOpt('oAxes', 'axes', t => t.checked);
bindOpt('oPlates', 'plates', t => t.checked); bindOpt('oLabels', 'labels', t => t.value);
bindOpt('oTrail', 'trail', t => parseFloat(t.value)); bindOpt('oSize', 'size', t => parseFloat(t.value));
$('oUnl').addEventListener('input', e => {
  if (!ds) return;
  for (let i = 0; i < ds.nM; i++) if (ds.side[i] === 'U') viewer.setVisible(i, e.target.checked);
  syncChecks();
});
$('bLink').addEventListener('click', () => {
  const on = $('bLink').getAttribute('aria-pressed') !== 'true';
  $('bLink').setAttribute('aria-pressed', on); viewer.setLinkMode(on);
  $('hint').textContent = on ? 'โหมดแก้ไข link: คลิก marker สองตัวเพื่อเพิ่มหรือลบ link (Esc = ออก)' : 'ลาก = หมุน · Shift/คลิกขวา+ลาก = เลื่อน · ล้อ = ซูม · คลิก marker = เลือก';
});
$('bReset').addEventListener('click', () => { if (!ds) return; viewer.links = E.defaultLinks(ds.base); viewer.invalidate(); updateLinkCount(); });

/* ---------- transport */
$('bPlay').addEventListener('click', () => viewer.toggle());
$('bPrev').addEventListener('click', () => { viewer.pause(); viewer.setFrame(Math.floor(viewer.f) - 1); });
$('bNext').addEventListener('click', () => { viewer.pause(); viewer.setFrame(Math.floor(viewer.f) + 1); });
$('slider').addEventListener('input', e => viewer.setFrame(+e.target.value));
$('speed').addEventListener('input', e => { viewer.speed = parseFloat(e.target.value); });
$('loop').addEventListener('input', e => { viewer.loop = e.target.checked; });
document.addEventListener('keydown', e => {
  if (!ds || e.target.matches('input[type="search"], select')) return;
  const step = e.shiftKey ? 10 : 1;
  if (e.code === 'Space' && !e.target.matches('button')) { e.preventDefault(); viewer.toggle(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); viewer.pause(); viewer.setFrame(Math.floor(viewer.f) - step); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); viewer.pause(); viewer.setFrame(Math.floor(viewer.f) + step); }
  else if (e.key === 'Home') { viewer.setFrame(0); }
  else if (e.key === 'End') { viewer.setFrame(ds.nFrames - 1); }
  else if (e.key === 'f' || e.key === 'F') { viewer.fit(); }
  else if (e.key === 'Escape' && viewer.linkMode) { $('bLink').click(); }
});

/* ---------- file loading */
async function openFile(file) {
  try {
    const buf = await file.arrayBuffer();
    const d = E.readC3D(buf, file.name);
    load(d);
  } catch (err) { note('เปิดไฟล์ไม่ได้: ' + err.message, 'err'); }
}
$('file').addEventListener('change', e => { const f = e.target.files[0]; if (f) openFile(f); e.target.value = ''; });
$('btnSample').addEventListener('click', () => load(E.makeSyntheticCMJ()));
const vp = $('vp');
['dragenter', 'dragover'].forEach(t => vp.addEventListener(t, e => { e.preventDefault(); $('drop').hidden = false; }));
['dragleave', 'drop'].forEach(t => vp.addEventListener(t, e => { e.preventDefault(); $('drop').hidden = true; }));
vp.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) openFile(f); });

load(E.makeSyntheticCMJ());
$('bLang').addEventListener('click', () => setLang(LANG === 'en' ? 'th' : 'en'));
window.langChanged = function () { try { updateChart(); if (typeof cmj !== 'undefined' && cmj && fa && fa.ok) drawCmj(fa); } catch (e) { /* charts not ready */ } viewer.invalidate(); };
if (LANG === 'en') setLang('en'); else setLang('th');
})();
