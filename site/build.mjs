import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { createPendulumRun } from '@sensor-atlas/core';
import { project } from './config.mjs';
import { home } from './home.mjs';
import { page } from './layout.mjs';
import { postDate, postList, posts } from './posts/index.mjs';

const site = dirname(fileURLToPath(import.meta.url));
const output = resolve(site, 'dist');

async function render(route, content) {
  const directory = resolve(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), page(content));
}

await rm(output, { recursive: true, force: true });
await cp(resolve(site, 'assets'), resolve(output, 'assets'), { recursive: true });
await render('.', { title: project.name, body: home(createPendulumRun()), scripts: ['cursors.js'] });

await render('journal', {
  title: 'Development journal', current: 'Journal', root: '../',
  body: `<section class="section"><header class="section-title"><p class="eyebrow">${project.author}</p>
<h1>Development journal</h1></header>${postList('./')}</section>`,
});

for (const post of posts) {
  const source = await readFile(resolve(site, 'posts', post.slug + '.md'), 'utf8');
  await render('journal/' + post.slug, {
    ...post, current: 'Journal', root: '../../',
    body: `<article class="section article"><header class="article-heading"><p class="eyebrow"><a href="../">Journal</a></p>
<h1>${post.title}</h1><p class="lead">${post.description}</p>
<p class="eyebrow">${project.author} · <time datetime="${post.date}">${postDate(post.date)}</time></p></header>
<div class="prose">${marked.parse(source)}</div><p class="article-tail"><a href="../">All journal entries</a></p></article>`,
  });
}
