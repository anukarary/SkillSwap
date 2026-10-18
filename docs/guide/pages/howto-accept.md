---
title: Санал ирэхэд зөвшөөрөх
section: howto
---

Заагч талд `proposed` session ирээд, түүнийг баталгаажуулах хэрэгтэй үед энэ зааврыг ашиглана.

## Урьдчилсан нөхцөл

Сервер http://localhost:3000 дээр ажиллаж байна. Санал аль хэдийн үүссэн. `ses_21708e` гэснийг өөрийн session id-гаар солино.

## Хийх

Доорхыг `accept-session.mjs` гэж хадгална.

```javascript
const login = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'baterdene@num.edu.mn',
    password: 'your_account_password'
  })
}).then((response) => response.json());

const done = await fetch('http://localhost:3000/sessions/ses_21708e/respond', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + login.access_token
  },
  body: JSON.stringify({ action: 'accept' })
}).then((response) => response.json());

console.log(done.status);
```

Дараа нь:

```
node accept-session.mjs
```

## Шалгах

Хэвлэгдсэн утга `confirmed` байна. `proposed` хэвээр байвал та санал тавьсан тал нь биш, эсвэл session id буруу.
