---
title: Ирээгүй хүнийг no-show гэж мэдээлэх
section: howto
---

Нөгөө хүн ирээгүй, session эхэлсэн, дууссанаас хойш 1 цаг өнгөрөөгүй үед энэ зааврыг ашиглана.

## Урьдчилсан нөхцөл

Доорх код confirmed session-ыг өөрөө үүсгэнэ. Эхлэх цаг 30 минутын өмнө, дуусах цаг 10 минутын өмнө байгаа тул мэдээлэх цонх нээлттэй.

## Хийх

Доорхыг `report-no-show.mjs` гэж хадгална.

```javascript
const start = new Date(Date.now() - 30 * 60 * 1000).toISOString();
const end = new Date(Date.now() - 10 * 60 * 1000).toISOString();

async function token(email) {
  const body = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'your_account_password' })
  }).then((response) => response.json());
  return body.access_token;
}

const learner = await token('oyuntsetseg@num.edu.mn');
const session = await fetch('http://localhost:3000/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + learner
  },
  body: JSON.stringify({
    teacher_id: 'usr_4f2a91',
    skill: 'Франц хэл',
    start_time: start,
    end_time: end,
    credits: 5
  })
}).then((response) => response.json());

const teacher = await token('baterdene@num.edu.mn');
await fetch('http://localhost:3000/sessions/' + session.session_id + '/respond', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + teacher
  },
  body: JSON.stringify({ action: 'accept' })
});

const report = await fetch('http://localhost:3000/sessions/' + session.session_id + '/no-show', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + learner
  },
  body: JSON.stringify({
    absent_user_id: 'usr_4f2a91',
    comment: 'Бат-Эрдэнэ Франц хэлний цагт ирээгүй.'
  })
}).then((response) => response.json());

console.log(report.status, report.absent_user_restricted);
```

Дараа нь:

```
node report-no-show.mjs
```

## Шалгах

Эхний үг `no_show_reported` байна. Хоёр дахь утга `true` бол 30 хоногийн 3 дахь бүртгэл тул 7 хоногийн хязгаарлалт тавигдсан.
