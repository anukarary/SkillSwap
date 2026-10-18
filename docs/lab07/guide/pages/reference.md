---
title: Public API
section: reference
---

Энд method бүрийн гарын үсэг, параметр, буцах утга, алдаа байна. Алхам алхмаар хийх заавар энд байхгүй.

## Урьдчилсан нөхцөл

- Node.js 18 буюу түүнээс шинэ.
- `node server.js` ажиллаж, `baseUrl` тэр хаяг байна. Анхны утга нь `http://localhost:3000`.
- `register` болон `login`-оос бусад method `setToken`-оор тавьсан access token шаардана.
- Демо өгөгдөл санах ойд байгаа тул серверийг дахин асаахад өмнөх session арилна.
- Нууц үг, hash, JWT гарын үсэг нь public API биш. Тэд `server.js` дотор үлдэнэ.
