# Bhatti 5 зарчмын аудит — Sprint 06

Модуль: `SkillSwapSessionApi` (`docs/sprint06/manual_docstring.js` болон `ai_docstring.js`).

Ноорог: AI. Зассан хувилбар: гараар бичсэн docstring, `lib/skillswap-client.js` дотор нэгтгэсэн.

Оноо 1–5. Нийт 25.

| Зарчим | AI ноорог | Юу буруу байсан | Гараар зассан | Засварын дараа |
| --- | --- | --- | --- | --- |
| Explained | 2 | `proposeSession` юу буцаах, credit хэзээ шилжихийг буруу хэлсэн. Алдааг `something went wrong` гэж үлдээсэн. | Юу болохыг эхний өгүүлбэрт бичсэн. 400, 401, 403, 404, 409 кодыг тус бүрд нь бичсэн. | 5 |
| Concise | 2 | «including but not limited to», «assuming all of the aforementioned conditions are met», «бүх эцсийн хэрэглэгчдэд зөв, найдвартай ажиллахыг баталгаажуулах үүднээс» гэсэн чихмэл хэллэг. Lab 3 дээрх Bhatti Concise зөрчилтэй ижил. | Чихмэл өгүүлбэрийг устгасан. Үлдсэн өгүүлбэр бүр дүрэм эсвэл алдааны код хэлнэ. | 5 |
| Clear | 2 | `observer` role, `skill_id`, `calendar_event_id`, `/sessions/propose` гэсэн серверт байхгүй нэр. `test`, `foo`, `user123`. | Нэр нь server.js-тэй ижил: `teacher`/`learner`, `POST /sessions`, `absent_user_id`. | 5 |
| Usable | 2 | Жишээ нь `ses_test` дээр зогсоно. Эхний check-in дээр 204 буцаана гэсэн тул хуулж ажиллуулбал хүлээлт зөрнө. | Оюунцэцэг, Бат-Эрдэнэ, Франц хэл, 5 credit, 2026-10-12 14:00 гэсэн Lab 2–5-ын домэйноор нэг жишээ. 201/200 status тодорхой. | 5 |
| Trustworthy | 1 | Гурван зохиосон API (`instantSettle`, `matchByLocation`, `getReceipt`), хоёр зохиосон type (`InstantPayout`, `GeoMatch`). No-show цонхыг 24 цаг гэж, credit-ийг эхний check-in дээр шилжинэ гэж бичсэн. | server.js-тэй тулгасан. No-show нь дууссанаас хойш 1 цаг. Credit хоёр тал check-in хийсний дараа нэг удаа шилжинэ. Зохиосон нэрийг клиентээс хассан. | 5 |

## Засвар (хамгийн багадаа 2)

1. **Trustworthy.** `instantSettle`, `matchByLocation`, `getReceipt`, `InstantPayout`, `GeoMatch`-ийг нийтийн API-д оруулаагүй. `test_ai_hallucinations.js` эдгээрийг prototype болон typedef-ээс олдохгүй гэж барина.
2. **Explained + Trustworthy.** Check-in 204 биш, 200 болон `Session` буцаана. Credit эхний check-in дээр биш, teacher болон learner хоёул check-in хийсний дараа нэг удаа шилжинэ (`server.js`, `transferred` туг).
3. **Concise.** «including but not limited to» болон «бүх эцсийн хэрэглэгчдэд…» өгүүлбэрийг устгасан.
4. **Clear + Usable.** `foo` / `test` жишээг Оюунцэцэг (`usr_b82e17`) болон Бат-Эрдэнэ (`usr_4f2a91`), ур чадвар «Франц хэл», 5 credit-ээр сольсон. Энэ нь Lab 5-ын `sample_1_propose_session.py`-тэй ижил домэйн.

## Дүгнэлт

AI ноорог 9/25. Зассан docstring 25/25. Үлдээсэн зөрчилгүй. AI хувилбар репозиторт нотлох баримт болж үлдэнэ, ажиллаж буй клиент биш.
