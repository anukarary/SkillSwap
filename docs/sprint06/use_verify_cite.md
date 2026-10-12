# Use–Verify–Cite: зохиосон API

Sprint 06, SkillSwap. AI ноорог: `docs/sprint06/ai_docstring.js`.
Баримт: `server.js` (ажиллаж буй route), `lib/skillswap-client.js` (нийтийн JSDoc).

| # | Use (AI юу гэсэн) | Verify (кодоос юу гарсан) | Cite | Шийдвэр |
| --- | --- | --- | --- | --- |
| 1 | `instantSettle(sessionId)` нь `POST /sessions/{id}/instant-settle` дуудаж, check-in-гүй credit шилжүүлнэ. Буцах type: `InstantPayout`. | `server.js` дотор `instant-settle`, `instantSettle`, `payout_id` байхгүй. Credit зөвхөн `POST /sessions/:id/check-in` дээр хоёр `checkins` true, `transferred === false` үед шилжинэ. | `server.js` check-in handler, `led('transfer', ...)` | Зохиосон API. Клиентэд оруулаагүй. |
| 2 | `matchByLocation(latitude, longitude)` нь `GET /skills/nearby` дуудна. Буцах type: `GeoMatch`. | Хайлтын цорын ганц route нь `GET /skills/search`. Параметр: `skill`, `category`, `min_rating`, `available_from`. Өргөрөг, уртраг байхгүй. | `server.js` `/skills/search` | Зохиосон API. Клиентэд оруулаагүй. |
| 3 | `getReceipt(sessionId)` нь `GET /sessions/{id}/receipt` дуудаж `InstantPayout` буцаана. | Ийм route байхгүй. Session хариу нь `pub(session)`: id, талууд, skill, цаг, credits, status, checkins, ratings, flag_id. | `server.js` `pub`, route хүснэгт | Зохиосон API. Клиентэд оруулаагүй. |
| 4 | `proposeSession` нь `POST /sessions/propose` руу явж, хариунд `calendar_event_id`, `skill_id` байна. Credit даруй заагчид шилжинэ. | Бодит зам нь `POST /sessions`. Body талбар: `teacher_id`, `skill`, `start_time`, `end_time`, `credits`. Хариуны status `proposed`. `transferred` хариунд гарахгүй. Calendar event зөвхөн `accept` (`onConfirmed`) үед үүснэ, session JSON-д орохгүй. | `server.js` `POST /sessions`, `onConfirmed` | Замыг, талбарыг, «credit даруй шилжинэ» гэснийг устгасан. |
| 5 | Эхний `checkIn` HTTP 204 буцааж credit-ийг хаана. `observer` role байна. | `checkIn` үргэлж `send(res, 200, pub(session))`. Role зөвхөн `teacher` эсвэл `learner`, мөн тухайн id нь дуудагчийнх байх ёстой. | `server.js` check-in handler | 200 болон хоёр талын дүрмийг бичсэн. |
| 6 | No-show-ыг 24 цагийн дотор, session эхлэхээс өмнө ч мэдээлнэ. | Эхлэхээс өмнө `NO_SHOW_TOO_EARLY`. `end_time`-оос хойш 1 цагаас хэтэрвэл `NO_SHOW_WINDOW_CLOSED`. 24 цаг нь no-show биш, ганц талын check-in `unconfirmed` болох хугацаа. | `server.js` no-show handler, `refresh` | 1 цагийн цонхыг бичсэн. 24 цагийг check-in-ий `unconfirmed` дүрэмд үлдээсэн. |

Шалгалт: `node docs/sprint06/test_ai_hallucinations.js`

Энэ скрипт AI файлын `async` method-уудыг `SkillSwapClient.prototype` дээр, `@typedef` нэрсийг клиентийн typedef-үүдтэй тусгана. 1–3-р мөрний method болон type prototype дээр байхгүй, клиент эх код тэдгээрийг агуулаагүй үед тест ногоон болно.
