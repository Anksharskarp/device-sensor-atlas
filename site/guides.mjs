import { readdir, readFile } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { Marked } from 'marked';
import { project } from './config.mjs';

function guideLink(from, to) {
  const path = relative(from, to);
  return path ? path + '/' : './';
}

export async function buildGuides(repo, render) {
  const files = await readdir(resolve(repo, 'docs'), { recursive: true });
  const sources = ['README.md', ...files.filter(file => file.endsWith('.md')).sort().map(file => join('docs', file))];
  const guides = await Promise.all(sources.map(async file => {
    const markdown = await readFile(join(repo, file), 'utf8');
    const heading = markdown.match(/^# (.+)$/m)?.[1];
    if (!heading) throw new Error(`Missing page title in ${file}`);
    const overview = file === 'README.md';
    return { file, markdown, title: overview ? 'Overview' : heading, route: overview ? 'docs' : file.slice(0, -3) };
  }));
  const byFile = new Map(guides.map(guide => [guide.file, guide]));

  for (const guide of guides) {
    const root = '../'.repeat(guide.route.split('/').length);
    const navigation = guides.map(entry => {
      const active = entry === guide ? ' aria-current="page"' : '';
      return `<a href="${guideLink(guide.route, entry.route)}"${active}>${entry.title}</a>`;
    }).join('');
    const counts = new Map();
    const parser = new Marked({
      walkTokens(token) {
        if (token.type !== 'link' && token.type !== 'image') return;
        if (/^(?:[a-z][\w+.-]*:|#|\/\/)/i.test(token.href)) return;
        const [, path, suffix] = /^([^?#]*)(.*)$/.exec(token.href);
        const file = relative(repo, resolve(repo, dirname(guide.file), path));
        const target = byFile.get(file);
        if (target) {
          token.href = guideLink(guide.route, target.route) + suffix;
          return;
        }
        if (token.type === 'image') {
          token.href = `${project.repository}/raw/refs/heads/main/${file}${suffix}`;
          return;
        }
        const directory = statSync(join(repo, file), { throwIfNoEntry: false })?.isDirectory();
        token.href = `${project.repository}/${directory ? 'tree' : 'blob'}/main/${file}${suffix}`;
      },
      renderer: {
        heading({ tokens, depth, text }) {
          const base = text.toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu, '').trim().replace(/\s+/g, '-');
          const count = counts.get(base) ?? 0;
          counts.set(base, count + 1);
          const id = count ? base + '-' + count : base;
          return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
        },
      },
    });
    await render(guide.route, {
      title: guide.title, current: 'Documentation', root,
      body: `<div class="guide-layout"><aside><h2>Documentation</h2><nav aria-label="Guides">${navigation}</nav></aside>
<article class="guide prose">${parser.parse(guide.markdown)}</article></div>`,
    });
  }
}
