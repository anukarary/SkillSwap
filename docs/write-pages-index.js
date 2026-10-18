'use strict';

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public');
fs.mkdirSync(path.join(dir, 'lab06'), { recursive: true });

const page = (title, body) => `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body{margin:0;background:#f6f1e8;color:#1c1917;font:16px/1.5 Georgia,serif}
    main{max-width:720px;margin:0 auto;padding:48px 24px}
    a{color:#0f6e56}
    h1{font-size:40px;letter-spacing:-.03em;margin:0 0 8px}
    h2{margin:28px 0 8px;font-size:22px}
    ul{padding-left:18px}
    li{margin:6px 0}
  </style>
</head>
<body><main>${body}</main></body>
</html>`;

fs.writeFileSync(path.join(dir, 'index.html'), page(
  'SkillSwap баримт',
  `<p><a href="https://github.com/anukarary/SkillSwap">SkillSwap</a></p>
  <h1>Баримт</h1>
  <p>Лаборатори бүр өөрийн хавтстай.</p>
  <h2>Lab 05 · OpenAPI</h2>
  <ul>
    <li><a href="redoc/">Redoc</a></li>
    <li><a href="swagger/">Swagger UI</a></li>
  </ul>
  <h2>Lab 06 · Public API</h2>
  <ul>
    <li><a href="lab06/">Lab 06-ийн тайлбар</a></li>
    <li><a href="api/">TypeDoc</a></li>
  </ul>
  <h2>Lab 07 · User documentation</h2>
  <ul>
    <li><a href="guide/">Tutorial, How-to, Reference</a></li>
  </ul>`
));

fs.writeFileSync(path.join(dir, 'lab06/index.html'), page(
  'Lab 06',
  `<p><a href="../">Буцах</a></p>
  <h1>Lab 06</h1>
  <p>Public API-ийн JSDoc, TypeDoc сайт, гар болон AI тайлбарын зөрүү, TODO.</p>
  <ul>
    <li><a href="../api/">TypeDoc: SkillSwapClient</a></li>
    <li>Эх файл: <code>lib/skillswap-client.js</code></li>
    <li>Аудит: <code>docs/lab06/</code></li>
  </ul>`
));

console.log('public/index.html, public/lab06/index.html');
