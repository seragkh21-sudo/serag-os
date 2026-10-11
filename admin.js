/* The browser uses only the existing public key and signed-in user's session. */
const adminClient = supabase.createClient('https://kdfbxcdxdhofqidczbot.supabase.co', 'sb_publishable_51lY0ST_vE6v0nogH5RGkQ_z8lJ5EAM');
const el = id => document.getElementById(id);
let page = 1, revision = 0;
const date = value => value ? new Date(value).toLocaleString('ar-EG') : '—';
function clear() { el('dashboard').hidden = true; el('users').replaceChildren(); el('recent').replaceChildren(); el('summary').textContent = ''; }
async function load() {
  const current = ++revision;
  clear();
  for (const id of ['previous', 'next', 'refresh']) el(id).disabled = true;
  el('status').textContent = 'جاري التحقق وتحميل المستخدمين…';
  try {
    const {data: {session}} = await adminClient.auth.getSession();
    if (!session) throw new Error('سجّل الدخول من الصفحة الرئيسية أولًا.');
    const response = await fetch(`/api/admin-users?page=${page}`, {
      headers: {Authorization: `Bearer ${session.access_token}`}, cache: 'no-store'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(({401:'الجلسة انتهت. سجّل الدخول مرة أخرى.',403:'هذه الصفحة متاحة للمالك فقط.',503:'خدمة الإدارة تحتاج إلى إعداد على السيرفر.'})[response.status] || 'تعذّر تحميل المستخدمين. حاول مرة أخرى.');
    if (current !== revision) return;
    for (const user of data.users) {
      const row = document.createElement('tr');
      for (const value of [user.email || user.id, date(user.created_at), user.email_confirmed_at ? 'مؤكد' : 'غير مؤكد', date(user.last_sign_in_at)]) {
        const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
      }
      el('users').appendChild(row);
    }
    const recent = data.users.filter(u => Date.parse(u.created_at) >= Date.now() - 7 * 86400000).sort((a,b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    for (const user of recent) { const item = document.createElement('li'); item.textContent = `${user.email || user.id} — ${date(user.created_at)}`; el('recent').appendChild(item); }
    if (!recent.length) { const item = document.createElement('li'); item.textContent = 'لا توجد تسجيلات حديثة في هذه الصفحة.'; el('recent').appendChild(item); }
    el('summary').textContent = `المعروض: ${data.users.length}${data.total === null ? '' : ` — الإجمالي: ${data.total}`}`;
    el('page').textContent = `صفحة ${page}`;
    el('previous').disabled = page === 1; el('next').disabled = !data.has_next;
    el('dashboard').hidden = false; el('status').textContent = '';
  } catch (error) { if (current === revision) el('status').textContent = error.message; }
  finally { if (current === revision) el('refresh').disabled = false; }
}
el('previous').addEventListener('click', () => { page--; load(); });
el('next').addEventListener('click', () => { page++; load(); });
el('refresh').addEventListener('click', load);
adminClient.auth.onAuthStateChange(() => { ++revision; clear(); setTimeout(load, 0); });
window.addEventListener('pagehide', () => { ++revision; clear(); });
load();
