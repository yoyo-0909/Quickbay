#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const scriptsDir = path.join(root, 'scripts');
const jsFiles = [
  ...fs.readdirSync(root).filter(name => name.endsWith('.js')).map(name => path.join(root, name)),
  ...(fs.existsSync(scriptsDir)
    ? fs.readdirSync(scriptsDir).filter(name => name.endsWith('.mjs')).map(name => path.join(scriptsDir, name))
    : [])
];

let failures = 0;
const fail = message => { failures++; console.error('FAIL:', message); };
const pass = message => console.log('PASS:', message);

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) fail(`JavaScript syntax: ${path.relative(root, file)}\n${result.stderr || result.stdout}`);
  else pass(`JavaScript syntax: ${path.relative(root, file)}`);
}

const htmlPath = path.join(root, 'index.html');
if (!fs.existsSync(htmlPath)) {
  fail('index.html exists');
} else {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const tags = [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)];
  let inlineCount = 0;
  for (const [index, match] of tags.entries()) {
    const attrs = match[1] || '';
    const code = match[2] || '';
    const src = attrs.match(/\\bsrc\\s*=\\s*["']([^"']+)["']/i)?.[1];
    if (src) {
      if (src.startsWith('/') && !fs.existsSync(path.join(root, src.slice(1)))) fail(`Local script asset exists: ${src}`);
      continue;
    }
    if (!code.trim()) continue;
    inlineCount++;
    try { new vm.Script(code, { filename: `index.html:inline-${index + 1}.js` }); }
    catch (error) { fail(`Inline script ${index + 1} parses: ${error.message}`); }
  }
  pass(`Parsed ${inlineCount} inline script block(s) and checked local script assets`);

  const workflowPath = path.join(root, 'workflows.js');
  if (fs.existsSync(workflowPath)) {
    const workflow = fs.readFileSync(workflowPath, 'utf8');
    const loadJobs = workflow.indexOf('async function qbLoadCustomerJobs()');
    const loadEstimates = workflow.indexOf('async function qbLoadCustomerEstimates()');
    const authCall = workflow.indexOf('await qbLoadCustomerJobs()');
    if (loadJobs < 0 || loadEstimates < 0 || authCall < 0 || authCall > workflow.indexOf('await qbLoadCustomerEstimates()')) {
      fail('Customer job history is loaded before customer estimates');
    } else pass('Customer job history loader is wired before estimate loading');
  }
}

if (failures) {
  console.error(`\\nValidation failed with ${failures} issue(s).`);
  process.exitCode = 1;
} else {
  console.log('\\nQuickBay static validation completed successfully.');
}
