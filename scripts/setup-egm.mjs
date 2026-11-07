import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Development-only reference checkout. Never runs upstream installation scripts.
const root = fileURLToPath(new URL('../', import.meta.url));
const target = fileURLToPath(new URL('../.egm/upstream', import.meta.url));
const revision = 'e9e1f06aa4e26e95cd4ed37210a0632202c429e9';
const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' }).toString().trim();
mkdirSync(new URL('../.egm/', import.meta.url), { recursive: true });
if (!existsSync(target)) {
  git('clone', '--no-checkout', 'https://github.com/google/elephant-goldfish-model.git', target);
  git('-C', target, 'checkout', '--detach', revision);
}
if (git('-C', target, 'rev-parse', 'HEAD') !== revision) {
  throw new Error('EGM checkout differs from the pinned revision; inspect it manually. No files were reset.');
}
if (git('-C', target, 'status', '--porcelain')) {
  throw new Error('EGM checkout has local changes; inspect them manually. No files were reset.');
}
console.log(`EGM reference ready: ${target}\nRevision: ${revision}\nRead docs/codex.md and the selected skills/*/SKILL.md before use. This does not install a native plugin.`);
