const API = (window.THEBES_API_BASE || '').replace(/\/$/, '');

const GENERIC_EMAIL_DOMAINS = new Set([
  'gmail.com','googlemail.com','yahoo.com','yahoo.co.in','outlook.com','hotmail.com','live.com','msn.com',
  'icloud.com','me.com','mac.com','aol.com','proton.me','protonmail.com','gmx.com','gmx.net','mail.com',
  'zoho.com','yandex.com','yandex.ru','rediffmail.com'
]);
function isCompanyEmail(email='') {
  const parts = String(email).trim().toLowerCase().split('@');
  return parts.length === 2 && parts[0] && parts[1] && !GENERIC_EMAIL_DOMAINS.has(parts[1]);
}

function statusClass(status='') {
  return status.toLowerCase().replace(/\s+/g,'-');
}
function escapeHtml(v='') {
  return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function getToken(){ return localStorage.getItem('thebes_token') || ''; }
function setToken(token){ if(token) localStorage.setItem('thebes_token', token); }
function clearToken(){ localStorage.removeItem('thebes_token'); }
async function api(path, options={}) {
  const headers = {...(options.headers||{})};
  if (!(options.body instanceof FormData)) headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, {...options, headers});
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  if (data.token) setToken(data.token);
  return data;
}
function showMessage(type, text) {
  const el = document.querySelector('.' + type);
  if (!el) return;
  el.textContent = text; el.classList.add('show');
  const other = document.querySelector('.' + (type === 'error' ? 'success' : 'error'));
  if (other) other.classList.remove('show');
}
async function requireUser(role) {
  try {
    const data = await api('/auth/me.php');
    if (!data.user || (role && data.user.role !== role)) throw new Error('Unauthorized');
    const name = document.querySelector('[data-user-name]');
    if (name) name.textContent = data.user.full_name;
    return data.user;
  } catch {
    clearToken();
    location.href = role === 'admin' ? '/login.html?admin=1' : '/login.html';
  }
}
async function logout() {
  try { await api('/auth/logout.php', {method:'POST'}); } catch {}
  clearToken();
  location.href='/';
}
window.Thebes = {api, escapeHtml, statusClass, showMessage, requireUser, logout, setToken, clearToken, isCompanyEmail};
