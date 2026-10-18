---
title: Check-in хийж credit шилжүүлэх
section: howto
---

Session `confirmed` болсон, хоёр тал ирсэн, credit-ийг нэг удаа шилжүүлэх хэрэгтэй үед энэ зааврыг ашиглана.

## Урьдчилсан нөхцөл

Сервер ажиллаж байна. Session `confirmed` байна. `ses_21708e` гэснийг өөрийн session id-гаар солино. `end_time`-оос хойш 24 цаг өнгөрөөгүй байна. Өнгөрсөн бол эхний check-in-ийн дараа төлөв `unconfirmed` болно.

## Хийх

Доорхыг `check-in.mjs` гэж хадгална.

```javascript
async function token(email) {
  const body = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'your_account_password' })
  }).then((response) => response.json());
  return body.access_token;
}

async function check(email, role) {
  const access = await token(email);
  return fetch('http://localhost:3000/sessions/ses_21708e/check-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + access
    },
    body: JSON.stringify({ role })
  }).then((response) => response.json());
}

await check('baterdene@num.edu.mn', 'teacher');
const done = await check('oyuntsetseg@num.edu.mn', 'learner');
console.log(done.status, done.credits);
```

Дараа нь:

```
node check-in.mjs
```

## Шалгах

Хэвлэл `completed 5` байна. Нэг тал дахин check-in хийхэд credit дахин шилжихгүй.
