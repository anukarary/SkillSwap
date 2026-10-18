'use strict';

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../../public');
fs.mkdirSync(dir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <title>SkillSwap баримт</title>
</head>
<body>
  <h1>SkillSwap баримт</h1>
  <ul>
    <li><a href="guide/">Tutorial, How-to, Reference</a></li>
    <li><a href="api/">JSDoc / TypeDoc API лавлагаа</a></li>
    <li><a href="redoc/">Redoc</a></li>
    <li><a href="swagger/">Swagger UI</a></li>
  </ul>
</body>
</html>
`;

fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('public/index.html');
