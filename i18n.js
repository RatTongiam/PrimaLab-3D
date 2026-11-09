/* ---------- TH/EN switch: Thai is the source text; English via phrase tables applied to DOM text + canvas strings */
let LANG = 'th';
try { const s = localStorage.getItem('primalab.lang'); if (s === 'en' || s === 'th') LANG = s; } catch (e) { /* storage unavailable */ }
const I18N_EXACT = {
  'วน': 'Loop', 'ปิด': 'Off', 'ทั้งหมด': 'All', 'ไม่เลือก': 'None', 'ขนาด': 'Size', 'ไฟล์': 'File', 'ชื่อ': 'Name', 'ความถี่': 'Rate', 'เฟรม': 'Frames',
  'รวม': 'Total', 'ซ้าย': 'Left', 'ขวา': 'Right', 'เล่น': 'Play', 'ไม่แสดง': 'None', 'เมนู': 'Menu', '◧ เมนู': '◧ Menu', '◨ เมนู': '◨ Menu', 'ไม่พบ': 'Not found',
  'ความเร็ว': 'Speed', 'Fz รวม': 'Fz total', 'ความเร็ว COM': 'COM velocity', 'เลือก': 'Select',
  'ส่วนสูง (cm)': 'Height (cm)', 'น้ำหนัก (kg)': 'Weight (kg)', 'เพศ': 'Sex', 'ชาย': 'Male', 'หญิง': 'Female', 'ชาย (M)': 'Male (M)', 'หญิง (F)': 'Female (F)'
};
const I18N_FRAG = [
  ['หน่วยเมตร', 'units: metres'], ['ข้อมูลสังเคราะห์', 'Synthetic data'], ['โหลดตัวอย่าง', 'Load sample'], ['เปิดไฟล์ C3D', 'Open C3D file'],
  ['มุมมอง 3D ของ marker', '3D view of markers'], ['มุมมอง 3D', '3D view'], ['มุมมองกล้อง', 'Camera views'],
  ['ซ่อน/แสดงเมนูด้านข้าง เพื่อขยายหน้า 3D และกราฟ', 'Show/hide the side menu to enlarge the 3D view and charts'],
  ['มุมเฉียง', 'Isometric view'], ['มองจากด้านบน', 'View from above'], ['มองข้าง แกน X ไปทางขวา', 'Side view, X axis to the right'], ['มองข้าง แกน Y ไปทางขวา', 'Side view, Y axis to the right'],
  ['จัดให้พอดีกับข้อมูล', 'Fit to data'], ['ลาก = หมุน', 'Drag = rotate'], ['Shift/คลิกขวา+ลาก = เลื่อน', 'Shift/right-drag = pan'], ['ล้อ = ซูม', 'Wheel = zoom'], ['คลิก marker = เลือก', 'Click marker = select'],
  ['วางไฟล์ .c3d ที่นี่', 'Drop a .c3d file here'], ['ตัวเลือกการแสดงผล', 'Display options'], ['แกน Lab', 'Lab axes'], ['รูปร่าง segment', 'Segment shapes'], ['แกน segment / JC', 'Segment axes / JC'],
  ['ชื่อ marker', 'Marker names'], ['เฉพาะที่เลือก', 'Selected only'], ['ขนาด marker', 'Marker size'], ['แก้ไข link', 'Edit links'], ['รีเซ็ต link', 'Reset links'],
  ['คลิก marker สองตัวเพื่อเพิ่มหรือลบ link', 'Click two markers to add or remove a link'], ['กลับไปใช้ link อัตโนมัติจากชื่อ marker', 'Revert to automatic links from marker names'],
  ['โหมดแก้ไข link: คลิก marker สองตัวเพื่อเพิ่มหรือลบ link (Esc = ออก)', 'Link edit mode: click two markers to add or remove a link (Esc = exit)'],
  ['ควบคุมเวลา', 'Playback controls'], ['เฟรมก่อนหน้า', 'Previous frame'], ['เฟรมถัดไป', 'Next frame'], ['เล่น/หยุด', 'Play/Pause'], ['หยุดชั่วคราว', 'Pause'], ['ตำแหน่งเฟรม', 'Frame position'],
  ['ผู้ทดสอบ & สัดส่วน (Anthropometry)', 'Subject & Anthropometry'], ['ผู้ทดสอบ & สัดส่วน', 'Subject & Anthropometry'],
  ['ประมาณการและนำไปใช้', 'Estimate & Apply'], ['ส่วนสูง (cm)', 'Height (cm)'], ['น้ำหนัก (kg)', 'Weight (kg)'],
  ['* ค่า width เป็นเพียงค่าประมาณการเบื้องต้น แนะนำให้ใช้คาลิปเปอร์วัดจริง', '* Knee/ankle widths are rough initial estimates. Direct measurement is strongly recommended.'],
  ['มุมข้อต่อ (แบบ V3D)', 'Joint angles (V3D-style)'], ['คำนวณมุมข้อต่อ', 'Compute joint angles'], ['มุมข้อต่อ', 'Joint angles'], ['ส่งออก CSV', 'Export CSV'],
  ['Plug-in Gait style · Y-X-Z (ชุด 18 marker)', 'Plug-in Gait style · Y-X-Z (18-marker set)'], ['โหลดไฟล์ static แยก', 'Load separate static file'], ['ใช้ trial นี้เป็น static', 'Use this trial as static'], ['Static: ใช้ frame ต้นของ trial ที่เปิดอยู่', 'Static: uses the first frames of the open trial'],
  ['ลบค่าเฉลี่ยช่วง static (zero offset)', 'Subtract static-period mean (zero offset)'], ['จำนวน frame', 'No. of frames'], ['Static: frame เริ่ม', 'Static: start frame'],
  ['ค่า width เป็น placeholder ต้องวัดจริง', 'width values are placeholders — measure real ones'], ['ยังไม่เทียบกับ Visual3D', 'not yet compared with Visual3D'],
  ['ค้นหาชื่อ', 'Search name'], ['ค้นหา marker', 'Search markers'], ['คีย์ลัด', 'Shortcuts'], ['ยกเลิกโหมด link', 'cancel link mode'], ['±1 เฟรม', '±1 frame'], ['±10', '±10'],
  ['หน่วยในไฟล์', 'File units'], [' → แสดงเป็น m', ' → shown as m'], ['ข้อมูลขาด', 'Missing data'], ['รายการ', 'items'], ['แสดง ', 'Show '], ['สัดส่วนเฟรมที่มีข้อมูล', 'Fraction of frames with data'],
  ['คลิก marker ในมุมมอง 3D หรือในรายการ เพื่อดูกราฟ', 'Click a marker in the 3D view or the list to plot it'], ['ตำแหน่งใน lab frame (m)', 'position in lab frame (m)'],
  ['กด “วิเคราะห์ FP” ก่อน', 'Press “Analyze FP” first'], ['กด “คำนวณมุมข้อต่อ” ก่อน', 'Press “Compute joint angles” first'],
  ['Fz หลังกรอง ลบ offset flight (N)', 'Fz filtered, flight offset removed (N)'], [' · ลบ offset static', ' · static offset removed'], ['GRF ใน lab frame (N)', 'GRF in lab frame (N)'], [' · สังเคราะห์', ' · synthetic'],
  ['ไม่มีข้อมูล force plate', 'No force plate data'], ['กราฟตามเวลา B คลิกหรือลากเพื่อเลื่อนเฟรม', 'Time chart B — click or drag to scrub frames'], ['กราฟตามเวลา คลิกหรือลากเพื่อเลื่อนเฟรม', 'Time chart — click or drag to scrub frames'],
  ['เลือกข้อต่อ กราฟ B', 'Choose joint (chart B)'], ['เลือก marker กราฟ B', 'Choose marker (chart B)'], ['เลือกข้อต่อ', 'Choose joint'], ['เทียบ 2 กราฟ', 'Compare 2 charts'],
  ['force plate ใน C3D', 'force plate in C3D'], ['เลือกช่วงเวลา', 'Select time window'], ['ใส่มวลกาย', 'Enter body mass'], ['มวลกาย (kg)', 'Body mass (kg)'], ['Quiet เริ่ม (s)', 'Quiet start (s)'], ['Quiet จบ (s)', 'Quiet end (s)'],
  ['fn ของ plate (Hz)', 'Plate fn (Hz)'], ['Plate ซ้าย / ขวา', 'Plate left / right'], ['วิเคราะห์ FP', 'Analyze FP'], ['เวลา phase (s)', 'Phase times (s)'], ['คำนวณใหม่', 'Recalculate'], ['กลับเป็น auto', 'Back to auto'],
  ['กราฟแรงช่วง CMJ แยกตาม phase คลิกหรือลากเพื่อเลื่อนเฟรม', 'CMJ force chart by phase — click or drag to scrub frames'], ['กราฟความเร็วจุดศูนย์กลางมวลช่วง CMJ', 'CMJ centre-of-mass velocity chart'],
  ['พบ force plate ที่ใช้ได้ ', 'Usable force plates found: '], [' แผ่นใน C3D', ' in C3D'], [' · แผ่นเดียว: แสดงเฉพาะค่ารวม (ไม่มี L/R)', ' · single plate: totals only (no L/R)'], [' · เลือกแผ่นซ้าย/ขวาได้', ' · left/right plates selectable'],
  [' · พอร์ตจาก Force-Analysis', ' · ported from Force-Analysis'], [' จาก ', ' from '], ['ข้ามการวิเคราะห์: ', 'Analysis skipped: '], ['f ที่ใช้ (Hz)', 'f used (Hz)'],
  ['Fz ช่วง CMJ (N)', 'Fz during CMJ (N)'], ['ความเร็วจุดศูนย์กลางมวล (m/s)', 'Centre-of-mass velocity (m/s)'], ['บันทึกไฟล์ไม่ได้: ', 'Could not save file: '], ['เปิดไฟล์ไม่ได้: ', 'Could not open file: '],
  ['(marker ขยับสูงสุด ', '(max marker movement '], ['ตัวอย่างสังเคราะห์', 'Synthetic sample'], ['แรงสังเคราะห์จากความสูงสะโพก (ไม่ใช่ข้อมูลวัดจริง)', 'Force synthesised from hip height (not measured data)'],
  ['(หลาย prefix)', '(multiple prefixes)'], ['ไฟล์เล็กเกินไปสำหรับ C3D', 'File too small to be a C3D'], ['ไม่ใช่ไฟล์ C3D (byte ที่ 2 ของ header ต้องเป็น 80)', 'Not a C3D file (header byte 2 must be 80)'],
  ['รองรับเฉพาะ C3D แบบ Intel/PC (processor type 84) ไฟล์นี้เป็น type ', 'Only Intel/PC C3D (processor type 84) is supported; this file is type '], ['ไม่พบ POINT:USED ในไฟล์ (ไม่มีข้อมูล marker)', 'POINT:USED not found (no marker data)'],
  ['ไฟล์สั้นกว่าจำนวนเฟรมที่ header ระบุ', 'File is shorter than the frame count in the header'], [' จาก ', ' of '], ['อ่านจำนวนเฟรมไม่ได้', 'Could not read the frame count'],
  ['ไม่พบ POINT:UNITS เดาหน่วยเป็น ', 'POINT:UNITS missing; guessed units: '], ['มิลลิเมตร', 'millimetres'], ['เมตร', 'metres'], ['พารามิเตอร์ force plate ไม่ครบ', 'Force plate parameters incomplete'],
  ['ยังไม่รองรับ FP_TYPE ', 'Unsupported FP_TYPE '], ['(รองรับ 2 และ 4)', '(supported: 2 and 4)'], ['index ของ analog channel ไม่ถูกต้อง', 'Invalid analog channel index'], ['FP_TYPE 4 แต่ไม่มี CAL_MATRIX', 'FP_TYPE 4 but no CAL_MATRIX'],
  [' · กลับเครื่องหมายแรงให้ชี้ขึ้น', ' · force sign flipped to point up'], ['(เดา)', '(guessed)'],
  ['ไม่พบ marker: ', 'Markers not found: '], ['marker ', 'marker '], [' ไม่มีข้อมูลในช่วง static', ' has no data in the static range'],
  ['marker ขยับในช่วง static สูงสุด ', 'Markers moved up to '], [' (>5 mm) ช่วง static อาจไม่นิ่ง', ' (>5 mm) during static; static may not be still'],
  ['มุมแกนกลาง (ab/adduction) สูงสุด ', 'Middle-axis (ab/adduction) angle reaches '], ['° ใกล้ gimbal lock ค่ามุมสามแกนอาจไม่น่าเชื่อถือ', '° near gimbal lock; the three-axis angles may be unreliable'],
  ['ไฟล์สั้นเกินไปสำหรับหา quiet window', 'File too short to find a quiet window'], ['แทบไม่มีช่วงที่มีโหลดบนแผ่น (> 100 N)', 'Almost no loaded period on the plate (> 100 N)'],
  ['ไม่พบช่วง ', 'No '], [' s ที่แรงรวมนิ่งใกล้ระดับโหลดปกติ (', ' s window found with steady total force near normal load ('], ['ต่ำกว่า', 'is below'],
  ['ช่วงยืนนิ่งที่ดีที่สุดยังมี CV ', 'Best quiet-standing window still has CV '], ['ช่วง landing สั้นเกินไปสำหรับ FFT', 'Landing window too short for FFT'], ['flight สั้นเกินไป ใช้ noise floor ไม่ได้ (ข้าม f_snr)', 'Flight too short to use as noise floor (f_snr skipped)'],
  ['f_rise เป็นค่าประมาณหยาบ', 'f_rise is only a rough estimate'], ['หา onset/10%/90% ไม่ได้ (สัญญาณเริ่มสูงอยู่แล้ว หรือไม่มี impact ชัด)', 'Could not find onset/10%/90% (signal already high at start, or no clear impact)'],
  ['spectrum ไม่ตกต่ำกว่า noise floor ก่อน Nyquist: f_snr = Nyquist (อาจมี aliasing/noise สูง)', 'Spectrum never falls below the noise floor before Nyquist: f_snr = Nyquist (possible aliasing/high noise)'],
  ['ไม่มี force plate ที่ใช้ได้ใน C3D นี้ (ต้องเป็น FP_TYPE 2/4 และมี analog)', 'No usable force plate in this C3D (needs FP_TYPE 2/4 and analog data)'], ['ไม่พบ analog rate', 'Analog rate not found'],
  ['เลือก plate ซ้าย/ขวาไม่ถูกต้อง (ต้องเป็นคนละแผ่น)', 'Invalid left/right plate selection (must be different plates)'], ['น้ำหนักที่ระบุ ', 'specified weight '],
  ['ไม่พบ window อัตโนมัติ (ใช้ 0.5 s แรก)', 'no automatic window found (using the first 0.5 s)'], ['หา quiet-standing window อัตโนมัติไม่ผ่านเกณฑ์: ', 'Automatic quiet-standing window failed the criteria: '],
  ['BW ที่ใช้ = ', 'BW used = '], [' (< 200 N) ช่วงที่เลือกน่าจะไม่มีคนยืนบนแผ่น', ' (< 200 N); the selected window probably has nobody standing on the plate'], ['ช่วง quiet window สั้นกว่า 0.25 s', 'Quiet window is shorter than 0.25 s'],
  ['หยุดการคำนวณเพื่อไม่ให้ได้ค่าที่ผิดปกติ: ', 'Calculation stopped to avoid abnormal values: '], [' · เลือกช่วงยืนนิ่งเอง หรือใส่น้ำหนักตัว', ' · choose the quiet-standing window manually or enter body weight'],
  ['ช่วงที่เลือกยังไม่นิ่งมาก', 'Selected window is not very steady'], ['ลำดับเวลา phase ไม่เรียงจาก start < braking < split < take-off < landing', 'Phase times are not in order start < braking < split < take-off < landing'],
  ['ไม่พบ flight phase ที่ชัดเจน (ช่วงที่แรง < 25 N ยาว > 0.1 s หลัง 0.5 s แรก)', 'No clear flight phase found (force < 25 N for > 0.1 s after the first 0.5 s)'], [' · ข้อมูลนี้อาจไม่ใช่การกระโดด CMJ ค่า phase และ metric จึงอาจไม่มีความหมาย', ' · this may not be a CMJ, so phases and metrics may be meaningless'],
  ['จาก ', 'from ']
];
const _frags = I18N_FRAG.slice().sort((a, b) => b[0].length - a[0].length);
function T(s) {
  if (LANG !== 'en' || typeof s !== 'string' || !/[฀-๿]/.test(s)) return s;
  const ex = I18N_EXACT[s.trim()]; if (ex) return s.replace(s.trim(), ex);
  const hold = []; let o = s;
  for (const [th, en] of _frags) { if (o.indexOf(th) < 0) continue; o = o.split(th).join('' + hold.length + ''); hold.push(en); }
  return o.replace(/(\d+)/g, (m, i) => hold[+i]);
}
const _txt = new WeakMap(), _att = new WeakMap(), ATTRS = ['title', 'aria-label', 'placeholder'];
function trNode(n) {
  if (n.nodeType === 3) {
    const v = n.nodeValue, rec = _txt.get(n);
    if (rec && v === rec.en) { if (LANG === 'th') { n.nodeValue = rec.th; _txt.delete(n); } return; }
    if (LANG === 'en' && /[฀-๿]/.test(v)) { const en = T(v); if (en !== v) { _txt.set(n, { th: v, en }); n.nodeValue = en; } }
    else if (rec) _txt.delete(n);
  } else if (n.nodeType === 1) {
    for (const a of ATTRS) {
      if (!n.hasAttribute(a)) continue;
      const v = n.getAttribute(a); let m = _att.get(n); if (!m) { m = {}; _att.set(n, m); }
      const rec = m[a];
      if (rec && v === rec.en) { if (LANG === 'th') { n.setAttribute(a, rec.th); delete m[a]; } continue; }
      if (LANG === 'en' && /[฀-๿]/.test(v)) { const en = T(v); if (en !== v) { m[a] = { th: v, en }; n.setAttribute(a, en); } } else if (rec) delete m[a];
    }
  }
}
function trTree(root) {
  trNode(root);
  const w = document.createTreeWalker(root, 1 | 4); let n; while ((n = w.nextNode())) trNode(n);
}
const _mo = new MutationObserver(ms => {
  for (const m of ms) {
    if (m.type === 'characterData') trNode(m.target);
    else if (m.type === 'attributes') trNode(m.target);
    else for (const a of m.addedNodes) trTree(a);
  }
});
_mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
function setLang(l) {
  LANG = l; try { localStorage.setItem('primalab.lang', l); } catch (e) { /* ignore */ }
  document.documentElement.lang = l; trTree(document.body);
  const b = document.getElementById('bLang'); if (b) { b.textContent = l === 'en' ? 'ไทย' : 'EN'; b.title = l === 'en' ? 'เปลี่ยนเป็นภาษาไทย' : 'Switch to English'; b.setAttribute('aria-label', b.title); }
  if (typeof langChanged === 'function') langChanged();
}
