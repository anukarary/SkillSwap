'use strict';

/**
 * AI docstring доторх method, typedef сервер болон нийтийн клиентэд
 * байгаа эсэхийг шалгана.
 *
 * Гараар зассан клиент (lib/skillswap-client.js) дээр зохиосон нэр
 * байх ёсгүй. AI ноорог (ai_docstring.js) дор хаяж нэг зохиосон
 * method болон нэг зохиосон type агуулна. Тэдгээрийг энд барина.
 */

const fs = require('fs');
const path = require('path');
const { SkillSwapClient } = require('../../lib/skillswap-client');

const root = path.join(__dirname);
const aiSource = fs.readFileSync(path.join(root, 'ai_docstring.js'), 'utf8');
const clientSource = fs.readFileSync(
  path.join(__dirname, '../../lib/skillswap-client.js'),
  'utf8'
);

/**
 * @param {string} source
 * @returns {string[]}
 */
function methodNames(source) {
  const names = [];
  const re = /^\s+async\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm;
  let match = re.exec(source);
  while (match) {
    names.push(match[1]);
    match = re.exec(source);
  }
  return names;
}

/**
 * @param {string} source
 * @returns {string[]}
 */
function typedefNames(source) {
  const names = [];
  const re = /@typedef\s+\{[^}]+\}\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  let match = re.exec(source);
  while (match) {
    names.push(match[1]);
    match = re.exec(source);
  }
  return names;
}

const prototypeNames = new Set(
  Object.getOwnPropertyNames(SkillSwapClient.prototype)
);

const clientMethods = new Set(methodNames(clientSource));
const clientTypes = new Set(typedefNames(clientSource));

const aiMethods = methodNames(aiSource).filter((name) => name !== '_request');
const aiTypes = typedefNames(aiSource);

const inventedMethods = aiMethods.filter((name) => !prototypeNames.has(name));
const inventedTypes = aiTypes.filter((name) => !clientTypes.has(name));

const leaked = inventedMethods
  .concat(inventedTypes)
  .filter((name) => clientSource.includes(name));

const missingOnPrototype = [...clientMethods].filter(
  (name) => name !== '_request' && !prototypeNames.has(name)
);

const failures = [];

if (inventedMethods.length < 1) {
  failures.push('AI ноорогт зохиосон method олдсонгүй.');
}

if (inventedTypes.length < 1) {
  failures.push('AI ноорогт зохиосон typedef олдсонгүй.');
}

if (leaked.length) {
  failures.push(
    `Зохиосон нэр нийтийн клиентэд үлдсэн: ${leaked.join(', ')}`
  );
}

if (missingOnPrototype.length) {
  failures.push(
    `Клиентийн method prototype дээр байхгүй: ${missingOnPrototype.join(', ')}`
  );
}

console.log('AI-ийн зохиосон method:', inventedMethods.join(', ') || '(байхгүй)');
console.log('AI-ийн зохиосон type:', inventedTypes.join(', ') || '(байхгүй)');
console.log('Нийтийн клиентээс хассан:', leaked.length === 0 ? 'тийм' : 'үгүй');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Hallucination test амжилттай.');
