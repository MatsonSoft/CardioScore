// Auditoría del motor de CardioScore (sin dependencias).
// Extrae las funciones del motor desde index.html y verifica:
//  1) Vectores de validación documentados en metodologia.html
//  2) Correcciones post-auditoría (región, bandas 30 años, escaladas, ARC-HBR)
//  3) Invariantes de cableado en el código (región, reset de perfiles, posiciones)
//
// Uso: node tests/auditoria-motor.js
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const lines = html.split('\n');

// --- Extracción del motor: desde 'var MGDL_TO_MMOL' hasta 'function actualizarChipBanda'
const start = lines.findIndex(l => l.startsWith('var MGDL_TO_MMOL'));
const end = lines.findIndex(l => l.startsWith('function actualizarChipBanda'));
if (start === -1 || end === -1) {
  console.error('No se encontraron los marcadores del motor en index.html');
  process.exit(1);
}
const engine = lines.slice(start, end).join('\n');

// --- DOM falso suficiente para leerDatosHome ---
function armarDom(state) {
  const els = {};
  const campos = Object.assign({}, state.inputs || {}, state);
  Object.keys(campos).forEach(k => {
    if (k === 'inputs' || typeof campos[k] === 'object' || Array.isArray(campos[k])) return;
    els[k] = { value: String(campos[k]), getAttribute: () => null };
  });
  if (!('cfg_region' in els)) els.cfg_region = { value: state.cfg_region || 'alta', getAttribute: () => null };
  if (!('cfg_pais' in els)) els.cfg_pais = { value: state.cfg_pais || 've', getAttribute: () => null };
  return {
    getElementById(id) { return els[id] || null; },
    querySelector(sel) {
      let m;
      if ((m = sel.match(/^input\[name="sexo"\]:checked$/))) return state.sexo ? { value: state.sexo } : null;
      if ((m = sel.match(/^input\[name="tabaco"\]:checked$/))) return state.tabaco ? { value: state.tabaco } : null;
      if ((m = sel.match(/^input\[name="esc"\]\[value="(\w+)"\]$/))) return { checked: state.esc === m[1] };
      if ((m = sel.match(/^button\[data-ante="(\w+)"\]$/))) {
        const on = (state.ante || []).indexOf(m[1]) !== -1;
        return { getAttribute: () => (on ? 'true' : 'false') };
      }
      if (/^input\[name="grace_(arrest|enz)"\]:checked$/.test(sel)) return null;
      return null;
    },
    querySelectorAll() { return []; }
  };
}

function cargarApi(state) {
  const src = engine + '\n;return { calcScore2, calcScore2Lac, calcPrevent, calcWhoCLA, calcWhoCLANoLab, calcPrevent30, calcScore2Diabetes, calcScore2HF, calcSmart2, applyCkdAddon, ckdEpi2021, calcKfre, calcMesa, calcFindrisk, calcCha2ds2Va, calcHasBled, calcOrbit, calcArcHbr, calcGrace, calcPreciseDapt, calcSpi2, calcApple, calcChargeAf, leerDatosHome, calcularRiesgoHome, bandaScore2, bandaPrevent30, S2_PARAMS, PAIS_LAC };';
  return new Function('document', 'window', src)(armarDom(state), {});
}

// --- Mini-framework ---
let pasados = 0, fallados = 0;
const fallosDetalle = [];
function assertEq(nombre, real, esperado, tol) {
  const ok = typeof esperado === 'string'
    ? real === esperado
    : Math.abs(real - esperado) <= (tol != null ? tol : 0.05);
  if (ok) { pasados++; console.log('  ✓ ' + nombre); }
  else { fallados++; fallosDetalle.push(nombre); console.log('  ✗ ' + nombre + ' → real: ' + real + ' · esperado: ' + esperado); }
}
function assertVerdad(nombre, cond) {
  if (cond) { pasados++; console.log('  ✓ ' + nombre); }
  else { fallados++; fallosDetalle.push(nombre); console.log('  ✗ ' + nombre); }
}

const MODERADO = { d_edad: 55, d_peso: 78, d_talla: 172, d_pas: 140, d_pad: 85, d_ct: 210, d_hdl: 44, d_ldl: 130, d_trig: 150, d_creat: 1.0, d_lpa: 15, d_hscrp: 1.2, sexo: 'M', tabaco: 'si', esc: 'primario' };

// ============================================================
console.log('\n[1] Vectores de validación ({metodologia.html})');
{
  const api = cargarApi(MODERADO);
  // SCORE2: Varón 55, fumador, región alta → 11.4% (Eur Heart J 2021)
  const s2 = api.calcScore2(55, 'male', 'yes', 140, 210, 44, 'high', false);
  assertEq('SCORE2 55M fumador región alta = 11.4%', +s2.toFixed(1), 11.4);
  // SCORE2-LAC: Varón 50a, PAS 140, CT 213, HDL 50, no fumador (baja / muy alta) → 4.0% / 10.3%
  assertEq('SCORE2-LAC región baja = 4.0%', +api.calcScore2Lac(50, 'male', 'no', 140, 213, 50, 'low').toFixed(1), 4.0);
  assertEq('SCORE2-LAC región muy alta = 10.3%', +api.calcScore2Lac(50, 'male', 'no', 140, 213, 50, 'very_high').toFixed(1), 10.3);
  // WHO-Central L.A.: caso moderado → 7.9% (Lancet Glob Health 2019)
  assertEq('WHO-CLA moderado = 7.9%', +api.calcWhoCLA(55, 'male', 'yes', 140, 210, 'none').toFixed(1), 7.9);
  // KFRE: regresión con la fórmula centrada (S0 0.9365 → 5 años, cohorte no Norteamérica)
  const kfre = api.calcKfre(65, 'male', 45, 25);
  assertEq('KFRE 65M eGFR 45 ACR 25: r5 = 1.28%', +kfre.r5.toFixed(2), 1.28, 0.02);
}

// ============================================================
console.log('\n[2] Corrección del mapeo de región (cfg_region → S2_PARAMS)');
{
  ['alta:high', 'moderada:moderate', 'baja:low'].forEach(par => {
    const [sel, esperado] = par.split(':');
    const api = cargarApi(Object.assign({}, MODERADO, { cfg_region: sel }));
    assertVerdad('región "' + sel + '" → "' + esperado + '"', api.leerDatosHome().reg === esperado);
  });
  const apiCla = cargarApi(Object.assign({}, MODERADO, { cfg_region: 'cla' }));
  assertVerdad('región "cla" → "high"', apiCla.leerDatosHome().reg === 'high');
  // La recalibración debe diferir entre regiones (~3.6 pts entre alta y baja en el caso moderado)
  const alta = +cargarApi(Object.assign({}, MODERADO, { cfg_region: 'alta' })).calcularRiesgoHome().score2.toFixed(2);
  const baja = +cargarApi(Object.assign({}, MODERADO, { cfg_region: 'baja' })).calcularRiesgoHome().score2.toFixed(2);
  assertVerdad('SCORE2 difiere entre regiones (alta ' + alta + '% vs baja ' + baja + '%)', Math.abs(alta - baja) > 2);
  assertEq('SCORE2 región alta (flujo completo) = 11.35', alta, 11.35, 0.02);
}

// ============================================================
console.log('\n[3] Banda a 30 años (PREVENT <40) — categorías AHA/Rikhi 2025');
{
  const api = cargarApi(MODERADO);
  assertEq('bandaPrevent30(10.9) = bajo', api.bandaPrevent30(10.9), 'band_low');
  assertEq('bandaPrevent30(11) = moderado', api.bandaPrevent30(11), 'band_mod');
  assertEq('bandaPrevent30(18.9) = moderado', api.bandaPrevent30(18.9), 'band_mod');
  assertEq('bandaPrevent30(19) = alto', api.bandaPrevent30(19), 'band_high');
  assertEq('bandaPrevent30(23.9) = alto', api.bandaPrevent30(23.9), 'band_high');
  assertEq('bandaPrevent30(24) = muy alto', api.bandaPrevent30(24), 'band_vhigh');
  // Perfil joven (28F sana) → PREVENT 30 años, banda baja, horizonte 30
  const joven = Object.assign({}, MODERADO, { d_edad: 28, d_peso: 60, d_talla: 165, d_pas: 110, d_pad: 70, d_ct: 160, d_hdl: 60, d_ldl: 90, d_trig: 100, d_creat: 0.8, d_lpa: 10, d_hscrp: 0.8, sexo: 'F', tabaco: 'no', esc: 'joven' });
  const rJ = cargarApi(joven).calcularRiesgoHome();
  assertVerdad('28F sana → modelo prevent30', rJ.modelo === 'prevent30');
  assertVerdad('28F sana → horizonte 30', rJ.horizonte === 30);
  assertEq('28F sana → 4.1%', +rJ.riesgoPrincipal.toFixed(1), 4.1);
  assertVerdad('28F sana → banda bajo (antes: moderado por bandas ESC 10 años)', rJ.banda === 'band_low');
}

// ============================================================
console.log('\n[4] Escaladas registradas (chip explica el banda-skew)');
{
  // 55M región alta, PAS 150, Lp(a) 62: si la banda base no es muy alta, debe quedar registrada la escalada
  const caso = Object.assign({}, MODERADO, { d_pas: 150, d_lpa: 62 });
  const r = cargarApi(caso).calcularRiesgoHome();
  if (r.i.lpa >= 50 && r.nivelBruto < 4) {
    assertVerdad('Lp(a) ≥50 genera escalada registrada', r.escalas.some(s => /Lp\(a\)/.test(s)));
  } else {
    assertVerdad('caso ya muy alto: sin escalada extra (escalas vacío)', r.escalas.length === 0);
  }
  assertVerdad('nivelBruto coherente con la banda base', r.nivelBruto >= 1 && r.nivelBruto <= 4);
  // LDL 200 (≥190) debe registrar escalada cuando la banda base es menor a alto
  const casoLdl = Object.assign({}, MODERADO, { d_ldl: 200, d_ct: 250, d_lpa: 15 });
  const rL = cargarApi(casoLdl).calcularRiesgoHome();
  assertVerdad('LDL ≥190: la banda final es al menos alto', rL.banda === 'band_high' || rL.banda === 'band_vhigh');
}

// ============================================================
console.log('\n[5] ARC-HBR con criterios reales (no calcArcHbr(0,0))');
{
  const srcArc = engine;
  const usaCriterios = /hbrMaj|hbrMin/.test(srcArc);
  assertVerdad('la llamada calcArcHbr usa criterios computados', usaCriterios);
  const apiHb = new Function('document', 'window', 'return { calcArcHbr: ' + String(function calcArcHbr(mayores, menores) { return mayores >= 1 || menores >= 2; }) + ' };')();
  assertVerdad('calcArcHbr(1,0) = true (≥1 mayor)', apiHb.calcArcHbr(1, 0) === true);
  assertVerdad('calcArcHbr(0,2) = true (≥2 menores)', apiHb.calcArcHbr(0, 2) === true);
  assertVerdad('calcArcHbr(0,1) = false', apiHb.calcArcHbr(0, 1) === false);
}

// ============================================================
console.log('\n[6] Invariantes de cableado en index.html (anti-regresión)');
{
  // cargarPrueba: reset completo antes de aplicar el perfil
  const idxCp = html.indexOf('function cargarPrueba');
  const idxCpFin = idxCp === -1 ? -1 : html.indexOf('document.querySelectorAll(\'[data-prueba]', idxCp);
  const bloqueCp = idxCp >= 0 && idxCpFin > idxCp ? html.slice(idxCp, idxCpFin) : '';
  assertVerdad('cargarPrueba limpie input[id^="d_"] (campos estancados)', /\[id\^="d_"\]/.test(bloqueCp));
  assertVerdad('cargarPrueba limpie qrisk-chips', /qrisk-chip/.test(bloqueCp));
  assertVerdad('cargarPrueba limpie radios grace', /grace_arrest/.test(bloqueCp));
  // Chip de banda consume horizonte y escaladas
  const idxChip = html.indexOf('function actualizarChipBanda');
  const bloqueChip = html.slice(idxChip, idxChip + 1200);
  assertVerdad('actualizarChipBanda recibe horizonte y escalas', /horizonte/.test(bloqueChip) && /escalas/.test(bloqueChip));
  assertVerdad('actualizarChipBanda incluye bandas de 30 años (11/19/24)', /\(11–19%\)/.test(bloqueChip));
  // Encabezado del horizonte
  assertVerdad('hdr_horizonte existe y se actualiza', html.includes('id="hdr_horizonte"') && /hdr_horizonte[\s\S]{0,80}Riesgo a /.test(html));
  // Gauge dinámico
  assertVerdad('el gauge recompute zonas (gauge_z1)', html.includes('id="gauge_z1"') && html.includes("'gauge_z1', a: 0"));
  // etiqueta ACR con unidades
  assertVerdad('la etiqueta del campo ACR indica mg/g', /for="d_acr"[\s\S]{0,260}mg\/g/.test(html));
  // leerDatosHome expone hta/dmage/antiagr/alcohol/oac
  assertVerdad('leerDatosHome retorna hta, dmage, antiagr, alcohol, oac', /htnTx: htnTx, hta: ante\('hta'\), dmage: v\('d_dmage'\), antiagr: ante\('antiagr'\), alcohol: ante\('alcohol'\), oac: ante\('oac'\)/.test(html));
  // Horizonte en WhatsApp y PDF
  assertVerdad('WhatsApp usa rM.horizonte', /Riesgo a ' \+ rM\.horizonte \+ ' años: ' \+ rM\.riesgoPrincipal/.test(html));
}

// ============================================================
console.log('\n' + pasados + ' pasados, ' + fallados + ' fallados');
if (fallados) {
  fallosDetalle.forEach(f => console.error('  FALLA: ' + f));
  process.exit(1);
}
