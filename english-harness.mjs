// Read-only harness for the English library integration checks.
// It never writes files, never touches the network, never talks to Supabase.
// It reads shell-loader.js / legacy.html to learn the production script order,
// then loads only the CONTENT files (data) into an isolated vm sandbox.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

/** Content files that exist in the repo but are intentionally not wired yet. Every entry needs a reason. */
export const KNOWN_UNWIRED = {
  'english-vocab-v23.js': 'Deployed as a static file but never referenced by shell-loader.js. Decision pending (audit 2026-10-23).',
};

/** Files loaded into the sandbox (data only). Extend if a new data file family is added. */
export const CONTENT_PATTERN = /^english-(content|grammar|supplement|levels|source-curriculum|context|phrases|review-v10-data|vocab|library)[a-z0-9-]*\.js$/;

/** Any english-*.js file; used only to detect files that exist but are not wired. */
export const ANY_ENGLISH_JS = /^english-[a-z0-9-]*\.js$/;

/** Category names that english-learning-v6.js reads for «كلمات النهارده» (verified in production source 2026-10-23). */
export const ROTATION_CATEGORIES = new Set([
  'Work & Office', 'Jobs & Interviews', 'HR & People', 'Company & Business', 'Marketing & Sales', 'Meetings', 'Design & Motion',
  'Everyday', 'Slang & Natural', 'Idioms', 'Phrasal Verbs', 'Creative',
]);

const here = path.dirname(fileURLToPath(import.meta.url));

export function findRoot() {
  const starts = [process.env.SERAG_ROOT, process.cwd(), here].filter(Boolean);
  for (const start of starts) {
    let dir = path.resolve(start);
    for (let i = 0; i < 6; i += 1) {
      if (fs.existsSync(path.join(dir, 'shell-loader.js'))) return dir;
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
  }
  throw new Error('shell-loader.js not found. Run from the repository root or set SERAG_ROOT.');
}

/** Approximation of the normalisation used by word-practice-v21.js (NFKC, lowercase, apostrophes, light punctuation). */
export const norm = (s) => String(s == null ? '' : s)
  .normalize('NFKC').toLowerCase()
  .replace(/[\u2018\u2019\u02bc]/g, "'")
  .replace(/[.,!?;:]/g, ' ')
  .replace(/\s+/g, ' ').trim();

function scriptRefs(text) {
  const out = [];
  const re = /<script\s+src="\/([^"?\s]+\.js)(?:\?[^"]*)?"/g;
  let m;
  while ((m = re.exec(text))) out.push(m[1]);
  return out;
}

/** Ordered, de-duplicated local script references. legacy.html scripts run first, then the ones injected by shell-loader.js. */
export function readRefs(root) {
  const read = (f) => (fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), 'utf8') : '');
  const legacy = scriptRefs(read('legacy.html'));
  const loader = scriptRefs(read('shell-loader.js'));
  const uniq = (arr) => [...new Set(arr)];
  return { legacy: uniq(legacy), loader: uniq(loader), all: new Set([...legacy, ...loader]), ordered: uniq([...legacy, ...loader]) };
}

export function makeSandbox() {
  const noop = () => {};
  const store = new Map();
  const el = () => ({ style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false }, setAttribute: noop, addEventListener: noop, appendChild: noop, querySelector: () => null, querySelectorAll: () => [] });
  const sandbox = {
    console: { log: noop, warn: noop, error: noop, info: noop, debug: noop },
    setTimeout: () => 0, setInterval: () => 0, clearTimeout: noop, clearInterval: noop, requestAnimationFrame: noop,
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
    document: { querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, addEventListener: noop, createElement: el, body: el(), documentElement: el() },
    navigator: { userAgent: 'node' }, location: { href: 'http://localhost/', hash: '', search: '' },
    addEventListener: noop, removeEventListener: noop,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  return vm.createContext(sandbox);
}

export function loadFiles(root, files) {
  const ctx = makeSandbox();
  const errors = [];
  for (const f of files) {
    try {
      vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f, timeout: 5000 });
    } catch (e) {
      errors.push({ file: f, error: String((e && e.message) || e) });
    }
  }
  return { ctx, errors };
}

export const contentFilesInOrder = (refs) => refs.loader.filter((f) => CONTENT_PATTERN.test(f));

export const seragGlobals = (ctx) => Object.keys(ctx).filter((k) => k.startsWith('SERAG_')).sort();

/** Generic shape description that does not assume a schema. */
export function describe(value) {
  if (Array.isArray(value)) return { type: 'array', length: value.length };
  if (value && typeof value === 'object') {
    const keys = {};
    for (const [k, v] of Object.entries(value)) {
      if (Array.isArray(v)) keys[k] = `array[${v.length}]`;
      else if (typeof v === 'function') keys[k] = 'function';
      else if (v && typeof v === 'object') keys[k] = `object{${Object.keys(v).length}}`;
      else keys[k] = typeof v;
    }
    return { type: 'object', keys };
  }
  return { type: typeof value };
}

export const isVocabRow = (r) => Array.isArray(r) && r.length === 5 && r.every((x) => typeof x === 'string' && x.trim());

export function vocabStats(ctx) {
  const rows = ctx.SERAG_ENGLISH_V9?.vocabulary;
  if (!Array.isArray(rows)) return null;
  const valid = rows.filter(isVocabRow);
  const byKey = new Map();
  for (const r of valid) {
    const k = norm(r[0]);
    byKey.set(k, [...(byKey.get(k) || []), r[2]]);
  }
  const duplicates = [...byKey].filter(([, cats]) => cats.length > 1).map(([term, cats]) => ({ term, categories: cats }));
  const categories = {};
  for (const r of valid) categories[r[2]] = (categories[r[2]] || 0) + 1;
  const hyphenated = valid.map((r) => r[0]).filter((t) => /[-\u2010-\u2015]/.test(t));
  return { total: rows.length, valid: valid.length, invalid: rows.length - valid.length, unique: byKey.size, duplicates, categories, hyphenated };
}

/** Finds question arrays in any SERAG_* global (array of questions, or an object with .questions). */
export function questionSources(ctx) {
  const out = [];
  for (const name of seragGlobals(ctx)) {
    const v = ctx[name];
    const rows = Array.isArray(v) ? v : Array.isArray(v?.questions) ? v.questions : null;
    if (rows && rows.length && rows.every((q) => q && typeof q === 'object' && 'options' in q && 'answer' in q)) out.push({ source: name, rows });
  }
  return out;
}

export function checkQuestions(rows) {
  const ids = new Map();
  const bad = { missingId: 0, answerNotInOptions: [], duplicateOptions: [], emptyExplanation: 0 };
  for (const q of rows) {
    if (q.id == null || q.id === '') bad.missingId += 1;
    else ids.set(q.id, (ids.get(q.id) || 0) + 1);
    const opts = Array.isArray(q.options) ? q.options : [];
    if (!opts.includes(q.answer)) bad.answerNotInOptions.push(q.id);
    if (new Set(opts).size !== opts.length) bad.duplicateOptions.push(q.id);
    if (!String(q.explanation || '').trim()) bad.emptyExplanation += 1;
  }
  const duplicateIds = [...ids].filter(([, n]) => n > 1).map(([id]) => id);
  return { count: rows.length, duplicateIds, ...bad };
}

export function grammarStats(ctx) {
  const v10 = ctx.SERAG_GRAMMAR_V10;
  const v9 = ctx.SERAG_ENGLISH_V9?.grammar;
  const res = { v9Cards: Array.isArray(v9) ? v9.length : null, v10Lessons: Array.isArray(v10) ? v10.length : null };
  if (Array.isArray(v10)) {
    const ids = new Map();
    const byLevel = {};
    const byTrack = {};
    let badQuiz = 0;
    for (const g of v10) {
      ids.set(g.id, (ids.get(g.id) || 0) + 1);
      byLevel[g.level || '(none)'] = (byLevel[g.level || '(none)'] || 0) + 1;
      byTrack[g.track || '(none)'] = (byTrack[g.track || '(none)'] || 0) + 1;
      if (!Array.isArray(g.quiz) || g.quiz.length !== 3 || g.quiz.some((x) => typeof x !== 'string' || !x.trim())) badQuiz += 1;
    }
    res.duplicateIds = [...ids].filter(([, n]) => n > 1).map(([id]) => id);
    res.byLevel = byLevel;
    res.byTrack = byTrack;
    res.badQuiz = badQuiz;
  }
  return res;
}

/** What would an unwired patch add? Loads it in a fresh sandbox right after english-source-curriculum-v1.js (the proposed slot). */
export function simulateUnwired(root, contentFiles, unwiredFile) {
  const base = loadFiles(root, contentFiles);
  const at = contentFiles.indexOf('english-source-curriculum-v1.js');
  const withPatch = at >= 0
    ? [...contentFiles.slice(0, at + 1), unwiredFile, ...contentFiles.slice(at + 1)]
    : [...contentFiles, unwiredFile];
  const sim = loadFiles(root, withPatch);
  const count = (ctx, key) => (Array.isArray(ctx.SERAG_ENGLISH_V9?.[key]) ? ctx.SERAG_ENGLISH_V9[key].length : null);
  const before = vocabStats(base.ctx);
  const after = vocabStats(sim.ctx);
  const baseTerms = new Set((base.ctx.SERAG_ENGLISH_V9?.vocabulary || []).map((r) => norm(r?.[0])));
  const added = (sim.ctx.SERAG_ENGLISH_V9?.vocabulary || []).filter((r) => !baseTerms.has(norm(r?.[0])));
  const catsOutsideRotation = {};
  for (const r of added) if (!ROTATION_CATEGORIES.has(r[2])) catsOutsideRotation[r[2]] = (catsOutsideRotation[r[2]] || 0) + 1;
  return {
    file: unwiredFile,
    loadErrors: sim.errors,
    vocabulary: { before: count(base.ctx, 'vocabulary'), after: count(sim.ctx, 'vocabulary'), uniqueBefore: before?.unique ?? null, uniqueAfter: after?.unique ?? null },
    grammar: { before: count(base.ctx, 'grammar'), after: count(sim.ctx, 'grammar') },
    addedVocabularyInRotationCategories: added.length - Object.values(catsOutsideRotation).reduce((a, b) => a + b, 0),
    addedVocabularyOutsideRotation: catsOutsideRotation,
    selfReportedStats: sim.ctx.SERAG_ENGLISH_V23_STATS || null,
  };
}
