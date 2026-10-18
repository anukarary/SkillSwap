'use strict';

const fs = require('fs');
const path = require('path');

const root = __dirname;
const outDir = path.join(root, '../../../public/guide');

const pages = [
  { src: 'pages/index.md', out: 'index.html', index: false },
  { src: 'pages/tutorial.md', out: 'tutorial/index.html', index: true },
  { src: 'pages/howto-index.md', out: 'howto/index.html', index: true },
  { src: 'pages/howto-accept.md', out: 'howto/accept.html', index: true },
  { src: 'pages/howto-checkin.md', out: 'howto/check-in.html', index: true },
  { src: 'pages/howto-noshow.md', out: 'howto/no-show.html', index: true },
  { src: 'pages/howto-corgly-slack.md', out: 'howto/corgly-slack.html', index: true },
  { src: 'pages/reference.md', out: 'reference/index.html', index: true, symbols: true }
];

const symbols = [
  ['constructor', 'new SkillSwapClient(baseUrl?)', [['baseUrl', 'Серверийн үндэс. Анхны утга http://localhost:3000']], 'SkillSwapClient', [], ''],
  ['setToken', 'setToken(accessToken)', [['accessToken', 'login-оос авсан access_token']], 'void', [], ''],
  ['register', 'register(input)', [['input.name', 'Нэр'], ['input.phone', 'Утас'], ['input.email', 'Имэйл'], ['input.password', '8-аас дээш тэмдэгт'], ['input.skills', 'Заавал биш']], 'RegisterResult, 201', [['400 VALIDATION_ERROR', 'Талбар дутуу, нууц үг богино, имэйл давхардсан']], ''],
  ['login', 'login(email, password)', [['email', 'Жишээ: oyuntsetseg@num.edu.mn'], ['password', 'your_account_password']], 'LoginResult, 200', [['400 VALIDATION_ERROR', 'Талбар дутуу'], ['401 UNAUTHORIZED', 'Имэйл эсвэл нууц үг буруу']], '../tutorial/', 'Tutorial: Франц хэлний цаг захиалах'],
  ['me', 'me()', [], 'MeResult, 200', [['401 UNAUTHORIZED', 'Token байхгүй']], ''],
  ['getProfile', 'getProfile(userId)', [['userId', 'Жишээ: usr_4f2a91']], 'ProfileResult, 200', [['401 UNAUTHORIZED', 'Token байхгүй'], ['404 NOT_FOUND', 'Хэрэглэгч байхгүй']], '../tutorial/', 'Tutorial: Франц хэлний цаг захиалах'],
  ['searchSkills', 'searchSkills(query)', [['query.skill', 'Нэрийн дэд мөр'], ['query.category', 'Яг таарах ангилал'], ['query.minRating', '0–5'], ['query.availableFrom', 'ISO-8601']], 'SearchResult, 200', [['400 VALIDATION_ERROR', 'skill болон category хоёул хоосон'], ['401 UNAUTHORIZED', 'Token байхгүй']], '../tutorial/', 'Tutorial: Франц хэлний цаг захиалах'],
  ['listSessions', 'listSessions()', [], 'SessionList, 200', [['401 UNAUTHORIZED', 'Token байхгүй']], ''],
  ['proposeSession', 'proposeSession(input)', [['input.teacherId', 'Заагчийн id'], ['input.skill', 'Ур чадвар'], ['input.startTime', 'ISO-8601'], ['input.endTime', 'startTime-аас хойш'], ['input.credits', 'Эерэг бүхэл тоо']], 'Session, 201, status proposed', [['400 VALIDATION_ERROR', 'Талбар, цаг, teacher_id буруу'], ['401 UNAUTHORIZED', 'Token байхгүй'], ['403 RESTRICTED', 'No-show хязгаарлалт'], ['403 INSUFFICIENT_CREDITS', 'Үлдэгдэл хүрэхгүй']], '../tutorial/', 'Tutorial: Франц хэлний цаг захиалах'],
  ['respond', 'respond(sessionId, input)', [['sessionId', 'Session id'], ['input.action', 'accept, decline, counter']], 'Session, 200', [['400 INVALID_STATE', 'proposed биш'], ['400 VALIDATION_ERROR', 'action буруу'], ['401 UNAUTHORIZED', 'Token байхгүй'], ['403 INSUFFICIENT_CREDITS', 'accept үед үлдэгдэл хүрэхгүй'], ['404 NOT_FOUND', 'Session олдсонгүй']], '../howto/accept.html', 'How-to: санал ирэхэд зөвшөөрөх'],
  ['cancel', 'cancel(sessionId)', [['sessionId', 'Session id']], 'Session, 200, status cancelled', [['400 INVALID_STATE', 'Цуцлах төлөвт биш'], ['401 UNAUTHORIZED', 'Token байхгүй'], ['404 NOT_FOUND', 'Session олдсонгүй']], ''],
  ['checkIn', 'checkIn(sessionId, role)', [['sessionId', 'Session id'], ['role', 'teacher эсвэл learner']], 'Session, 200', [['400 VALIDATION_ERROR', 'role буруу'], ['400 INVALID_STATE', 'confirmed биш'], ['401 UNAUTHORIZED', 'Token байхгүй'], ['404 NOT_FOUND', 'Session олдсонгүй'], ['409 INSUFFICIENT_CREDITS', 'Шилжүүлэх үед үлдэгдэл хүрэхгүй']], '../howto/check-in.html', 'How-to: check-in хийж credit шилжүүлэх'],
  ['reportNoShow', 'reportNoShow(sessionId, input)', [['sessionId', 'Session id'], ['input.absentUserId', 'Ирээгүй оролцогч'], ['input.comment', 'Заавал биш']], 'NoShowResult, 200', [['400 VALIDATION_ERROR', 'absent_user_id буруу'], ['400 INVALID_STATE', 'confirmed биш'], ['400 NO_SHOW_TOO_EARLY', 'Session эхлээгүй'], ['400 NO_SHOW_WINDOW_CLOSED', 'Дууссанаас хойш 1 цаг өнгөрсөн'], ['401 UNAUTHORIZED', 'Token байхгүй'], ['404 NOT_FOUND', 'Session олдсонгүй']], '../howto/no-show.html', 'How-to: ирээгүй хүнийг мэдээлэх'],
  ['rate', 'rate(sessionId, input)', [['sessionId', 'Session id'], ['input.stars', '1–5'], ['input.comment', 'Заавал биш']], 'RateResult, 200', [['400 VALIDATION_ERROR', 'stars буруу'], ['400 INVALID_STATE', 'completed биш'], ['400 ALREADY_RATED', 'Дахин үнэлгээ'], ['401 UNAUTHORIZED', 'Token байхгүй'], ['404 NOT_FOUND', 'Session олдсонгүй']], ''],
  ['listMessages', 'listMessages(sessionId)', [['sessionId', 'Session id']], 'MessageList, 200', [['401 UNAUTHORIZED', 'Token байхгүй'], ['404 NOT_FOUND', 'Session олдсонгүй']], ''],
  ['postMessage', 'postMessage(sessionId, text)', [['sessionId', 'Session id'], ['text', 'Хамгийн ихдээ 500 тэмдэгт']], 'ChatMessage, 201', [['400 VALIDATION_ERROR', 'text дутуу'], ['401 UNAUTHORIZED', 'Token байхгүй'], ['404 NOT_FOUND', 'Session олдсонгүй']], ''],
  ['flagSession', 'flagSession(sessionId, reason)', [['sessionId', 'Session id'], ['reason', 'Маргааны шалтгаан']], 'FlagResult, 201', [['400 VALIDATION_ERROR', 'reason дутуу'], ['400 INVALID_STATE', 'completed биш'], ['400 FLAG_WINDOW_CLOSED', '72 цаг өнгөрсөн'], ['400 ALREADY_FLAGGED', 'Давхар flag'], ['401 UNAUTHORIZED', 'Token байхгүй'], ['404 NOT_FOUND', 'Session олдсонгүй']], ''],
  ['getBalance', 'getBalance()', [], 'CreditBalance, 200', [['401 UNAUTHORIZED', 'Token байхгүй']], '../tutorial/', 'Tutorial: Франц хэлний цаг захиалах'],
  ['getLedger', 'getLedger()', [], 'LedgerResult, 200', [['401 UNAUTHORIZED', 'Token байхгүй']], ''],
  ['listNotifications', 'listNotifications()', [], 'NotificationResult, 200', [['401 UNAUTHORIZED', 'Token байхгүй']], ''],
  ['subscribeWebhook', 'subscribeWebhook(input)', [['input.callbackUrl', 'https URL'], ['input.events', 'WEBHOOK_EVENTS-ийн дэд олонлог']], 'WebhookResult, 201', [['400 VALIDATION_ERROR', 'URL эсвэл event буруу'], ['401 UNAUTHORIZED', 'Token байхгүй']], ''],
  ['adminDashboard', 'adminDashboard()', [], 'AdminDashboard, 200', [['401 UNAUTHORIZED', 'Token байхгүй'], ['403 FORBIDDEN', 'Admin биш']], ''],
  ['resolveFlag', 'resolveFlag(flagId, input)', [['flagId', 'Flag id'], ['input.decision', 'approve эсвэл reject']], 'FlagResult, 200', [['400 VALIDATION_ERROR', 'decision буруу'], ['401 UNAUTHORIZED', 'Token байхгүй'], ['403 FORBIDDEN', 'Admin биш'], ['404 NOT_FOUND', 'Нээлттэй flag байхгүй']], ''],
  ['auditLog', 'auditLog()', [], 'AuditLogResult, 200', [['401 UNAUTHORIZED', 'Token байхгүй'], ['403 FORBIDDEN', 'Admin биш']], ''],
  ['SkillSwapError', 'new SkillSwapError(status, code, message, body?)', [['status', 'HTTP төлөв'], ['code', 'Жишээ: VALIDATION_ERROR'], ['message', 'Серверийн мессеж'], ['body', 'Заавал биш, бүтэн JSON']], 'SkillSwapError', [], ''],
  ['WEBHOOK_EVENTS', 'WEBHOOK_EVENTS', [], "readonly string[]: session.confirmed, session.completed, session.cancelled, credit.transferred", [], '']
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(value) {
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`/g;
  let last = 0;
  let match = re.exec(value);
  const parts = [];
  while (match) {
    parts.push(escapeHtml(value.slice(last, match.index)));
    if (match[1]) {
      parts.push('<strong>' + escapeHtml(match[1]) + '</strong>');
    } else if (match[2]) {
      parts.push('<a href="' + escapeHtml(match[3]) + '">' + escapeHtml(match[2]) + '</a>');
    } else {
      parts.push('<code>' + escapeHtml(match[4]) + '</code>');
    }
    last = match.index + match[0].length;
    match = re.exec(value);
  }
  parts.push(escapeHtml(value.slice(last)));
  return parts.join('');
}

function markdown(source) {
  const lines = source.split(/\r?\n/);
  let index = 0;
  const meta = {};
  if (lines[0] === '---') {
    index = 1;
    while (index < lines.length && lines[index] !== '---') {
      const cut = lines[index].indexOf(':');
      if (cut > 0) meta[lines[index].slice(0, cut).trim()] = lines[index].slice(cut + 1).trim();
      index += 1;
    }
    index += 1;
  }
  let html = '';
  let paragraph = [];
  let list = null;
  let code = null;
  const flushParagraph = () => {
    if (!paragraph.length) return;
    html += '<p>' + inline(paragraph.join(' ')) + '</p>\n';
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    const tag = list.type === 'ol' ? 'ol' : 'ul';
    html += '<' + tag + '>' + list.items.map((item) => '<li>' + inline(item) + '</li>').join('') + '</' + tag + '>\n';
    list = null;
  };
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    if (code !== null) {
      if (line.startsWith('```')) {
        html += '<pre><code>' + escapeHtml(code.replace(/\n$/, '')) + '</code></pre>\n';
        code = null;
      } else {
        code += line + '\n';
      }
      continue;
    }
    if (line.startsWith('```')) {
      flushParagraph();
      flushList();
      code = '';
      continue;
    }
    const heading = /^(#{1,3}) /.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html += '<h' + level + '>' + inline(line.slice(level + 1)) + '</h' + level + '>\n';
      continue;
    }
    if (line.startsWith('- ')) {
      flushParagraph();
      if (!list || list.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(line.slice(2));
      continue;
    }
    if (/^\d+\. /.test(line)) {
      flushParagraph();
      if (!list || list.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(line.replace(/^\d+\. /, ''));
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  return { meta, html };
}

function symbolHtml(row) {
  const [name, signature, params, returns, errors, howto] = row;
  const paramRows = params.length
    ? params.map(([key, detail]) => '<tr><td><code>' + escapeHtml(key) + '</code></td><td>' + escapeHtml(detail) + '</td></tr>').join('')
    : '<tr><td colspan="2">Параметр байхгүй</td></tr>';
  const errorRows = errors.length
    ? errors.map(([code, when]) => '<tr><td><code>' + escapeHtml(code) + '</code></td><td>' + escapeHtml(when) + '</td></tr>').join('')
    : '<tr><td colspan="2">Алдаа буцаахгүй</td></tr>';
  const link = howto
    ? '<p><a href="' + escapeHtml(howto) + '">' + escapeHtml(row[6]) + '</a></p>'
    : '';
  return '<section id="' + escapeHtml(name) + '"><h2><code>' + escapeHtml(name) + '</code></h2><pre><code>' +
    escapeHtml(signature) + '</code></pre><h3>Параметр</h3><table><tr><th>Нэр</th><th>Тайлбар</th></tr>' +
    paramRows + '</table><h3>Буцах утга</h3><p>' + escapeHtml(returns) + '</p><h3>Алдаа</h3><table><tr><th>Код</th><th>Хэзээ</th></tr>' +
    errorRows + '</table>' + link + '</section>\n';
}

function layout(page, body, base) {
  const home = base + 'index.html';
  return '<!DOCTYPE html><html lang="mn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' +
    escapeHtml(page.title) + '</title><link rel="stylesheet" href="' + base + 'guide.css"></head><body data-base="' + base + '"><header><a href="' +
    home + '">SkillSwap баримт</a><nav><a href="' + base + 'tutorial/">Tutorial</a><a href="' + base + 'howto/">How-to</a><a href="' +
    base + 'reference/">Reference</a></nav><form role="search"><input id="q" type="search" placeholder="Tutorial, How-to, Reference" aria-label="Баримт дотор хайх"></form><div id="hits"></div></header><main>' +
    body + '</main><script src="' + base + 'search.js"></script></body></html>';
}

const search = [];
fs.rmSync(outDir, { recursive: true, force: true });

for (const page of pages) {
  const parsed = markdown(fs.readFileSync(path.join(root, page.src), 'utf8'));
  let body = parsed.html;
  if (page.symbols) body += symbols.map(symbolHtml).join('');
  const depth = page.out.split('/').length - 1;
  const base = depth === 0 ? '' : '../'.repeat(depth);
  const title = parsed.meta.title || 'SkillSwap';
  const html = layout({ title }, body, base);
  const dest = path.join(outDir, page.out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
  if (page.index) {
    const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    search.push({
      title,
      path: page.out.replace(/index\.html$/, ''),
      text
    });
  }
}

fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify(search));
fs.writeFileSync(path.join(outDir, 'search.js'), `'use strict';
const input = document.querySelector('#q');
const hits = document.querySelector('#hits');
const base = document.body.dataset.base || '';
let pages = [];
fetch(base + 'search-index.json').then((response) => response.json()).then((data) => { pages = data; });
input.addEventListener('input', () => {
  const query = input.value.trim().toLowerCase();
  if (query.length < 2) { hits.innerHTML = ''; return; }
  const found = pages.filter((page) => (page.title + ' ' + page.text).toLowerCase().includes(query)).slice(0, 8);
  hits.innerHTML = found.map((page) => '<a href="' + base + page.path + '">' + page.title + '</a>').join('');
});
`);
fs.writeFileSync(path.join(outDir, 'guide.css'), `body{margin:0;font:16px/1.5 Georgia,serif;color:#1c1915;background:#f7f4ee}header,main{max-width:760px;margin:0 auto;padding:16px 20px}header{border-bottom:1px solid #ddd}nav a{margin-right:14px}a{color:#6b3a1f}input{width:100%;box-sizing:border-box;margin-top:8px;padding:8px}#hits a{display:block;padding:4px 0}pre{background:#fff;border:1px solid #ddd;padding:12px;overflow:auto}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}code{font-family:Consolas,monospace}`);
fs.cpSync(path.join(root, 'examples'), path.join(outDir, 'examples'), { recursive: true });
console.log('guide:', pages.length, 'pages,', search.length, 'indexed');
