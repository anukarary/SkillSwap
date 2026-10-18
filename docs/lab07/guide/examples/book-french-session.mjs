// Франц хэлний 1 цагийг 5 credit-ээр захиалж дуусгана.
// Урьдчилсан нөхцөл: node server.js аль хэдийн http://localhost:3000 дээр ажиллаж байна.

const base = process.env.SKILLSWAP_URL || 'http://localhost:3000';

async function login(email) {
  const response = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'your_account_password'
    })
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Нэвтрээгүй');
  }
  return body.access_token;
}

async function call(token, method, path, payload) {
  const response = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(method + ' ' + path + ' ' + response.status + ' ' + (body.message || ''));
  }
  return body;
}

const learner = await login('oyuntsetseg@num.edu.mn');
const learnerBefore = await call(learner, 'GET', '/credits/balance');

const found = await call(
  learner,
  'GET',
  '/skills/search?skill=' + encodeURIComponent('Франц хэл') + '&category=' + encodeURIComponent('Хэл')
);
const teacherHit = found.results.find((row) => row.user_id === 'usr_4f2a91');
if (!teacherHit) {
  throw new Error('Бат-Эрдэнэ олдсонгүй');
}

const profile = await call(learner, 'GET', '/users/usr_4f2a91/profile');

const start = new Date(Date.now() + 60 * 60 * 1000);
const end = new Date(start.getTime() + 60 * 60 * 1000);

const session = await call(learner, 'POST', '/sessions', {
  teacher_id: 'usr_4f2a91',
  skill: 'Франц хэл',
  start_time: start.toISOString(),
  end_time: end.toISOString(),
  credits: 5
});

const teacher = await login('baterdene@num.edu.mn');
const teacherBefore = await call(teacher, 'GET', '/credits/balance');

await call(teacher, 'POST', '/sessions/' + session.session_id + '/respond', {
  action: 'accept'
});
await call(teacher, 'POST', '/sessions/' + session.session_id + '/check-in', {
  role: 'teacher'
});
const done = await call(learner, 'POST', '/sessions/' + session.session_id + '/check-in', {
  role: 'learner'
});

const learnerAfter = await call(learner, 'GET', '/credits/balance');
const teacherAfter = await call(teacher, 'GET', '/credits/balance');

if (done.status !== 'completed') {
  throw new Error('status ' + done.status);
}
if (learnerAfter.balance !== learnerBefore.balance - 5) {
  throw new Error('Суралцагчийн credit 5-аар буураагүй');
}
if (teacherAfter.balance !== teacherBefore.balance + 5) {
  throw new Error('Заагчийн credit 5-аар нэмэгдээгүй');
}

console.log(JSON.stringify({
  session_id: done.session_id,
  status: done.status,
  skill: done.skill,
  credits: done.credits,
  teacher: profile.name,
  learner_balance: learnerAfter.balance,
  teacher_balance: teacherAfter.balance
}, null, 2));
